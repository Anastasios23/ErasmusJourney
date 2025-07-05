import { AutosaveState } from "../src/hooks/useAutosave";

interface AutosaveIndicatorProps {
  autosaveState: AutosaveState;
  lastSavedText: string | null;
  className?: string;
}

export function AutosaveIndicator({
  autosaveState,
  lastSavedText,
  className = "",
}: AutosaveIndicatorProps) {
  if (autosaveState.isSaving) {
    return (
      <div
        className={`flex items-center gap-2 text-blue-600 text-sm ${className}`}
      >
        <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full" />
        <span>Saving...</span>
      </div>
    );
  }

  if (autosaveState.saveError) {
    return (
      <div
        className={`flex items-center gap-2 text-red-600 text-sm ${className}`}
      >
        <span>���️ Save failed</span>
      </div>
    );
  }

  if (lastSavedText) {
    return (
      <div
        className={`flex items-center gap-2 text-green-600 text-sm ${className}`}
      >
        <span>✓ {lastSavedText}</span>
      </div>
    );
  }

  return null;
}

export default AutosaveIndicator;
