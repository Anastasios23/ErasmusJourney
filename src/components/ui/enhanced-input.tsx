import * as React from "react";
import { cn } from "@/lib/utils";

interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    { className, type, error, helperText, containerClassName, icon, ...props },
    ref,
  ) => {
    return (
      <div className={cn("relative", containerClassName)}>
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            icon && "pl-10",
            // Enhanced disabled styling
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100",
            // Error styling
            error && "border-red-500 focus-visible:ring-red-500",
            className,
          )}
          ref={ref}
          {...props}
          value={props.value ?? ""}
        />

        {/* Error message with proper spacing */}
        {error && (
          <p className="mt-1.5 text-sm text-red-500 leading-relaxed">{error}</p>
        )}

        {/* Helper text when no error */}
        {!error && helperText && (
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
EnhancedInput.displayName = "EnhancedInput";

export { EnhancedInput };
