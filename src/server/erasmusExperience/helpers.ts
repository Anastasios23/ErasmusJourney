import { isDatabaseConnectionError } from "../../../lib/databaseErrors";
import { prisma } from "../../../lib/prisma";
import { sanitizeAccommodationStepData } from "../../lib/accommodation";
import { sanitizeCourseMappingsData } from "../../lib/courseMatching";
import { hasLegacyLivingExpensesShape } from "../../lib/livingExpenses";
import {
  type ErasmusExperienceStatus,
} from "../../lib/canonicalWorkflow";
import { isStudentEditableExperienceStatus } from "../../lib/experienceWorkflow";
import { ErasmusExperienceHttpError } from "./errors";

export type ExperienceRecord = {
  id: string;
  userId: string;
  currentStep: number;
  completedSteps: string;
  isComplete: boolean;
  basicInfo: unknown;
  courses: unknown;
  accommodation: unknown;
  livingExpenses: unknown;
  experience: unknown;
  status: ErasmusExperienceStatus;
  lastSavedAt: Date;
  submittedAt: Date | null;
  publishedAt: Date | null;
  semester: string | null;
  hostCity: string | null;
  hostCountry: string | null;
  hostUniversityId: string | null;
  homeUniversityId: string | null;
  adminNotes: string | null;
  publicWordingOverrides: unknown;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewFeedback: string | null;
  revisionCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ExperienceUpdateData = Record<string, unknown>;

export interface AuthenticatedExperienceUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface CreateDraftResult {
  experience: ExperienceRecord;
  created: boolean;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 500,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (isDatabaseConnectionError(error) && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }

      throw error;
    }
  }

  throw new Error("Max retries exceeded");
}

export function normalizeIncomingUpdateData(
  updateData: ExperienceUpdateData,
): ExperienceUpdateData {
  const normalized = { ...updateData };

  if (
    normalized.completedSteps !== undefined &&
    Array.isArray(normalized.completedSteps)
  ) {
    normalized.completedSteps = JSON.stringify(normalized.completedSteps);
  }

  if (normalized.courses !== undefined) {
    normalized.courses = sanitizeCourseMappingsData(normalized.courses);
  }

  if (normalized.accommodation !== undefined) {
    normalized.accommodation = sanitizeAccommodationStepData(
      asRecord(normalized.accommodation),
    );
  }

  return normalized;
}

export function assertCanonicalLivingExpensesPayload(
  updateData: ExperienceUpdateData,
): void {
  if (
    updateData.livingExpenses !== undefined &&
    hasLegacyLivingExpensesShape(updateData.livingExpenses)
  ) {
    throw new ErasmusExperienceHttpError(422, {
      error: "Invalid living expenses payload",
      message:
        "Legacy nested expenses format is not supported. Use canonical fields: currency, rent, food, transport, social, travel, other.",
    });
  }
}

export async function getOwnedExperienceOrThrow(
  experienceId: string,
  userId: string,
): Promise<ExperienceRecord> {
  const experience = (await retryDatabaseOperation(() =>
    prisma.erasmusExperience.findUnique({
      where: { id: experienceId },
    }),
  )) as ExperienceRecord | null;

  if (!experience) {
    throw new ErasmusExperienceHttpError(404, {
      error: "Experience not found",
    });
  }

  if (experience.userId !== userId) {
    throw new ErasmusExperienceHttpError(403, {
      error: "Access denied",
    });
  }

  return experience as ExperienceRecord;
}

export function assertEditableExperienceStatus(
  experience: ExperienceRecord,
): void {
  if (isStudentEditableExperienceStatus(experience.status)) {
    return;
  }

  throw new ErasmusExperienceHttpError(409, {
    error: "Submission locked",
    message:
      "Students cannot edit this submission in its current state. Editing is only available for drafts or admin-returned revisions.",
    status: experience.status,
  });
}
