export type ShareExperienceSaveState = "idle" | "saving" | "saved" | "error";

interface ShareExperienceSaveStateMeta {
  badgeClassName: string;
  icon: string;
  label: string;
}

export function formatShareExperienceSavedTime(
  value: Date | string | null | undefined,
): string | null {
  const parsed =
    value instanceof Date ? value : value ? new Date(value) : null;

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getShareExperienceSaveStateMeta(
  saveState: ShareExperienceSaveState,
): ShareExperienceSaveStateMeta {
  switch (saveState) {
    case "saving":
      return {
        badgeClassName:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300",
        icon: "solar:refresh-circle-linear",
        label: "Saving...",
      };
    case "error":
      return {
        badgeClassName:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300",
        icon: "solar:danger-triangle-linear",
        label: "Save failed",
      };
    case "saved":
      return {
        badgeClassName:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300",
        icon: "solar:check-circle-linear",
        label: "Saved",
      };
    case "idle":
    default:
      return {
        badgeClassName:
          "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
        icon: "solar:clock-circle-linear",
        label: "Draft ready",
      };
  }
}

export function formatValidationSummaryItem(
  label: string,
  message: string,
): string {
  const trimmedMessage = message.trim();
  const normalizedLabel = label.trim();

  if (!trimmedMessage) {
    return normalizedLabel;
  }

  const lowerLabel = normalizedLabel.toLowerCase();
  const lowerMessage = trimmedMessage.toLowerCase();

  if (
    lowerMessage.includes(lowerLabel) ||
    lowerMessage.startsWith("please") ||
    lowerMessage.startsWith("add ")
  ) {
    return trimmedMessage;
  }

  return `${normalizedLabel}: ${trimmedMessage}`;
}

export function scrollToFirstValidationError() {
  if (typeof document === "undefined") {
    return;
  }

  const firstInvalidField = document.querySelector(
    "[aria-invalid='true'], [data-invalid='true']",
  );

  if (firstInvalidField instanceof HTMLElement) {
    firstInvalidField.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const firstErrorText = document.querySelector(".text-red-500");

  if (firstErrorText instanceof HTMLElement) {
    firstErrorText.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
