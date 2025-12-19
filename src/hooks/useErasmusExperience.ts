import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

// Module-level deduplication tracker
const globalPendingExperienceRequests = new Map<string, Promise<any>>();
const globalExperienceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 1000; // 10 seconds cache for full experience data

interface ErasmusExperienceData {
  id?: string;
  currentStep: number;
  completedSteps: number[];
  basicInfo: any;
  courses: any;
  accommodation: any;
  livingExpenses: any;
  experience: any;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "SUBMITTED";
  isComplete: boolean;
  hasSubmitted: boolean;
  lastSavedAt?: string;
  submittedAt?: string;
  helpForStudents?: {
    wantToHelp?: boolean;
    contactMethod?: string;
    email?: string;
    instagramUsername?: string;
    facebookLink?: string;
    linkedinProfile?: string;
    personalWebsite?: string;
    phoneNumber?: string;
    preferredContactTime?: string;
    languagesSpoken?: string[];
    helpTopics?: string[];
    availabilityLevel?: string;
    mentorshipExperience?: string;
    additionalAdvice?: string;
    publicProfile?: string;
    allowPublicContact?: string;
    responseTime?: string;
    specializations?: string[];
    otherSpecialization?: string;
    funFact?: string;
    nickname?: string;
  };
}

interface UseErasmusExperienceReturn {
  data: ErasmusExperienceData | null;
  loading: boolean;
  error: string | null;
  saveProgress: (stepData: Partial<ErasmusExperienceData>) => Promise<boolean>;
  submitExperience: (submissionData?: any) => Promise<boolean>;
  deleteExperience: () => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function useErasmusExperience(): UseErasmusExperienceReturn {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ErasmusExperienceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Check if user is authenticated first
    if (!session?.user?.id) {
      console.log("No session found, skipping data fetch");
      setLoading(false);
      return;
    }

    const cacheKey = `experience_${session.user.id}`;
    const now = Date.now();
    
    // Check cache
    const cached = globalExperienceCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Check if a request is already in flight
    if (globalPendingExperienceRequests.has(cacheKey)) {
      try {
        const data = await globalPendingExperienceRequests.get(cacheKey);
        setData(data);
        setLoading(false);
      } catch (err) {
        // Error already handled by the primary requester
      }
      return;
    }

    const requestPromise = (async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get existing experience from the new API
        const response = await fetch("/api/erasmus-experiences");

        if (response.ok) {
          const experiences = await response.json();
          // Get the first experience (since we only allow one per user now)
          if (experiences.length > 0) {
            const experience = experiences[0];
            const mappedData: ErasmusExperienceData = {
              id: experience.id,
              currentStep: experience.currentStep || 1,
              completedSteps: experience.completedSteps
                ? JSON.parse(experience.completedSteps)
                : [],
              basicInfo: experience.basicInfo || {},
              courses: experience.courses || [],
              accommodation: experience.accommodation || {},
              livingExpenses: experience.livingExpenses || {},
              experience: experience.experience || {},
              status: experience.status as any,
              isComplete: experience.isComplete || false,
              hasSubmitted: experience.status === "SUBMITTED",
              lastSavedAt: experience.lastSavedAt,
              submittedAt: experience.submittedAt,
            };
            
            globalExperienceCache.set(cacheKey, { data: mappedData, timestamp: Date.now() });
            return mappedData;
          }
        }

        // If no experience exists, create one
        const createResponse = await fetch("/api/erasmus-experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create" }),
        });

        if (createResponse.ok) {
          const newExperience = await createResponse.json();
          const newData: ErasmusExperienceData = {
            id: newExperience.id,
            currentStep: 1,
            completedSteps: [],
            basicInfo: {},
            courses: [],
            accommodation: {},
            livingExpenses: {},
            experience: {},
            status: "DRAFT",
            isComplete: false,
            hasSubmitted: false,
          };
          globalExperienceCache.set(cacheKey, { data: newData, timestamp: Date.now() });
          return newData;
        } else {
          const errorText = await createResponse.text();
          throw new Error(`Failed to create experience: ${createResponse.status}`);
        }
      } catch (err) {
        console.error("Error fetching Erasmus experience:", err);
        throw err;
      }
    })();

    globalPendingExperienceRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      setData(null);
    } finally {
      globalPendingExperienceRequests.delete(cacheKey);
      setLoading(false);
    }
  }, [session?.user?.id]);

  const saveProgress = useCallback(
    async (stepData: Partial<ErasmusExperienceData>): Promise<boolean> => {
      if (!data?.id) {
        const errorMsg =
          "No experience found. Please refresh the page and try again.";
        setError(errorMsg);
        console.error("saveProgress failed: no data.id", { data });
        return false;
      }

      try {
        setError(null);

        const response = await fetch("/api/erasmus-experiences", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: data.id,
            ...stepData,
          }),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Network error" }));
          const errorMessage =
            errorData.error || errorData.details || "Failed to save progress";

          // More user-friendly error messages
          if (response.status === 500 && errorMessage.includes("database")) {
            throw new Error(
              "Unable to connect to database. Your changes will be saved when connection is restored.",
            );
          }

          throw new Error(errorMessage);
        }

        const updatedExperience = await response.json();

        // Update local data
        setData((prev) =>
          prev
            ? {
                ...prev,
                ...stepData,
                lastSavedAt: updatedExperience.lastSavedAt,
              }
            : null,
        );

        return true;
      } catch (err) {
        console.error("Error saving progress:", err);
        setError(
          err instanceof Error ? err.message : "Failed to save progress",
        );
        return false;
      }
    },
    [data?.id],
  );

  const submitExperience = useCallback(
    async (submissionData?: any): Promise<boolean> => {
      console.log("🔥 SUBMIT FUNCTION CALLED", { submissionData });

      if (!data?.id) {
        console.log("❌ No data.id", { data });
        const errorMsg =
          "No experience data found. Please refresh the page and fill out the form again.";
        setError(errorMsg);
        return false;
      }

      console.log("✅ Data exists, making API call");

      try {
        // Prepare the submission payload
        const payload: any = {
          id: data.id,
          action: "submit",
        };

        // If submissionData is provided, include all the form data
        if (submissionData) {
          // Include all step data
          if (submissionData.basicInfo)
            payload.basicInfo = submissionData.basicInfo;
          if (submissionData.courses) payload.courses = submissionData.courses;
          if (submissionData.accommodation)
            payload.accommodation = submissionData.accommodation;
          if (submissionData.livingExpenses)
            payload.livingExpenses = submissionData.livingExpenses;
          if (submissionData.experience)
            payload.experience = submissionData.experience;

          // Handle overallReflection for backward compatibility
          if (submissionData.overallReflection) {
            payload.overallReflection = submissionData.overallReflection;
          }
        }

        console.log("📤 Sending submission payload:", payload);

        const response = await fetch("/api/erasmus-experiences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        console.log("📡 API response:", response.status, response.ok);

        if (response.ok) {
          const result = await response.json();
          console.log("🎉 SUCCESS:", result);

          // Update local state
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  status: "SUBMITTED",
                  isComplete: true,
                  submittedAt: result.submittedAt,
                }
              : null,
          );

          // Navigate to confirmation page
          router.push(
            `/submission-confirmation?submitted=true&timestamp=${encodeURIComponent(
              result.submittedAt,
            )}`,
          );

          return true;
        } else {
          console.log("💥 API ERROR");
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ API Error Response:", errorData);
          const errorMessage =
            errorData.details ||
            errorData.error ||
            `Failed to submit experience: ${response.status}`;
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.log("🚨 CATCH ERROR:", err);
        const errorMsg =
          err instanceof Error ? err.message : "Failed to submit experience";
        setError(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data?.id, router],
  );

  const deleteExperience = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.id) {
      setError("Authentication required");
      return false;
    }

    if (data?.hasSubmitted) {
      setError("Submitted experience cannot be deleted");
      return false;
    }

    try {
      setError(null);

      const response = await fetch(
        `/api/erasmus-experience/draft?userId=${(session as any).user.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete experience");
      }

      // Reset to default data
      setData({
        currentStep: 1,
        completedSteps: [],
        basicInfo: null,
        courses: null,
        accommodation: null,
        livingExpenses: null,
        experience: null,
        status: "DRAFT",
        isComplete: false,
        hasSubmitted: false,
      });

      return true;
    } catch (err) {
      console.error("Error deleting experience:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete experience",
      );
      return false;
    }
  }, [(session as any)?.user?.id, data?.hasSubmitted]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Load data on mount and when session changes
  const lastSessionId = useRef<string | null>(null);

  useEffect(() => {
    const sessionId = session?.user?.id || "anonymous";

    if (sessionId !== lastSessionId.current) {
      fetchData();
      lastSessionId.current = sessionId;
    }
  }, [session?.user?.id, fetchData]);

  return {
    data,
    loading,
    error,
    saveProgress,
    submitExperience,
    deleteExperience,
    refreshData,
  };
}
