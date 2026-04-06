import React from "react";
import { Icon } from "@iconify/react";

import { cn } from "@/lib/utils";

interface Step {
  number: number;
  name: string;
  href?: string;
  isClickable?: boolean;
  isLocked?: boolean;
  lockedReason?: string;
}

interface FormProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepNumber: number) => void;
}

export function FormProgressBar({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: FormProgressBarProps) {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          const isLocked = Boolean(step.isLocked);
          const isClickable = Boolean(step.isClickable) && Boolean(onStepClick);

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isClickable}
              aria-current={isCurrent ? "step" : undefined}
              title={isLocked ? step.lockedReason : undefined}
              onClick={() => {
                if (isClickable) {
                  onStepClick?.(step.number);
                }
              }}
              className={cn(
                "rounded-md border px-3 py-3 text-left transition-colors",
                isCurrent
                  ? "border-gray-900 bg-gray-100 text-gray-900"
                  : isCompleted
                    ? "border-gray-300 bg-white text-gray-900"
                    : isLocked
                      ? "border-gray-200 bg-gray-50 text-gray-400"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                !isClickable && "cursor-not-allowed",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
                    isCurrent
                      ? "border-gray-900 bg-gray-900 text-white"
                      : isCompleted
                        ? "border-gray-900 bg-gray-900 text-white"
                        : isLocked
                          ? "border-gray-300 bg-gray-100 text-gray-400"
                          : "border-current text-current",
                  )}
                >
                  {isCompleted ? (
                    <Icon
                      icon="solar:check-circle-linear"
                      className="h-3.5 w-3.5"
                    />
                  ) : isLocked ? (
                    <Icon
                      icon="solar:lock-keyhole-linear"
                      className="h-3.5 w-3.5"
                    />
                  ) : (
                    step.number
                  )}
                </span>
                <span className="truncate text-sm font-medium">{step.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
