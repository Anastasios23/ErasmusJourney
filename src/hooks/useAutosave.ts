import { useState, useEffect, useCallback, useRef } from "react";
import { useFormSubmissions } from "./useFormSubmissions";

// Simple debounce implementation to avoid external dependency
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;

  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { cancel: () => void };

  debounced.cancel = () => clearTimeout(timeoutId);

  return debounced;
}

interface AutosaveOptions {
  formType: string;
  formTitle: string;
  debounceMs?: number;
  enableLocalStorage?: boolean;
}

interface AutosaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  hasUnsavedChanges: boolean;
}

export function useAutosave<T extends Record<string, any>>(
  formData: T,
  options: AutosaveOptions,
) {
  const { saveDraft, getDraftData } = useFormSubmissions();
  const [autosaveState, setAutosaveState] = useState<AutosaveState>({
    isSaving: false,
    lastSaved: null,
    saveError: null,
    hasUnsavedChanges: false,
  });

  const lastSavedDataRef = useRef<string>("");
  const mountedRef = useRef(true);

  const {
    formType,
    formTitle,
    debounceMs = 2000,
    enableLocalStorage = true,
  } = options;

  // Load initial data from draft or localStorage
  const loadInitialData = useCallback(() => {
    try {
      // First try to get from API draft
      const draftData = getDraftData(formType);
      if (draftData) {
        return draftData;
      }

      // Fallback to localStorage
      if (enableLocalStorage) {
        const localData = localStorage.getItem(`autosave_${formType}`);
        if (localData) {
          return JSON.parse(localData);
        }
      }
    } catch (error) {
      console.warn("Failed to load initial data:", error);
    }
    return null;
  }, [formType, getDraftData, enableLocalStorage]);

  // Save to localStorage as immediate fallback
  const saveToLocalStorage = useCallback(
    (data: T) => {
      if (!enableLocalStorage) return;
      try {
        localStorage.setItem(`autosave_${formType}`, JSON.stringify(data));
      } catch (error) {
        console.warn("Failed to save to localStorage:", error);
      }
    },
    [formType, enableLocalStorage],
  );

  // Main save function
  const saveData = useCallback(
    async (data: T) => {
      if (!mountedRef.current) return;

      const dataString = JSON.stringify(data);

      // Skip if data hasn't changed
      if (dataString === lastSavedDataRef.current) {
        return;
      }

      setAutosaveState((prev) => ({
        ...prev,
        isSaving: true,
        saveError: null,
      }));

      try {
        // Save to localStorage immediately
        saveToLocalStorage(data);

        // Save to API as draft
        await saveDraft(formType, formTitle, data);

        lastSavedDataRef.current = dataString;

        if (mountedRef.current) {
          setAutosaveState((prev) => ({
            ...prev,
            isSaving: false,
            lastSaved: new Date(),
            saveError: null,
            hasUnsavedChanges: false,
          }));
        }
      } catch (error) {
        console.error("Autosave failed:", error);
        if (mountedRef.current) {
          setAutosaveState((prev) => ({
            ...prev,
            isSaving: false,
            saveError: error instanceof Error ? error.message : "Save failed",
            hasUnsavedChanges: true,
          }));
        }
      }
    },
    [formType, formTitle, saveDraft, saveToLocalStorage],
  );

  // Debounced save function
  const debouncedSave = useCallback(debounce(saveData, debounceMs), [
    saveData,
    debounceMs,
  ]);

  // Manual save function for immediate saves
  const manualSave = useCallback(
    async (data?: T) => {
      const dataToSave = data || formData;
      debouncedSave.cancel();
      await saveData(dataToSave);
    },
    [saveData, formData, debouncedSave],
  );

  // Effect to trigger autosave when form data changes
  useEffect(() => {
    const dataString = JSON.stringify(formData);

    // Check if data has actually changed
    if (dataString !== lastSavedDataRef.current) {
      setAutosaveState((prev) => ({
        ...prev,
        hasUnsavedChanges: true,
      }));

      // Trigger debounced save
      debouncedSave(formData);
    }
  }, [formData, debouncedSave]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autosaveState.hasUnsavedChanges || autosaveState.isSaving) {
        // Save to localStorage immediately
        saveToLocalStorage(formData);

        // Show confirmation dialog
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    autosaveState.hasUnsavedChanges,
    autosaveState.isSaving,
    formData,
    saveToLocalStorage,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Clear saved data function
  const clearSavedData = useCallback(() => {
    try {
      if (enableLocalStorage) {
        localStorage.removeItem(`autosave_${formType}`);
      }
      lastSavedDataRef.current = "";
      setAutosaveState({
        isSaving: false,
        lastSaved: null,
        saveError: null,
        hasUnsavedChanges: false,
      });
    } catch (error) {
      console.warn("Failed to clear saved data:", error);
    }
  }, [formType, enableLocalStorage]);

  // Return autosave interface
  return {
    autosaveState,
    manualSave,
    loadInitialData,
    clearSavedData,
    // Helper function to format last saved time
    getLastSavedText: () => {
      if (!autosaveState.lastSaved) return null;
      const now = new Date();
      const diffMs = now.getTime() - autosaveState.lastSaved.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) return "Saved just now";
      if (diffMinutes < 60) return `Saved ${diffMinutes}m ago`;
      if (diffMinutes < 1440)
        return `Saved ${Math.floor(diffMinutes / 60)}h ago`;
      return `Saved ${Math.floor(diffMinutes / 1440)}d ago`;
    },
  };
}

// Export state type for use in components
export type { AutosaveState };
