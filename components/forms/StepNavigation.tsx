import React, { useState } from "react";
import { Button } from "../../src/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Save } from "lucide-react";

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
    <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
      {/* Previous Button */}
      <div>
        {showPrevious && currentStep > 1 && onPrevious && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting || isSavingDraft}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        )}
      </div>

      {/* Step Counter */}
      <div className="text-sm text-gray-600">
        Step {currentStep} of {totalSteps}
      </div>

      {/* Save Draft and Next/Submit Buttons */}
      <div className="flex items-center gap-3">
        {/* Save Draft Button */}
        {showSaveDraft && onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting || isSavingDraft}
            className="flex items-center gap-2"
          >
            {isSavingDraft ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
        )}

        {/* Next/Submit Button */}
        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting || isSavingDraft}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Submit Application
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed || isSubmitting || isSavingDraft}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
