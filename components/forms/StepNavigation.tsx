import React, { useState } from "react";
import { Button } from "../../src/components/ui/button";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: (e?: React.FormEvent | React.MouseEvent) => void | Promise<void>;
  onSubmit?: (e?: React.FormEvent | React.MouseEvent) => void | Promise<void>;
  onSaveDraft?: () => Promise<void>;
  canProceed: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  showPrevious?: boolean;
  showSaveDraft?: boolean;
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  onSaveDraft,
  canProceed,
  isLastStep,
  isSubmitting = false,
  showPrevious = true,
  showSaveDraft = true,
}: StepNavigationProps) {
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    try {
      setIsSavingDraft(true);
      await onSaveDraft();
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsSavingDraft(false);
    }
  };

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
              disabled={isSubmitting || isSavingDraft}
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

      {/* Save Draft and Next/Submit Buttons */}
      <div className="flex items-center gap-3">
        {/* Save Draft Button */}
        {showSaveDraft && onSaveDraft && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isSavingDraft}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              {isSavingDraft ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-linear" className="h-4 w-4" />
                  Save Draft
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Next/Submit Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {isLastStep ? (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={!canProceed || isSubmitting || isSavingDraft}
              className="flex items-center gap-2 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-none shadow-lg shadow-violet-500/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <Icon icon="solar:check-circle-linear" className="h-4 w-4" />
                  Submit Experience
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onNext}
              disabled={!canProceed || isSubmitting || isSavingDraft}
              className="flex items-center gap-2 px-8 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white shadow-lg transition-all"
            >
              Next Step
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
