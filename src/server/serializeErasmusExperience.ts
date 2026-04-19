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

function getExperiencePayload(
  value: unknown,
): Partial<Record<string, unknown>> {
  return asPartialRecord(value) || {};
}

export interface SerializedErasmusExperienceForClient {
  id?: string;
  status?: unknown;
  currentStep?: unknown;
  completedSteps?: unknown;
  isComplete?: unknown;
  lastSavedAt?: unknown;
  submittedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  publishedAt?: unknown;
  hostCity?: unknown;
  hostCountry?: unknown;
  semester?: unknown;
  reviewFeedback?: unknown;
  reviewedBy?: unknown;
  reviewedAt?: unknown;
  revisionCount?: unknown;
  basicInfo: ReturnType<typeof sanitizeBasicInformationData>;
  accommodation: ReturnType<typeof sanitizeAccommodationStepData>;
  livingExpenses: ReturnType<typeof sanitizeLivingExpensesStepData>;
  courses: ReturnType<typeof sanitizeCourseMappingsData>;
  experience: Partial<Record<string, unknown>>;
}

export function serializeErasmusExperienceForClient(
  experience: Record<string, unknown>,
): SerializedErasmusExperienceForClient {
  return {
    id: experience.id as string | undefined,
    status: experience.status,
    currentStep: experience.currentStep,
    completedSteps: experience.completedSteps,
    isComplete: experience.isComplete,
    lastSavedAt: experience.lastSavedAt,
    submittedAt: experience.submittedAt,
    createdAt: experience.createdAt,
    updatedAt: experience.updatedAt,
    publishedAt: experience.publishedAt,
    hostCity: experience.hostCity,
    hostCountry: experience.hostCountry,
    semester: experience.semester,
    reviewFeedback: experience.reviewFeedback,
    reviewedBy: experience.reviewedBy,
    reviewedAt: experience.reviewedAt,
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
