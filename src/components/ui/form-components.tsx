import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  labelClassName?: string;
  fieldId?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      children,
      label,
      required,
      error,
      helperText,
      className,
      labelClassName,
      fieldId,
      ...props
    },
    ref,
  ) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <label
            htmlFor={fieldId}
            className={cn(
              "block text-sm font-medium text-gray-700",
              error && "text-red-700",
              labelClassName,
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">{children}</div>

        {/* Error message with proper spacing */}
        {error && (
          <p
            className="text-sm text-red-500 leading-relaxed mt-1.5"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper text when no error */}
        {!error && helperText && (
          <p className="text-sm text-gray-500 leading-relaxed mt-1.5">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
FormField.displayName = "FormField";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, subtitle, children, className, icon: Icon, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-6", className)} {...props}>
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-5 w-5 text-blue-600" />}
          <div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    );
  },
);
FormSection.displayName = "FormSection";

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
  mobileColumns?: 1 | 2;
}

const FormGrid = React.forwardRef<HTMLDivElement, FormGridProps>(
  ({ children, columns = 2, mobileColumns = 1, className, ...props }, ref) => {
    const gridClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    };

    const mobileGridClasses = {
      1: "grid-cols-1",
      2: "grid-cols-2",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-4",
          mobileGridClasses[mobileColumns],
          columns > 1 && gridClasses[columns],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
FormGrid.displayName = "FormGrid";

interface DisabledFieldHintProps {
  message: string;
  className?: string;
}

const DisabledFieldHint = React.forwardRef<
  HTMLParagraphElement,
  DisabledFieldHintProps
>(({ message, className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        "text-xs text-gray-400 mt-1 italic flex items-center space-x-1",
        className,
      )}
      {...props}
    >
      <span>💡</span>
      <span>{message}</span>
    </p>
  );
});
DisabledFieldHint.displayName = "DisabledFieldHint";

export { FormField, FormSection, FormGrid, DisabledFieldHint };
