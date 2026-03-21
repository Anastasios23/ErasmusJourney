import { useState, useEffect, useCallback } from "react";
import { isAccommodationStepComplete } from "../lib/accommodation";
import { isBasicInformationComplete } from "../lib/basicInformation";
import { hasCompleteCourseMatchingData } from "../lib/courseMatching";

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
}

/**
 * Hook to track progress through the 5-step Erasmus experience form
 * Checks which JSON fields are populated in erasmus_experiences table
 */
export function useErasmusProgress(): ErasmusProgress {
  const [experienceData, setExperienceData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the user's erasmus experience
      const response = await fetch("/api/erasmus-experiences");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Failed to fetch experience data: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // If it's an array, get the first one (current user's experience)
      const experience = Array.isArray(data) ? data[0] : data;

      setExperienceData(experience);
    } catch (err) {
      console.error("Error fetching erasmus progress:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
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

      // Step 4: Living Expenses - check if expenses object exists with data
      livingExpenses: !!(
        experienceData.livingExpenses &&
        typeof experienceData.livingExpenses === "object" &&
        Object.keys(experienceData.livingExpenses).length > 0 &&
        experienceData.livingExpenses.expenses &&
        Object.keys(experienceData.livingExpenses.expenses).length > 0
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

  // Find the next incomplete step (1-5)
  const currentStep = completedSteps.basicInfo
    ? completedSteps.courses
      ? completedSteps.accommodation
        ? completedSteps.livingExpenses
          ? completedSteps.experience
            ? 5 // All complete
            : 5 // Experience incomplete
          : 4 // Living expenses incomplete
        : 3 // Accommodation incomplete
      : 2 // Courses incomplete
    : 1; // Basic info incomplete

  return {
    completedSteps,
    totalSteps,
    completedCount,
    progressPercentage,
    currentStep,
    experienceData,
    loading,
    error,
  };
}
