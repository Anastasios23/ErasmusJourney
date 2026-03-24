import { useMemo } from "react";
import { useRouter } from "next/router";
import { useFormSubmissions } from "./useFormSubmissions";

interface NavigationSubmissionSummary {
  type: string;
  status: string;
}

interface SmartNavigationInput {
  pathname: string;
  step: string | string[] | undefined;
  submissions?: NavigationSubmissionSummary[];
}

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

const STEP_DEFINITIONS = [
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

export function buildSmartNavigation({
  pathname,
  step,
  submissions,
}: SmartNavigationInput) {
  const currentUnifiedFormStep = getCurrentUnifiedFormStep(pathname, step);

  const steps: SmartNavigationStep[] = STEP_DEFINITIONS.map((entry, index) => {
    const submission = submissions?.find((item) => item.type === entry.id);
    const isCompleted = Boolean(submission && submission.status !== "draft");
    const isCurrent =
      pathname === "/share-experience" &&
      currentUnifiedFormStep === entry.stepNumber;

    const previousStepsCompleted =
      index === 0 ||
      STEP_DEFINITIONS.slice(0, index).every((previousEntry) => {
        const previousSubmission = submissions?.find(
          (item) => item.type === previousEntry.id,
        );
        return Boolean(previousSubmission && previousSubmission.status !== "draft");
      });

    const nextRecommended = !isCompleted && previousStepsCompleted;

    let urgency: "low" | "medium" | "high" = "low";
    if (nextRecommended) {
      urgency = index === 0 ? "high" : "medium";
    } else if (!isCompleted && index > 0) {
      urgency = "low";
    }

    return {
      id: entry.id,
      name: entry.name,
      href: entry.href,
      description: entry.description,
      completed: isCompleted,
      current: isCurrent,
      nextRecommended,
      urgency,
      estimatedTime: entry.estimatedTime,
    };
  });

  const completed = steps.filter((entry) => entry.completed);
  const nextStep = steps.find((entry) => entry.nextRecommended);
  const totalSteps = steps.length;
  const progressPercentage = (completed.length / totalSteps) * 100;
  const remainingSteps = steps.filter((entry) => !entry.completed);
  const estimatedTimeRemaining = remainingSteps.reduce((total, entry) => {
    const minutes = parseInt(entry.estimatedTime.replace(" min", ""));
    return total + minutes;
  }, 0);

  const analytics = {
    completedSteps: completed.length,
    totalSteps,
    progressPercentage,
    nextStep,
    estimatedTimeRemaining,
    isComplete: completed.length === totalSteps,
    urgentSteps: steps.filter((entry) => entry.urgency === "high"),
    recommendedActions: generateRecommendations(steps, nextStep),
  };

  return {
    steps,
    analytics,
    getStepByHref: (href: string) => steps.find((entry) => entry.href === href),
    getNextStep: () => steps.find((entry) => entry.nextRecommended),
    getCompletedSteps: () => steps.filter((entry) => entry.completed),
    shouldHighlightStep: (stepId: string) => {
      const matchedStep = steps.find((entry) => entry.id === stepId);
      return Boolean(
        matchedStep?.nextRecommended || matchedStep?.urgency === "high",
      );
    },
  };
}

export function useSmartNavigation() {
  const router = useRouter();
  const { submissions } = useFormSubmissions();

  return useMemo(
    () =>
      buildSmartNavigation({
        pathname: router.pathname,
        step: router.query.step,
        submissions,
      }),
    [router.pathname, router.query.step, submissions],
  );
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
