export const ERASMUS_PROGRESS_SYNC_EVENT =
  "erasmus:progress-sync" as const;
export const ERASMUS_PROGRESS_SYNC_STORAGE_KEY =
  "erasmus:progress-sync" as const;

export interface ErasmusProgressSyncPayload {
  userId?: string;
  experienceId?: string;
  action: "save" | "submit" | "delete" | "refresh";
  updatedAt?: number;
}

export function publishErasmusProgressSync(
  payload: ErasmusProgressSyncPayload,
) {
  if (typeof window === "undefined") {
    return;
  }

  const detail = {
    ...payload,
    updatedAt: payload.updatedAt ?? Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent(ERASMUS_PROGRESS_SYNC_EVENT, {
      detail,
    }),
  );

  try {
    window.localStorage.setItem(
      ERASMUS_PROGRESS_SYNC_STORAGE_KEY,
      JSON.stringify(detail),
    );
    window.localStorage.removeItem(ERASMUS_PROGRESS_SYNC_STORAGE_KEY);
  } catch {
    // Ignore storage failures in restricted/private contexts.
  }
}

export function isErasmusProgressSyncStorageEvent(event: StorageEvent) {
  return (
    event.key === ERASMUS_PROGRESS_SYNC_STORAGE_KEY &&
    typeof event.newValue === "string" &&
    event.newValue.length > 0
  );
}
