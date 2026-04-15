export const EXPERIENCE_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REVISION_NEEDED: "REVISION_NEEDED",
} as const;

export const REVIEW_ACTION = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REQUEST_CHANGES: "REQUEST_CHANGES",
  WORDING_EDITED: "WORDING_EDITED",
} as const;

export const MAX_REVISION_COUNT = 1;

export type ErasmusExperienceStatus =
  (typeof EXPERIENCE_STATUS)[keyof typeof EXPERIENCE_STATUS];
export type ReviewActionType =
  (typeof REVIEW_ACTION)[keyof typeof REVIEW_ACTION];

export const EXPERIENCE_STATUS_VALUES = Object.values(
  EXPERIENCE_STATUS,
) as ErasmusExperienceStatus[];

export const REVIEW_ACTION_VALUES = Object.values(
  REVIEW_ACTION,
) as ReviewActionType[];

const LEGACY_EXPERIENCE_STATUS_INPUTS = {
  IN_PROGRESS: EXPERIENCE_STATUS.DRAFT,
  PENDING: EXPERIENCE_STATUS.SUBMITTED,
  COMPLETED: EXPERIENCE_STATUS.SUBMITTED,
  PUBLISHED: EXPERIENCE_STATUS.APPROVED,
} as const satisfies Record<string, ErasmusExperienceStatus>;

export function normalizeExperienceStatusInput(
  status: string | null | undefined,
): ErasmusExperienceStatus | null {
  if (typeof status !== "string") {
    return null;
  }

  const normalized = status.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  if (normalized in EXPERIENCE_STATUS) {
    return EXPERIENCE_STATUS[normalized as keyof typeof EXPERIENCE_STATUS];
  }

  return LEGACY_EXPERIENCE_STATUS_INPUTS[normalized] ?? null;
}
