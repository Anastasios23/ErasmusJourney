import * as React from "react";
import { cn } from "@/lib/utils";

interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const EnhancedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  EnhancedTextareaProps
>(({ className, error, helperText, containerClassName, ...props }, ref) => {
  return (
    <div className={cn("relative", containerClassName)}>
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Enhanced disabled styling
          "disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200",
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
});
EnhancedTextarea.displayName = "EnhancedTextarea";

export { EnhancedTextarea };
