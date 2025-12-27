/*
 * Simple Form Components
 *
 * These components are for basic forms that don't require react-hook-form.
 * They provide consistent styling and structure without complex form state management.
 *
 * Components included:
 * - FormField: Container for form fields with label, error messages, and helper text
 * - FormSection: Groups related form fields with title and subtitle
 * - FormGrid: Responsive grid layout for form fields
 * - DisabledFieldHint: Shows hints for disabled fields
 * - ErrorMessage: Displays validation error messages
 *
 * For advanced forms with react-hook-form, use components from form.tsx instead.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

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
      <div ref={ref} className={cn("space-y-2.5", className)} {...props}>
        {label && (
          <label
            htmlFor={fieldId}
            className={cn(
              "block text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-200",
              error && "text-red-600 dark:text-red-400",
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

        <div className="relative group">{children}</div>

        {/* Error message with proper spacing */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium text-red-500 leading-relaxed mt-1.5 flex items-center gap-1"
            role="alert"
          >
            <Icon icon="solar:danger-circle-linear" className="w-3.5 h-3.5" />
            {error}
          </motion.p>
        )}

        {/* Helper text when no error */}
        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5 flex items-center gap-1">
            <Icon icon="solar:info-circle-linear" className="w-3.5 h-3.5" />
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
  icon?: string;
  variant?: "blue" | "purple" | "emerald" | "orange" | "indigo";
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  (
    { title, subtitle, children, className, icon, variant = "blue", ...props },
    ref,
  ) => {
    const variants = {
      blue: {
        accent: "bg-gradient-to-b from-blue-500 to-indigo-600",
        iconBg:
          "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      },
      purple: {
        accent: "bg-gradient-to-b from-purple-500 to-indigo-600",
        iconBg:
          "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      },
      emerald: {
        accent: "bg-gradient-to-b from-emerald-500 to-teal-600",
        iconBg:
          "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
      },
      orange: {
        accent: "bg-gradient-to-b from-orange-500 to-amber-600",
        iconBg:
          "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
      },
      indigo: {
        accent: "bg-gradient-to-b from-indigo-500 to-blue-600",
        iconBg:
          "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
      },
    };

    const currentVariant = variants[variant];

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(
          "bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden",
          className,
        )}
        {...props}
      >
        {/* Decorative accent line */}
        <div
          className={cn(
            "absolute top-0 left-0 w-1.5 h-full",
            currentVariant.accent,
          )}
        />

        <div className="flex items-start space-x-4 mb-8">
          {icon && (
            <div className={cn("p-3 rounded-2xl", currentVariant.iconBg)}>
              <Icon icon={icon} className="h-6 w-6" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">{children}</div>
      </motion.div>
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
          "grid gap-6 md:gap-8",
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
    <motion.p
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "text-xs text-slate-400 dark:text-slate-500 mt-2 italic flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800",
        className,
      )}
      {...props}
    >
      <Icon icon="solar:lock-linear" className="w-3.5 h-3.5 text-slate-400" />
      <span>{message}</span>
    </motion.p>
  );
});
DisabledFieldHint.displayName = "DisabledFieldHint";

interface ErrorMessageProps {
  children: React.ReactNode;
  className?: string;
}

const ErrorMessage = React.forwardRef<HTMLParagraphElement, ErrorMessageProps>(
  ({ children, className, ...props }, ref) => {
    if (!children) {
      return null;
    }

    return (
      <p
        ref={ref}
        className={cn("text-sm text-red-500 mt-1", className)}
        role="alert"
        {...props}
      >
        {children}
      </p>
    );
  },
);
ErrorMessage.displayName = "ErrorMessage";

export { FormField, FormSection, FormGrid, DisabledFieldHint, ErrorMessage };
