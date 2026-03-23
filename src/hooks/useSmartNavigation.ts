import { useMemo } from "react";
import { useRouter } from "next/router";
import { useFormSubmissions } from "./useFormSubmissions";

export interface SmartNavigationStep {
  id: string;
  name: string;
  href: string;
  description: string;
  completed: boolean;
  current: boolean;
  nextRecommended: boolean;
  urgency: "low" | "medium" | "high";
  estimatedTime: string;
}

function getCurrentUnifiedFormStep(
  pathname: string,
  step: string | string[] | undefined,
): number | null {
  if (pathname !== "/share-experience" || typeof step !== "string") {
    return null;
  }

  const parsed = Number(step);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export function useSmartNavigation() {
  const router = useRouter();
  const { submissions } = useFormSubmissions();

  const smartSteps = useMemo(() => {
    const stepDefinitions = [
      {
        id: "basic-info",
        name: "Basic Information",
        href: "/share-experience?step=1",
        description: "Personal & academic details",
        estimatedTime: "10 min",
        stepNumber: 1,
      },
      {
        id: "course-matching",
        name: "Course Matching",
        href: "/share-experience?step=2",
        description: "Select courses and universities",
        estimatedTime: "15 min",
        stepNumber: 2,
      },
      {
        id: "accommodation",
        name: "Accommodation",
        href: "/share-experience?step=3",
        description: "Housing preferences",
        estimatedTime: "12 min",
        stepNumber: 3,
      },
      {
        id: "living-expenses",
        name: "Living Expenses",
        href: "/share-experience?step=4",
        description: "Budget and cost planning",
        estimatedTime: "8 min",
        stepNumber: 4,
      },
      {
        id: "experience",
        name: "Share Experience",
        href: "/share-experience?step=5",
        description: "Tips for future students",
        estimatedTime: "12 min",
        stepNumber: 5,
      },
    ];

    const currentUnifiedFormStep = getCurrentUnifiedFormStep(
      router.pathname,
      router.query.step,
    );

    const steps: SmartNavigationStep[] = stepDefinitions.map((step, index) => {
      const submission = submissions?.find((sub) => sub.type === step.id);
      const isCompleted = submission && submission.status !== "draft";
      const isCurrent =
        router.pathname === "/share-experience" &&
        currentUnifiedFormStep === step.stepNumber;

      // Determine if this is the next recommended step
      const previousStepsCompleted =
        index === 0 ||
        stepDefinitions.slice(0, index).every((prevStep) => {
          const prevSubmission = submissions?.find(
            (sub) => sub.type === prevStep.id,
          );
          return prevSubmission && prevSubmission.status !== "draft";
        });

      const nextRecommended = !isCompleted && previousStepsCompleted;

      // Calculate urgency based on completion status and position
      let urgency: "low" | "medium" | "high" = "low";
      if (nextRecommended) {
        urgency = index === 0 ? "high" : "medium"; // First step is high priority
      } else if (!isCompleted && index > 0) {
        urgency = "low"; // Future steps are low priority until unlocked
      }

      return {
        id: step.id,
        name: step.name,
        href: step.href,
        description: step.description,
        completed: isCompleted,
        current: isCurrent,
        nextRecommended,
        urgency,
        estimatedTime: step.estimatedTime,
      };
    });

    return steps;
  }, [submissions, router.pathname, router.query.step]);

  // Analytics and recommendations
  const analytics = useMemo(() => {
    const completed = smartSteps.filter((step) => step.completed);
    const nextStep = smartSteps.find((step) => step.nextRecommended);
    const totalSteps = smartSteps.length;
    const progressPercentage = (completed.length / totalSteps) * 100;

    // Calculate estimated time remaining
    const remainingSteps = smartSteps.filter((step) => !step.completed);
    const estimatedTimeRemaining = remainingSteps.reduce((total, step) => {
      const minutes = parseInt(step.estimatedTime.replace(" min", ""));
      return total + minutes;
    }, 0);

    return {
      completedSteps: completed.length,
      totalSteps,
      progressPercentage,
      nextStep,
      estimatedTimeRemaining,
      isComplete: completed.length === totalSteps,
      urgentSteps: smartSteps.filter((step) => step.urgency === "high"),
      recommendedActions: generateRecommendations(smartSteps, nextStep),
    };
  }, [smartSteps]);

  return {
    steps: smartSteps,
    analytics,
    // Helper functions
    getStepByHref: (href: string) =>
      smartSteps.find((step) => step.href === href),
    getNextStep: () => smartSteps.find((step) => step.nextRecommended),
    getCompletedSteps: () => smartSteps.filter((step) => step.completed),
    shouldHighlightStep: (stepId: string) => {
      const step = smartSteps.find((s) => s.id === stepId);
      return step?.nextRecommended || step?.urgency === "high";
    },
  };
}

function generateRecommendations(
  steps: SmartNavigationStep[],
  nextStep?: SmartNavigationStep,
): string[] {
  const recommendations: string[] = [];
  const completedCount = steps.filter((s) => s.completed).length;

  if (completedCount === 0) {
    recommendations.push(
      "Start with your Basic Information to begin your Erasmus journey",
    );
  } else if (nextStep) {
    recommendations.push(
      `Continue with ${nextStep.name} (${nextStep.estimatedTime})`,
    );
  } else if (completedCount === steps.length) {
    recommendations.push("Great! You've completed all application steps");
  }

  // Add contextual tips based on current progress
  if (completedCount === 1) {
    recommendations.push(
      "Complete at least 2 steps to unlock accommodation recommendations",
    );
  } else if (completedCount === 2) {
    recommendations.push(
      "You're halfway there! Keep going to unlock all features",
    );
  }

  return recommendations;
}
