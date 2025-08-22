import { useState } from "react";
import { useRouter } from "next/router";
import { useFormProgress } from "../context/FormProgressContext";
import { useFormSubmissions } from "./useFormSubmissions";
import { FormType } from "../types/forms";
import { toast } from "sonner";

interface SubmitterOptions {
  formType: FormType;
  formTitle: string;
  nextPageUrl: string;
  onBeforeSubmit?: () => void;
  onAfterSubmit?: () => void;
  validateForm?: (
    formData: any,
  ) => boolean | { valid: boolean; errors: Record<string, string> };
}

export function useFormSubmitter(options: SubmitterOptions) {
  const {
    formType,
    formTitle,
    nextPageUrl,
    onBeforeSubmit,
    onAfterSubmit,
    validateForm,
  } = options;

  const router = useRouter();
  const { markStepCompleted } = useFormProgress();
  const { submitForm, getBasicInfoId } = useFormSubmissions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (formData: any) => {
    if (isSubmitting) return;

    // Reset states
    setSubmitError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // Custom validation if provided
      if (validateForm) {
        const validation = validateForm(formData);
        if (validation === false) {
          throw new Error("Form validation failed");
        } else if (typeof validation === "object" && !validation.valid) {
          setFieldErrors(validation.errors);
          throw new Error("Please fix the validation errors");
        }
      }

      // Call before submit hook if provided
      if (onBeforeSubmit) {
        onBeforeSubmit();
      }

      const basicInfoId = getBasicInfoId();

      // Submit the form
      const response = await submitForm(
        formType,
        formTitle,
        formData,
        "submitted",
        basicInfoId,
      );

      if (response?.submissionId) {
        // Clean up localStorage
        localStorage.removeItem(`erasmus_draft_${formType}`);

        // Mark step as completed
        // Map legacy/extra FormType values to a valid FormStep for progress tracking
        const validFormStep = (
          formType === "story" || formType === "experience"
            ? "help-future-students"
            : formType
        ) as any;
        markStepCompleted(validFormStep);

        // Call after submit hook if provided
        if (onAfterSubmit) {
          onAfterSubmit();
        }

        // Show success toast
        toast.success("Information saved successfully!");

        // Navigate to next page
        router.push(nextPageUrl);
      } else {
        throw new Error("No submission ID received");
      }
    } catch (error: any) {
      console.error(`Error submitting ${formType} form:`, error);
      setSubmitError(error.message || "Failed to submit form");
      toast.error(error.message || "Failed to submit form");
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitError,
    fieldErrors,
    setFieldErrors,
    handleSubmit,
  };
}
