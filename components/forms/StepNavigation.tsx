import React from "react";

import { Button } from "@/components/ui/button";
import {
  type ShareExperienceSaveState,
  getShareExperienceSaveStateMeta,
} from "@/lib/shareExperienceUi";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onSaveDraft?: () => void | Promise<void>;
  onNext?: (e?: React.FormEvent | React.MouseEvent) => void | Promise<void>;
  onSubmit?: (e?: React.FormEvent | React.MouseEvent) => void | Promise<void>;
  canProceed?: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  showPrevious?: boolean;
  helperText?: string;
  missingRequiredCount?: number;
  validationSummary?: string[];
  validationTitle?: string;
  saveState?: ShareExperienceSaveState;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onSaveDraft,
  onNext,
  onSubmit,
  canProceed = true,
  isLastStep,
  isSubmitting = false,
  showPrevious = true,
  helperText,
  missingRequiredCount,
  validationSummary,
  validationTitle,
  saveState = "idle",
}: StepNavigationProps) {
  const saveStateMeta = getShareExperienceSaveStateMeta(saveState);
  const hasValidationSummary = Boolean(validationSummary?.length);

  return (
    <div className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-800">
      {hasValidationSummary && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50/70 p-3 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-700 dark:text-red-200">
            {validationTitle || "Please complete the required fields below."}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-200">
            {validationSummary?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{saveStateMeta.label}</span>
          {typeof missingRequiredCount === "number" && (
            <span>
              {missingRequiredCount} required{" "}
              {missingRequiredCount === 1 ? "field" : "fields"} left
            </span>
          )}
        </div>

        {helperText ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {showPrevious && currentStep > 1 && onPrevious ? (
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Previous
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {onSaveDraft ? (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSubmitting || saveState === "saving"}
                className="w-full sm:w-auto"
              >
                Save draft
              </Button>
            ) : null}

            {isLastStep ? (
              onSubmit ? (
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:w-auto"
                >
                  {isSubmitting ? "Submitting..." : "Submit experience"}
                </Button>
              ) : null
            ) : onNext ? (
              <Button
                type="button"
                onClick={onNext}
                disabled={!canProceed || isSubmitting}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:w-auto"
              >
                Continue
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
