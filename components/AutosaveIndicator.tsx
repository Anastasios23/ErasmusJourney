import React from "react";

interface AutosaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  className?: string;
}

export function AutosaveIndicator({
  isSaving,
  lastSaved,
  error,
  className = "",
}: AutosaveIndicatorProps) {
  if (isSaving) {
    return (
      <div
        className={`flex items-center gap-2 text-blue-600 text-sm ${className}`}
      >
        <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full" />
        <span>Saving...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center gap-2 text-red-600 text-sm ${className}`}
      >
        <span>⚠️ {error}</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div
        className={`flex items-center gap-2 text-green-600 text-sm ${className}`}
      >
        <span>✓ Saved at {lastSaved.toLocaleTimeString()}</span>
      </div>
    );
  }

  return null;
}

export default AutosaveIndicator;
