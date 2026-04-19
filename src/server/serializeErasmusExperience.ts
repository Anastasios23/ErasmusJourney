import type { AccommodationStepData } from "../lib/accommodation";
import { sanitizeAccommodationStepData } from "../lib/accommodation";
import type { BasicInformationData } from "../lib/basicInformation";
import { sanitizeBasicInformationData } from "../lib/basicInformation";
import { sanitizeCourseMappingsData } from "../lib/courseMatching";
import type { LivingExpensesStepData } from "../lib/livingExpenses";
import { sanitizeLivingExpensesStepData } from "../lib/livingExpenses";

function asPartialRecord(
  value: unknown,
): Partial<Record<string, unknown>> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Partial<Record<string, unknown>>;
}

function getExperiencePayload(
  value: unknown,
): Partial<Record<string, unknown>> {
  return asPartialRecord(value) || {};
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function asOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asOptionalNullableString(
  value: unknown,
): string | null | undefined {
  if (value === null) {
    return null;
  }

  return typeof value === "string" ? value : undefined;
}

function asDateOrStringOrNull(
  value: unknown,
): Date | string | null | undefined {
  if (value === null) {
    return null;
  }

  if (value instanceof Date || typeof value === "string") {
    return value;
  }

  return undefined;
}

export interface SerializedErasmusExperienceForClient {
  id?: string;
  status?: string;
  currentStep?: number;
  completedSteps?: number[];
  isComplete?: boolean;
  lastSavedAt?: unknown;
  submittedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  publishedAt?: Date | string | null;
  hostCity?: unknown;
  hostCountry?: unknown;
  semester?: string | null;
  reviewFeedback?: string | null | undefined;
  revisionCount?: unknown;
  basicInfo: BasicInformationData;
  accommodation: AccommodationStepData;
  livingExpenses: LivingExpensesStepData;
  courses: ReturnType<typeof sanitizeCourseMappingsData>;
  experience: Partial<Record<string, unknown>>;
}

export function serializeErasmusExperienceForClient(
  experience: Record<string, unknown>,
): SerializedErasmusExperienceForClient {
  const status = asOptionalString(experience.status);

  return {
    id: experience.id as string | undefined,
    status,
    currentStep: asOptionalNumber(experience.currentStep),
    completedSteps: experience.completedSteps as number[] | undefined,
    isComplete: asOptionalBoolean(experience.isComplete),
    lastSavedAt: experience.lastSavedAt,
    submittedAt: experience.submittedAt,
    createdAt: experience.createdAt,
    updatedAt: experience.updatedAt,
    publishedAt: asDateOrStringOrNull(experience.publishedAt),
    hostCity: experience.hostCity,
    hostCountry: experience.hostCountry,
    semester: asOptionalNullableString(experience.semester),
    reviewFeedback:
      status === "changes_requested"
        ? (experience.reviewFeedback as string | null | undefined)
        : undefined,
    revisionCount: experience.revisionCount,
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
    experience: getExperiencePayload(experience.experience),
  };
}
