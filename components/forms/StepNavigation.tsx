import React from "react";
import { Button } from "../../src/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  canProceed: boolean;
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
  canProceed,
  isLastStep,
  isSubmitting = false,
  showPrevious = true,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
      {/* Previous Button */}
      <div>
        {showPrevious && currentStep > 1 && onPrevious && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
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

      {/* Next/Submit Button */}
      <div>
        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
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
            disabled={!canProceed || isSubmitting}
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
