import { Check, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { brandingTokens } from "@/utils/brandingTokens";

interface ApplicationStep {
  id: string;
  name: string;
  href: string;
  description: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

interface ApplicationProgressProps {
  steps: ApplicationStep[];
  currentStepId?: string;
  className?: string;
  compact?: boolean;
}

export function ApplicationProgress({
  steps,
  currentStepId,
  className,
  compact = false,
}: ApplicationProgressProps) {
  const completedCount = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedCount / totalSteps) * 100;

  if (compact) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span
          className={cn(
            "text-xs font-medium",
            brandingTokens.colors.text.tertiary,
          )}
        >
          {completedCount}/{totalSteps}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className={cn(
              "text-sm font-medium",
              brandingTokens.colors.text.primary,
            )}
          >
            Application Progress
          </h3>
          <p className={cn("text-xs", brandingTokens.colors.text.tertiary)}>
            Step {Math.min(completedCount + 1, totalSteps)} of {totalSteps}
          </p>
        </div>
        <div
          className={cn(
            "text-sm font-semibold",
            brandingTokens.colors.text.accent,
          )}
        >
          {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isCurrent = step.current || step.id === currentStepId;
          const isLocked = step.locked;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center space-x-3 p-2 rounded-md transition-colors",
                isCurrent && "bg-blue-50 dark:bg-blue-900/20",
                !isLocked &&
                  "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800",
              )}
            >
              {/* Step Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                  isCompleted && "bg-green-100 dark:bg-green-900/30",
                  isCurrent &&
                    !isCompleted &&
                    "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900",
                  isLocked && "bg-gray-100 dark:bg-gray-700",
                  !isCurrent &&
                    !isCompleted &&
                    !isLocked &&
                    "bg-gray-100 dark:bg-gray-700",
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3 text-gray-400" />
                ) : (
                  <Circle
                    className={cn(
                      "w-3 h-3",
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400",
                    )}
                  />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCompleted && brandingTokens.colors.text.primary,
                      isCurrent &&
                        !isCompleted &&
                        brandingTokens.colors.text.accent,
                      isLocked && brandingTokens.colors.text.muted,
                      !isCurrent &&
                        !isCompleted &&
                        !isLocked &&
                        brandingTokens.colors.text.secondary,
                    )}
                  >
                    {step.name}
                  </span>
                  {isCompleted && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      Complete
                    </span>
                  )}
                  {isCurrent && !isCompleted && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs mt-0.5",
                    isLocked
                      ? brandingTokens.colors.text.muted
                      : brandingTokens.colors.text.tertiary,
                  )}
                >
                  {step.description}
                </p>
              </div>

              {/* Step Number */}
              <div
                className={cn(
                  "text-xs font-medium w-6 text-center",
                  isCompleted && "text-green-600 dark:text-green-400",
                  isCurrent && "text-blue-600 dark:text-blue-400",
                  isLocked && "text-gray-400",
                  !isCurrent && !isCompleted && !isLocked && "text-gray-500",
                )}
              >
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      {completedCount < totalSteps && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className={cn("text-sm", brandingTokens.colors.text.secondary)}>
            {completedCount === 0
              ? "Start your application journey today!"
              : `${totalSteps - completedCount} step${totalSteps - completedCount === 1 ? "" : "s"} remaining to complete your application.`}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to create step data from form submissions
export function createApplicationSteps(
  formSubmissions: any[],
  currentStep?: string,
): ApplicationStep[] {
  const stepMap = {
    "basic-info": {
      name: "Basic Information",
      description: "Personal & academic details",
      href: "/basic-information",
    },
    "course-matching": {
      name: "Course Matching",
      description: "Select courses and universities",
      href: "/course-matching",
    },
    accommodation: {
      name: "Accommodation",
      description: "Housing preferences",
      href: "/accommodation",
    },
    "living-expenses": {
      name: "Living Expenses",
      description: "Budget and cost planning",
      href: "/living-expenses",
    },
  };

  const steps: ApplicationStep[] = [];
  const stepKeys = Object.keys(stepMap) as Array<keyof typeof stepMap>;

  stepKeys.forEach((stepId, index) => {
    const submission = formSubmissions?.find((sub) => sub.type === stepId);
    const isCompleted = submission && submission.status !== "DRAFT";
    const isCurrent = currentStep === stepId;

    // Lock steps that haven't been unlocked by completing previous steps
    const previousStepsCompleted =
      index === 0 || steps.slice(0, index).every((s) => s.completed);
    const isLocked = !previousStepsCompleted && !isCompleted;

    steps.push({
      id: stepId,
      name: stepMap[stepId].name,
      description: stepMap[stepId].description,
      href: stepMap[stepId].href,
      completed: isCompleted,
      current: isCurrent,
      locked: isLocked,
    });
  });

  return steps;
}
