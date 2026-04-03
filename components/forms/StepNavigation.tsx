import React from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  saveState = "idle",
}: StepNavigationProps) {
  const saveStateMeta = getShareExperienceSaveStateMeta(saveState);
  const hasValidationSummary = Boolean(validationSummary?.length);

  return (
    <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
      {hasValidationSummary && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <Icon
              icon="solar:danger-circle-linear"
              className="mt-0.5 h-4 w-4 text-red-600 dark:text-red-300"
            />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-700 dark:text-red-200">
                {typeof missingRequiredCount === "number" &&
                missingRequiredCount > 0
                  ? `${missingRequiredCount} required ${
                      missingRequiredCount === 1 ? "field" : "fields"
                    } still need attention`
                  : "Please fix the items below before continuing"}
              </p>
              <ul className="space-y-1 text-sm text-red-700 dark:text-red-200">
                {validationSummary?.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium",
                saveStateMeta.badgeClassName,
              )}
            >
              <Icon
                icon={saveStateMeta.icon}
                className={cn(
                  "h-3.5 w-3.5",
                  saveState === "saving" && "animate-spin",
                )}
              />
              {saveStateMeta.label}
            </span>
            {typeof missingRequiredCount === "number" && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {missingRequiredCount} required{" "}
                {missingRequiredCount === 1 ? "field" : "fields"} left
              </span>
            )}
          </div>
          {helperText && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {helperText}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {showPrevious && currentStep > 1 && onPrevious && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 border-slate-200 px-6 transition-all hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 sm:w-auto"
              >
                <Icon icon="solar:arrow-left-linear" className="h-4 w-4" />
                Previous
              </Button>
            </motion.div>
          )}

          {onSaveDraft && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSubmitting || saveState === "saving"}
                className="flex w-full items-center justify-center gap-2 border-slate-200 px-6 transition-all hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 sm:w-auto"
              >
                <Icon icon="solar:diskette-linear" className="h-4 w-4" />
                Save Draft
              </Button>
            </motion.div>
          )}

          {isLastStep
            ? onSubmit && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={!canProceed || isSubmitting}
                    className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-white shadow-lg shadow-violet-500/20 transition-all hover:from-violet-700 hover:to-fuchsia-700 sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Icon
                          icon="solar:check-circle-linear"
                          className="h-4 w-4"
                        />
                        Submit Experience
                      </>
                    )}
                  </Button>
                </motion.div>
              )
            : onNext && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    onClick={onNext}
                    disabled={!canProceed || isSubmitting}
                    className="flex w-full items-center justify-center gap-2 bg-slate-900 px-8 text-white shadow-lg transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:w-auto"
                  >
                    Continue
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="h-4 w-4"
                    />
                  </Button>
                </motion.div>
              )}
        </div>
      </div>
    </div>
  );
}
