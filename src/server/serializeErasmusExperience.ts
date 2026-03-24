import { sanitizeAccommodationStepData } from "../lib/accommodation";
import { sanitizeBasicInformationData } from "../lib/basicInformation";
import { sanitizeCourseMappingsData } from "../lib/courseMatching";
import { sanitizeLivingExpensesStepData } from "../lib/livingExpenses";

function asPartialRecord(
  value: unknown,
): Partial<Record<string, unknown>> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Partial<Record<string, unknown>>;
}

export function serializeErasmusExperienceForClient<T extends Record<string, any>>(
  experience: T,
): T {
  return {
    ...experience,
    basicInfo: sanitizeBasicInformationData(
      asPartialRecord(experience.basicInfo),
    ),
    accommodation: sanitizeAccommodationStepData(
      asPartialRecord(experience.accommodation),
    ),
    livingExpenses: sanitizeLivingExpensesStepData(
      asPartialRecord(experience.livingExpenses),
    ),
    courses: sanitizeCourseMappingsData(experience.courses),
  };
}
