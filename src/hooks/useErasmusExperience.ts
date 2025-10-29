import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

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
  submitExperience: (finalReflection?: any) => Promise<boolean>;
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
    // For now, we'll just initialize with empty data since forms handle their own data loading
    // This maintains compatibility while we transition to the unified system
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
          setData({
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
          });
          return;
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
        setData({
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
        });
      } else {
        const errorText = await createResponse.text();
        console.error("Failed to create experience:", errorText);
        throw new Error(
          `Failed to create experience: ${createResponse.status}`,
        );
      }
    } catch (err) {
      console.error("Error fetching Erasmus experience:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);

      // Don't set data at all if we couldn't create/load it
      // This will cause data?.id checks to properly fail
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save progress");
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
    async (finalReflection?: any): Promise<boolean> => {
      console.log("🔥 SUBMIT FUNCTION CALLED");

      if (!data?.id) {
        console.log("❌ No data.id", { data });
        const errorMsg =
          "No experience data found. Please refresh the page and fill out the form again.";
        setError(errorMsg);
        return false;
      }

      console.log("✅ Data exists, making API call");

      try {
        const response = await fetch("/api/erasmus-experiences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.id,
            action: "submit",
            overallReflection: finalReflection || {},
          }),
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
            `/submission-confirmation?submitted=true&timestamp=${encodeURIComponent(result.submittedAt)}`,
          );

          return true;
        } else {
          console.log("💥 API ERROR");
          const errorData = await response.json();
          const errorMsg = errorData.error || "Failed to submit experience";
          setError(errorMsg);
          return false;
        }
      } catch (err) {
        console.log("🚨 CATCH ERROR:", err);
        const errorMsg =
          err instanceof Error ? err.message : "Failed to submit experience";
        setError(errorMsg);
        return false;
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
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
