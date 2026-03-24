import { isAccommodationStepComplete } from "./accommodation";
import { isBasicInformationComplete } from "./basicInformation";
import { hasCompleteCourseMatchingData } from "./courseMatching";
import { isLivingExpensesStepComplete } from "./livingExpenses";

export interface ShareExperienceStepAccessInput {
  basicInfo?: unknown;
  courses?: unknown;
  accommodation?: unknown;
  livingExpenses?: unknown;
}

export function getNextAccessibleShareExperienceStep(
  data?: ShareExperienceStepAccessInput | null,
): number {
  if (
    !isBasicInformationComplete(
      data?.basicInfo as Partial<Record<string, unknown>> | null | undefined,
    )
  ) {
    return 1;
  }

  if (!hasCompleteCourseMatchingData(data?.courses)) {
    return 2;
  }

  if (
    !isAccommodationStepComplete(
      data?.accommodation as Partial<Record<string, unknown>> | null | undefined,
    )
  ) {
    return 3;
  }

  if (
    !isLivingExpensesStepComplete(
      data?.livingExpenses as Partial<Record<string, unknown>> | null | undefined,
    )
  ) {
    return 4;
  }

  return 5;
}

export function clampShareExperienceStep(
  requestedStep: number | null | undefined,
  data?: ShareExperienceStepAccessInput | null,
): number {
  const nextAccessibleStep = getNextAccessibleShareExperienceStep(data);

  if (!requestedStep) {
    return nextAccessibleStep;
  }

  return Math.min(Math.max(requestedStep, 1), nextAccessibleStep);
}

export function canAccessShareExperienceStep(
  requestedStep: number,
  data?: ShareExperienceStepAccessInput | null,
): boolean {
  return (
    Number.isInteger(requestedStep) &&
    requestedStep >= 1 &&
    requestedStep <= getNextAccessibleShareExperienceStep(data)
  );
}
