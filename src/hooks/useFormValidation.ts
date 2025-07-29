import { useState } from "react";
import { toast } from "../hooks/use-toast";

export interface ValidationState {
  fieldErrors: Record<string, string>;
  formError: string | null;
}

export function useFormValidation() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const clearErrors = () => {
    setFieldErrors({});
    setFormError(null);
  };

  const setError = (message: string, field?: string) => {
    if (field) {
      setFieldErrors((prev) => ({ ...prev, [field]: message }));
    } else {
      setFormError(message);
      // Show toast only for form-level errors
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return {
    fieldErrors,
    formError,
    setError,
    clearErrors,
    setFieldErrors, // Add this to the returned object
    setFormError, // Add setFormError to the returned object
  };
}
