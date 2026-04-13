import {
  EXPERIENCE_STATUS,
  type ErasmusExperienceStatus,
} from "./canonicalWorkflow";

const STUDENT_EDITABLE_EXPERIENCE_STATUSES = new Set<ErasmusExperienceStatus>([
  EXPERIENCE_STATUS.DRAFT,
  EXPERIENCE_STATUS.REVISION_NEEDED,
]);

export function isStudentEditableExperienceStatus(
  status: ErasmusExperienceStatus | null | undefined,
): boolean {
  return typeof status === "string"
    ? STUDENT_EDITABLE_EXPERIENCE_STATUSES.has(status)
    : false;
}

export function isStudentLockedExperienceStatus(
  status: ErasmusExperienceStatus | null | undefined,
): boolean {
  return typeof status === "string" && !isStudentEditableExperienceStatus(status);
}

export function isExperienceReviewableStatus(
  status: ErasmusExperienceStatus | null | undefined,
): boolean {
  return status === EXPERIENCE_STATUS.SUBMITTED;
}

export function getStudentLockedExperienceMessage(
  status: ErasmusExperienceStatus | null | undefined,
): string {
  switch (status) {
    case EXPERIENCE_STATUS.SUBMITTED:
      return "This submission is locked while it is under review.";
    case EXPERIENCE_STATUS.APPROVED:
      return "This submission is locked because it has already been approved.";
    case EXPERIENCE_STATUS.REJECTED:
      return "This submission is locked because it has already been rejected.";
    default:
      return "This submission is locked.";
  }
}
