import React from "react";
import Link from "next/link";
import { Check, User, BookOpen, Home, Euro, Heart } from "lucide-react";

interface Step {
  number: number;
  name: string;
  href: string;
}

interface FormProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

const stepIcons = [User, BookOpen, Home, Euro, Heart];

export function FormProgressBar({
  steps,
  currentStep,
  completedSteps,
}: FormProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;
  const totalCompleted = completedSteps.length;

  return (
    <div className="mb-8">
      {/* Overall Progress Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
          {Math.round((totalCompleted / steps.length) * 100)}% Complete
        </span>
      </div>

      {/* Main Progress Bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="relative">
        {/* Connector Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            const isAccessible =
              isCompleted ||
              isCurrent ||
              completedSteps.includes(step.number - 1) ||
              step.number === 1;

            const StepIcon = stepIcons[index] || User;

            const StepContent = (
              <div className="flex flex-col items-center group cursor-pointer">
                {/* Circle with Icon */}
                <div
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 z-10
                    ${
                      isCompleted
                        ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                        : isCurrent
                          ? "bg-white dark:bg-gray-900 border-2 border-violet-500 text-violet-600 dark:text-violet-400 shadow-lg ring-4 ring-violet-100 dark:ring-violet-900/30"
                          : isAccessible
                            ? "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 group-hover:border-violet-400 group-hover:text-violet-500"
                            : "bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}

                  {/* Pulse Animation for Current Step */}
                  {isCurrent && (
                    <span className="absolute -inset-1 border-2 border-violet-500/30 rounded-full animate-pulse" />
                  )}

                  {/* Glow Effect for Completed */}
                  {isCompleted && (
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 blur-md opacity-30" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`
                      text-xs font-medium max-w-[80px] transition-colors duration-300 truncate
                      ${
                        isCurrent
                          ? "text-violet-600 dark:text-violet-400 font-semibold"
                          : isCompleted
                            ? "text-gray-700 dark:text-gray-300"
                            : isAccessible
                              ? "text-gray-500 dark:text-gray-400 group-hover:text-violet-500"
                              : "text-gray-300 dark:text-gray-600"
                      }
                    `}
                  >
                    {step.name}
                  </p>
                </div>
              </div>
            );

            return (
              <div key={step.number} className="relative z-10">
                {isAccessible ? (
                  <Link href={step.href} className="block">
                    {StepContent}
                  </Link>
                ) : (
                  <div className="cursor-not-allowed opacity-60">
                    {StepContent}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile-friendly Current Step Indicator */}
      <div className="mt-6 md:hidden">
        <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-2xl border border-violet-200/50 dark:border-violet-700/30">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            {(() => {
              const CurrentIcon = stepIcons[currentStep - 1] || User;
              return <CurrentIcon className="w-5 h-5" />;
            })()}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {steps[currentStep - 1]?.name || "Step"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalCompleted} of {steps.length} steps completed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
