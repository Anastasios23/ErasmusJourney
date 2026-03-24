import { useState, useEffect, useCallback } from "react";
import { isAccommodationStepComplete } from "../lib/accommodation";
import { isBasicInformationComplete } from "../lib/basicInformation";
import { hasCompleteCourseMatchingData } from "../lib/courseMatching";
import {
  ERASMUS_PROGRESS_SYNC_EVENT,
  isErasmusProgressSyncStorageEvent,
} from "../lib/erasmusProgressSync";
import { isLivingExpensesStepComplete } from "../lib/livingExpenses";
import { getNextAccessibleShareExperienceStep } from "../lib/shareExperienceStepAccess";

export interface StepCompletion {
  basicInfo: boolean;
  courses: boolean;
  accommodation: boolean;
  livingExpenses: boolean;
  experience: boolean;
}

export interface ErasmusProgress {
  completedSteps: StepCompletion;
  totalSteps: number;
  completedCount: number;
  progressPercentage: number;
  currentStep: number; // Next incomplete step (1-5)
  experienceData: any | null;
  loading: boolean;
  error: string | null;
  refreshProgress: () => Promise<void>;
}

/**
 * Hook to track progress through the 5-step Erasmus experience form
 * Checks which JSON fields are populated in erasmus_experiences table
 */
export function useErasmusProgress(): ErasmusProgress {
  const [experienceData, setExperienceData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;

    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      // Fetch the user's erasmus experience
      const response = await fetch("/api/erasmus-experiences");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Failed to fetch experience data: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();

      // If it's an array, get the first one (current user's experience)
      const experience = Array.isArray(data) ? data[0] : data;

      setExperienceData(experience);
    } catch (err) {
      console.error("Error fetching erasmus progress:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const refreshSilently = () => {
      void fetchProgress({ silent: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSilently();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (isErasmusProgressSyncStorageEvent(event)) {
        refreshSilently();
      }
    };

    window.addEventListener(ERASMUS_PROGRESS_SYNC_EVENT, refreshSilently);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshSilently);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener(ERASMUS_PROGRESS_SYNC_EVENT, refreshSilently);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshSilently);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [fetchProgress]);

  // Calculate completion status for each step
  const calculateCompletion = useCallback((): StepCompletion => {
    if (!experienceData) {
      return {
        basicInfo: false,
        courses: false,
        accommodation: false,
        livingExpenses: false,
        experience: false,
      };
    }

    return {
      // Step 1: Basic Info - check if required fields exist
      basicInfo: isBasicInformationComplete(experienceData.basicInfo),

      // Step 2: Courses - check if courses array has at least one complete course
      courses: hasCompleteCourseMatchingData(experienceData.courses),

      // Step 3: Accommodation - check if accommodation object has required fields
      accommodation: isAccommodationStepComplete(experienceData.accommodation),

      // Step 4: Living Expenses - require canonical Step 4 fields only
      livingExpenses: isLivingExpensesStepComplete(
        experienceData.livingExpenses,
      ),

      // Step 5: Experience/Story - check if experience object has content
      experience: !!(
        experienceData.experience &&
        typeof experienceData.experience === "object" &&
        Object.keys(experienceData.experience).length > 0 &&
        (experienceData.experience.overallExperience ||
          experienceData.experience.tipsForFutureStudents ||
          experienceData.experience.helpForStudents)
      ),
    };
  }, [experienceData]);

  const completedSteps = calculateCompletion();
  const totalSteps = 5;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  const currentStep = getNextAccessibleShareExperienceStep(experienceData);

  return {
    completedSteps,
    totalSteps,
    completedCount,
    progressPercentage,
    currentStep,
    experienceData,
    loading,
    error,
    refreshProgress: () => fetchProgress({ silent: true }),
  };
}
