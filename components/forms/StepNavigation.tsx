import React from "react";
import { Button } from "../../src/components/ui/button";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: (e?: React.FormEvent | React.MouseEvent) => void | Promise<void>;
  onSubmit?: (e?: React.FormEvent | React.MouseEvent) => void | Promise<void>;
  canProceed?: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  showPrevious?: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  canProceed = true,
  isLastStep,
  isSubmitting = false,
  showPrevious = true,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-8 mt-12 border-t border-slate-200 dark:border-slate-800">
      {/* Previous Button */}
      <div>
        {showPrevious && currentStep > 1 && onPrevious && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Icon icon="solar:arrow-left-linear" className="h-4 w-4" />
              Previous
            </Button>
          </motion.div>
        )}
      </div>

      {/* Step Counter */}
      <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Next/Submit Button */}
      <div className="flex items-center gap-3">
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
                  className="flex items-center gap-2 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-none shadow-lg shadow-violet-500/20 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
                  className="flex items-center gap-2 px-8 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white shadow-lg transition-all"
                >
                  Next Step
                  <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
      </div>
    </div>
  );
}
