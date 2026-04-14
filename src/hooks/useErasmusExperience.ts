import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  createEmptyAccommodationStepData,
  sanitizeAccommodationStepData,
} from "../lib/accommodation";
import { sanitizeCourseMappingsData } from "../lib/courseMatching";
import { publishErasmusProgressSync } from "../lib/erasmusProgressSync";
import {
  createEmptyLivingExpensesStepData,
  sanitizeLivingExpensesStepData,
} from "../lib/livingExpenses";
import {
  EXPERIENCE_STATUS,
  type ErasmusExperienceStatus,
} from "../lib/canonicalWorkflow";

interface ExperienceLoadResult {
  data: ErasmusExperienceData | null;
  error: string | null;
}

// Module-level deduplication tracker
const globalPendingExperienceRequests = new Map<
  string,
  Promise<ExperienceLoadResult>
>();
const globalExperienceCache = new Map<
  string,
  { data: any; timestamp: number }
>();
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
  status: ErasmusExperienceStatus;
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

function updateExperienceCache(
  userId: string | undefined,
  nextData: ErasmusExperienceData,
) {
  if (!userId) {
    return;
  }

  globalExperienceCache.set(`experience_${userId}`, {
    data: nextData,
    timestamp: Date.now(),
  });
}

async function getApiErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const payload = await response.json();

    return (
      payload?.details ||
      payload?.message ||
      payload?.error ||
      fallbackMessage
    );
  } catch {
    return fallbackMessage;
  }
}

export function useErasmusExperience(): UseErasmusExperienceReturn {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [data, setData] = useState<ErasmusExperienceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (sessionStatus === "loading") {
      return;
    }

    if (!session?.user?.id) {
      setData(null);
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
        const result = await globalPendingExperienceRequests.get(cacheKey);
        setData(result?.data ?? null);
        setError(result?.error ?? null);
        setLoading(false);
      } catch (err) {
        // Error already handled by the primary requester
      }
      return;
    }

    setLoading(true);
    setError(null);

    const requestPromise: Promise<ExperienceLoadResult> = (async () => {
      try {
        // Try to get existing experience from the new API
        const response = await fetch("/api/erasmus-experiences");

        if (!response.ok) {
          return {
            data: null,
            error: await getApiErrorMessage(
              response,
              `Failed to load experience: ${response.status}`,
            ),
          };
        }

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
            courses: sanitizeCourseMappingsData(experience.courses),
            accommodation: sanitizeAccommodationStepData(
              experience.accommodation,
            ),
            livingExpenses: sanitizeLivingExpensesStepData(
              experience.livingExpenses,
            ),
            experience: experience.experience || {},
            status: experience.status as ErasmusExperienceStatus,
            isComplete: experience.isComplete || false,
            hasSubmitted:
              experience.status === EXPERIENCE_STATUS.SUBMITTED ||
              experience.status === EXPERIENCE_STATUS.APPROVED ||
              experience.status === EXPERIENCE_STATUS.REJECTED,
            lastSavedAt: experience.lastSavedAt,
            submittedAt: experience.submittedAt,
          };

          globalExperienceCache.set(cacheKey, {
            data: mappedData,
            timestamp: Date.now(),
          });
          return { data: mappedData, error: null };
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
            accommodation: createEmptyAccommodationStepData(),
            livingExpenses: createEmptyLivingExpensesStepData(),
            experience: {},
            status: EXPERIENCE_STATUS.DRAFT,
            isComplete: false,
            hasSubmitted: false,
          };
          globalExperienceCache.set(cacheKey, {
            data: newData,
            timestamp: Date.now(),
          });
          return { data: newData, error: null };
        } else {
          return {
            data: null,
            error: await getApiErrorMessage(
              createResponse,
              `Failed to create experience: ${createResponse.status}`,
            ),
          };
        }
      } catch (err) {
        console.error("Error fetching Erasmus experience:", err);
        return {
          data: null,
          error: err instanceof Error ? err.message : "Failed to load data",
        };
      }
    })();

    globalPendingExperienceRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      setData(result.data);
      setError(result.error);
    } finally {
      globalPendingExperienceRequests.delete(cacheKey);
      setLoading(false);
    }
  }, [session?.user?.id, sessionStatus]);

  const saveProgress = useCallback(
    async (stepData: Partial<ErasmusExperienceData>): Promise<boolean> => {
      if (!data?.id) {
        const errorMsg =
          error || "No experience found. Please refresh the page and try again.";
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
          if (
            response.status === 503 ||
            errorMessage.toLowerCase().includes("database")
          ) {
            throw new Error(
              "Unable to connect to the database. Please try again when the connection is restored.",
            );
          }

          throw new Error(errorMessage);
        }

        const updatedExperience = await response.json();
        const nextData: ErasmusExperienceData = {
          ...data,
          ...stepData,
          courses:
            stepData.courses !== undefined
              ? sanitizeCourseMappingsData(stepData.courses)
              : data.courses,
          accommodation:
            stepData.accommodation !== undefined
              ? sanitizeAccommodationStepData(stepData.accommodation)
              : data.accommodation,
          livingExpenses:
            stepData.livingExpenses !== undefined
              ? sanitizeLivingExpensesStepData(stepData.livingExpenses)
              : data.livingExpenses,
          lastSavedAt: updatedExperience.lastSavedAt,
        };

        setData(nextData);
        updateExperienceCache(session?.user?.id, nextData);
        publishErasmusProgressSync({
          userId: session?.user?.id,
          experienceId: data.id,
          action: "save",
        });

        return true;
      } catch (err) {
        console.error("Error saving progress:", err);
        setError(
          err instanceof Error ? err.message : "Failed to save progress",
        );
        return false;
      }
    },
    [data, error, session?.user?.id],
  );

  const submitExperience = useCallback(
    async (submissionData?: any): Promise<boolean> => {
      console.log("🔥 SUBMIT FUNCTION CALLED", { submissionData });

      if (!data?.id) {
        console.log("❌ No data.id", { data });
        const errorMsg =
          error ||
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
          const nextData: ErasmusExperienceData = {
            ...data,
            status: EXPERIENCE_STATUS.SUBMITTED,
            isComplete: true,
            hasSubmitted: true,
            submittedAt: result.submittedAt,
          };

          setData(nextData);
          updateExperienceCache(session?.user?.id, nextData);
          publishErasmusProgressSync({
            userId: session?.user?.id,
            experienceId: data.id,
            action: "submit",
          });

          // Navigate to confirmation page
          const query = new URLSearchParams({
            submitted: "true",
            timestamp: String(result.submittedAt || Date.now()),
          });
          router.push(`/submission-confirmation?${query.toString()}`);

          return true;
        } else {
          console.log("💥 API ERROR");
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ API Error Response:", errorData);
          const errorMessage =
            errorData.details ||
            errorData.error ||
            `Failed to submit experience: ${response.status}`;

          if (
            response.status === 503 ||
            errorMessage.toLowerCase().includes("database")
          ) {
            throw new Error(
              "Unable to connect to the database. Please try again when the connection is restored.",
            );
          }

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
    [data, error, router, session?.user?.id],
  );

  const deleteExperience = useCallback(async (): Promise<boolean> => {
    console.error(
      "deleteExperience: /api/erasmus-experience/draft has been removed. " +
        "Draft deletion is not supported in this version.",
    );
    setError("Draft deletion is not currently available.");
    return false;
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Load data on mount and when session changes
  const lastSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    const sessionId = session?.user?.id || "anonymous";

    if (sessionId !== lastSessionId.current) {
      void fetchData();
      lastSessionId.current = sessionId;
    }
  }, [session?.user?.id, sessionStatus, fetchData]);

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
