import { useEffect, useRef, useState } from "react";
import { useFormSubmissions } from "./useFormSubmissions";

export function useFormAutoSave(
  formType: string,
  formTitle: string,
  formData: any,
  isSubmitting: boolean,
) {
  const { saveDraft } = useFormSubmissions();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isNavigating = useRef(false);

  useEffect(() => {
    if (!isSubmitting && !isNavigating.current) {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }

      autoSaveTimeout.current = setTimeout(async () => {
        try {
          setIsAutoSaving(true);
          await saveDraft(formType, formTitle, formData);
          setLastSaved(new Date());
          setShowSavedIndicator(true);
          setTimeout(() => setShowSavedIndicator(false), 2000);
        } catch (error) {
          console.error("Auto-save error:", error);
        } finally {
          setIsAutoSaving(false);
        }
      }, 15000); // 15 second delay
    }

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [formData, isSubmitting, formType, formTitle, saveDraft]);

  return {
    isAutoSaving,
    lastSaved,
    showSavedIndicator,
    setIsNavigating: (value: boolean) => {
      isNavigating.current = value;
    },
  };
}
