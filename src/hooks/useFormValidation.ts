import { useState, useCallback } from "react";
import { toast } from "../hooks/use-toast";

export interface ValidationState {
  fieldErrors: Record<string, string>;
  formError: string | null;
}

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface ValidationConfig {
  [fieldName: string]: ValidationRule;
}

export function useFormValidation(config?: ValidationConfig) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback(
    (name: string, value: any): string | null => {
      if (!config || !config[name]) return null;

      const rule = config[name];

      // Required validation
      if (
        rule.required &&
        (!value || (typeof value === "string" && !value.trim()))
      ) {
        return getRequiredMessage(name);
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === "string" && !value.trim())) {
        return null;
      }

      // String validations
      if (typeof value === "string") {
        // Min length validation
        if (rule.minLength && value.length < rule.minLength) {
          return getMinLengthMessage(name, rule.minLength);
        }

        // Max length validation
        if (rule.maxLength && value.length > rule.maxLength) {
          return getMaxLengthMessage(name, rule.maxLength);
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
          return getPatternMessage(name, rule.pattern);
        }
      }

      // Custom validation
      if (rule.custom) {
        return rule.custom(value);
      }

      return null;
    },
    [config],
  );

  const validate = useCallback(
    (data: { [key: string]: any }) => {
      if (!config) return true;

      const newErrors: Record<string, string> = {};
      let isValid = true;

      Object.keys(config).forEach((fieldName) => {
        const error = validateField(fieldName, data[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });

      setFieldErrors(newErrors);
      return isValid;
    },
    [config, validateField],
  );

  const validateSingle = useCallback(
    (name: string, value: any) => {
      const error = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error || "",
      }));
      return !error;
    },
    [validateField],
  );

  const touchField = useCallback((name: string) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const clearErrors = () => {
    setFieldErrors({});
    setFormError(null);
    setTouched({});
  };

  const clearFieldError = useCallback((name: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

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
    touched,
    setError,
    clearErrors,
    clearFieldError,
    validate,
    validateSingle,
    touchField,
    setFieldErrors,
    setFormError,
    hasErrors: Object.keys(fieldErrors).length > 0,
    getFieldError: (name: string) => (touched[name] ? fieldErrors[name] : null),
  };
}

// Helper functions for generating user-friendly error messages
function getRequiredMessage(fieldName: string): string {
  const fieldLabels: { [key: string]: string } = {
    email: "Email address",
    password: "Password",
    firstName: "First name",
    lastName: "Last name",
    universityInCyprus: "Home university",
    hostUniversity: "Host university",
    hostCountry: "Host country",
    hostCity: "Host city",
    monthlyBudget: "Monthly budget",
    accommodationType: "Accommodation type",
    monthlyRent: "Monthly rent",
    rating: "Rating",
    city: "City",
    country: "Country",
  };

  const label =
    fieldLabels[fieldName] ||
    fieldName.replace(/([A-Z])/g, " $1").toLowerCase();
  return `${label.charAt(0).toUpperCase() + label.slice(1)} is required`;
}

function getMinLengthMessage(fieldName: string, minLength: number): string {
  const fieldLabels: { [key: string]: string } = {
    password: "Password",
    firstName: "First name",
    lastName: "Last name",
    description: "Description",
    tips: "Tips",
    pros: "Pros",
    cons: "Cons",
  };

  const label =
    fieldLabels[fieldName] ||
    fieldName.replace(/([A-Z])/g, " $1").toLowerCase();

  if (fieldName === "password") {
    return `Password must be at least ${minLength} characters for security`;
  }

  return `${label.charAt(0).toUpperCase() + label.slice(1)} must be at least ${minLength} characters`;
}

function getMaxLengthMessage(fieldName: string, maxLength: number): string {
  const fieldLabels: { [key: string]: string } = {
    description: "Description",
    tips: "Tips",
    firstName: "First name",
    lastName: "Last name",
  };

  const label =
    fieldLabels[fieldName] ||
    fieldName.replace(/([A-Z])/g, " $1").toLowerCase();
  return `${label.charAt(0).toUpperCase() + label.slice(1)} cannot exceed ${maxLength} characters`;
}

function getPatternMessage(fieldName: string, pattern: RegExp): string {
  if (fieldName === "email") {
    return "Please enter a valid email address (e.g., john@example.com)";
  }

  if (fieldName === "monthlyBudget" || fieldName === "monthlyRent") {
    return "Please enter a valid amount (numbers only)";
  }

  if (fieldName === "rating") {
    return "Rating must be between 1 and 5";
  }

  return "Please enter a valid format";
}

// Common validation rules
export const commonValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 8,
  },
  requiredText: {
    required: true,
    minLength: 2,
  },
  optionalText: {
    maxLength: 500,
  },
  currency: {
    pattern: /^\d+(\.\d{1,2})?$/,
  },
  rating: {
    pattern: /^[1-5]$/,
  },
};
