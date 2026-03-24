function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asPositiveNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function isExperienceStepComplete(
  value?: Partial<Record<string, unknown>> | null,
): boolean {
  const raw = value || {};

  return (
    asPositiveNumber(raw.overallRating) > 0 &&
    asString(raw.bestExperience).length > 0 &&
    asString(raw.generalTips).length > 0
  );
}
