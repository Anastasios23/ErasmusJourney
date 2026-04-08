const STUDENT_EDITABLE_EXPERIENCE_STATUSES = new Set([
  "DRAFT",
  "IN_PROGRESS",
  "REVISION_NEEDED",
]);

export function isStudentEditableExperienceStatus(
  status: string | null | undefined,
): boolean {
  return typeof status === "string"
    ? STUDENT_EDITABLE_EXPERIENCE_STATUSES.has(status)
    : false;
}

export function isStudentLockedExperienceStatus(
  status: string | null | undefined,
): boolean {
  return typeof status === "string" && !isStudentEditableExperienceStatus(status);
}

export function isExperienceReviewableStatus(
  status: string | null | undefined,
): boolean {
  return status === "SUBMITTED";
}

export function getStudentLockedExperienceMessage(
  status: string | null | undefined,
): string {
  switch (status) {
    case "SUBMITTED":
      return "This submission is locked while it is under review.";
    case "APPROVED":
      return "This submission is locked because it has already been approved.";
    case "REJECTED":
      return "This submission is locked because it has already been rejected.";
    default:
      return "This submission is locked.";
  }
}
