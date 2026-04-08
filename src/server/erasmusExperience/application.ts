import { randomUUID } from "crypto";

import { isDatabaseConnectionError } from "../../../lib/databaseErrors";
import { prisma } from "../../../lib/prisma";
import {
  createEmptyAccommodationStepData,
  sanitizeAccommodationStepData,
} from "../../lib/accommodation";
import {
  hasCompleteCourseMatchingData,
  sanitizeCourseMappingsData,
} from "../../lib/courseMatching";
import {
  createEmptyLivingExpensesStepData,
  hasLegacyLivingExpensesShape,
  hasRequiredLivingExpenses,
  sanitizeLivingExpensesStepData,
} from "../../lib/livingExpenses";
import { buildBasicInfoPersistenceData } from "./basicInfoPersistence";
import { ErasmusExperienceHttpError } from "./errors";
import {
  persistSubmissionArtifacts,
  refreshPublicDestinationReadModelIfNeeded,
  triggerStatsRefresh,
} from "./persistence";
import { isStudentEditableExperienceStatus } from "../../lib/experienceWorkflow";

type ExperienceRecord = {
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
  status: string;
  isPublic: boolean;
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
  adminApproved: boolean;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewFeedback: string | null;
  revisionCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type ExperienceUpdateData = Record<string, unknown>;

function assertEditableExperienceStatus(experience: ExperienceRecord): void {
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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

async function retryDatabaseOperation<T>(
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

function normalizeIncomingUpdateData(
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

function assertCanonicalLivingExpensesPayload(
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

async function getOwnedExperienceOrThrow(
  experienceId: string,
  userId: string,
): Promise<ExperienceRecord> {
  const experience = await retryDatabaseOperation(() =>
    prisma.erasmusExperience.findUnique({
      where: { id: experienceId },
    }),
  ) as ExperienceRecord | null;

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

async function ensureUserRecordExists(
  user: AuthenticatedExperienceUser,
): Promise<void> {
  let userExists = await retryDatabaseOperation(() =>
    prisma.users.findUnique({
      where: { id: user.id },
      select: { id: true },
    }),
  ) as { id: string } | null;

  if (!userExists && user.email) {
    const userByEmail = await retryDatabaseOperation(() =>
      prisma.users.findUnique({
        where: { email: user.email! },
        select: { id: true },
      }),
    ) as { id: string } | null;

    if (!userByEmail) {
      await retryDatabaseOperation(() =>
        prisma.users.create({
          data: {
            id: user.id,
            email: user.email,
            firstName: user.name?.split(" ")[0] || "",
            lastName: user.name?.split(" ").slice(1).join(" ") || "",
            image: user.image || null,
            updatedAt: new Date(),
            role: "USER",
          },
        }),
      );
      return;
    }

    console.error("[erasmus-experiences] Session mismatch during create action", {
      sessionUserId: user.id,
      databaseUserId: userByEmail.id,
    });

    throw new ErasmusExperienceHttpError(409, {
      error: "Session mismatch",
      details: "Please log out and log in again to refresh your session.",
    });
  }

  if (!userExists) {
    throw new ErasmusExperienceHttpError(404, {
      error: "User not found",
      details: "Please log out and log in again to create your account.",
    });
  }
}

function mergeSaveDraftExperienceData(
  updateFields: ExperienceUpdateData,
  updateData: ExperienceUpdateData,
  existingExperience: ExperienceRecord,
): void {
  const incomingExperience = asRecord(updateData.experience);

  if (!incomingExperience?.helpForStudents) {
    return;
  }

  const existingExperienceData = asRecord(existingExperience.experience) || {};
  const existingHelpForStudents =
    asRecord(existingExperienceData.helpForStudents) || {};
  const incomingHelpForStudents =
    asRecord(incomingExperience.helpForStudents) || {};

  updateFields.experience = {
    ...existingExperienceData,
    ...incomingExperience,
    helpForStudents: {
      ...existingHelpForStudents,
      ...incomingHelpForStudents,
    },
  };
}

function applySubmitExperienceDataTransforms(
  submissionData: ExperienceUpdateData,
  updateData: ExperienceUpdateData,
  existingExperience: ExperienceRecord,
): void {
  const overallReflection = asRecord(updateData.overallReflection);

  if (overallReflection) {
    const existingExperienceData = asRecord(existingExperience.experience) || {};
    submissionData.experience = {
      ...existingExperienceData,
      ...overallReflection,
    };
    delete updateData.overallReflection;
  }

  const incomingExperience = asRecord(updateData.experience);

  if (incomingExperience?.helpForStudents || existingExperience.experience) {
    const existingExperienceData = asRecord(existingExperience.experience) || {};
    const existingHelpForStudents =
      asRecord(existingExperienceData.helpForStudents) || {};
    const incomingHelpForStudents =
      asRecord(incomingExperience?.helpForStudents) || {};

    submissionData.experience = {
      ...existingExperienceData,
      ...(incomingExperience || {}),
      helpForStudents: {
        ...existingHelpForStudents,
        ...incomingHelpForStudents,
      },
    };
  }

  Object.keys(updateData).forEach((key) => {
    if (key !== "overallReflection") {
      submissionData[key] = updateData[key];
    }
  });
}

function validateSubmissionData(
  submissionData: ExperienceUpdateData,
  existingExperience: ExperienceRecord,
): void {
  const errors: string[] = [];
  const basicInfo = asRecord(submissionData.basicInfo) || {};
  const accommodation = submissionData.accommodation as
    | ReturnType<typeof sanitizeAccommodationStepData>
    | undefined;

  if (
    !basicInfo.homeUniversity ||
    !basicInfo.homeDepartment ||
    !basicInfo.levelOfStudy ||
    !basicInfo.hostUniversity ||
    !basicInfo.exchangeAcademicYear ||
    !basicInfo.exchangePeriod
  ) {
    errors.push(
      "Basic Information is incomplete (home university, department, level, host university, academic year, and period are required).",
    );
  }

  const mappings = sanitizeCourseMappingsData(submissionData.courses);

  if (!Array.isArray(mappings) || mappings.length === 0) {
    errors.push("At least one course mapping is required.");
  } else if (!hasCompleteCourseMatchingData(submissionData.courses)) {
    errors.push(
      "All course mappings must include home course name, host course name, home ECTS, host ECTS, and recognition type.",
    );
  }

  if (
    !accommodation?.accommodationType ||
    typeof accommodation.monthlyRent !== "number" ||
    !accommodation.billsIncluded ||
    typeof accommodation.accommodationRating !== "number" ||
    typeof accommodation.wouldRecommend !== "boolean"
  ) {
    errors.push(
      "Accommodation details are incomplete (type, monthly rent, bills included, rating, and recommendation are required).",
    );
  }

  const livingExpenses = sanitizeLivingExpensesStepData(
    submissionData.livingExpenses,
    {
      fallbackRent:
        accommodation?.monthlyRent ??
        ((existingExperience.accommodation as Record<string, unknown> | null)
          ?.monthlyRent as number | null | undefined) ??
        null,
    },
  );

  if (!hasRequiredLivingExpenses(livingExpenses)) {
    errors.push("Living Expenses are incomplete.");
  }

  if (errors.length > 0) {
    throw new ErasmusExperienceHttpError(400, {
      error: "Validation Failed",
      details: errors.join(" "),
    });
  }
}

export async function listExperiencesForUser(
  userId: string,
): Promise<ExperienceRecord[]> {
  return (await retryDatabaseOperation(() =>
    prisma.erasmusExperience.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
  )) as ExperienceRecord[];
}

export async function getExperienceByIdForUser(
  experienceId: string,
  userId: string,
): Promise<ExperienceRecord> {
  return getOwnedExperienceOrThrow(experienceId, userId);
}

export async function createDraft(
  user: AuthenticatedExperienceUser,
): Promise<CreateDraftResult> {
  await ensureUserRecordExists(user);

  const existingExperience = await retryDatabaseOperation(() =>
    prisma.erasmusExperience.findUnique({
      where: { userId: user.id },
    }),
  ) as ExperienceRecord | null;

  if (existingExperience) {
    return { experience: existingExperience, created: false };
  }

  const experience = await retryDatabaseOperation(() =>
    prisma.erasmusExperience.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        status: "DRAFT",
        semester: null,
        updatedAt: new Date(),
        basicInfo: {},
        courses: [],
        accommodation: createEmptyAccommodationStepData(),
        livingExpenses: createEmptyLivingExpensesStepData(),
        experience: {},
      },
    }),
  ) as ExperienceRecord;

  return { experience, created: true };
}

export async function saveDraft(
  experienceId: string,
  user: AuthenticatedExperienceUser,
  updateData: ExperienceUpdateData,
): Promise<ExperienceRecord> {
  const normalizedUpdateData = normalizeIncomingUpdateData(updateData);
  assertCanonicalLivingExpensesPayload(normalizedUpdateData);

  const existingExperience = await getOwnedExperienceOrThrow(
    experienceId,
    user.id,
  );
  assertEditableExperienceStatus(existingExperience);

  const updateFields: ExperienceUpdateData = {
    lastSavedAt: new Date(),
    ...normalizedUpdateData,
  };

  if (updateFields.livingExpenses !== undefined) {
    updateFields.livingExpenses = sanitizeLivingExpensesStepData(
      updateFields.livingExpenses,
      {
        fallbackRent:
          (updateFields.accommodation as
            | ReturnType<typeof sanitizeAccommodationStepData>
            | undefined)?.monthlyRent ??
          ((existingExperience.accommodation as Record<string, unknown> | null)
            ?.monthlyRent as number | null | undefined) ??
          null,
      },
    );
  }

  const basicInfoContext = await buildBasicInfoPersistenceData(
    normalizedUpdateData.basicInfo,
    existingExperience.basicInfo,
    user.email,
  );

  if (basicInfoContext) {
    updateFields.basicInfo = basicInfoContext.basicInfo;
    updateFields.homeUniversityId = basicInfoContext.homeUniversityId;
    updateFields.hostUniversityId = basicInfoContext.hostUniversityId;
    updateFields.hostCity = basicInfoContext.hostCity;
    updateFields.hostCountry = basicInfoContext.hostCountry;
    updateFields.semester = basicInfoContext.semester;
  }

  mergeSaveDraftExperienceData(
    updateFields,
    normalizedUpdateData,
    existingExperience,
  );

  return (await retryDatabaseOperation(() =>
    prisma.erasmusExperience.update({
      where: { id: experienceId },
      data: updateFields,
    }),
  )) as ExperienceRecord;
}

export async function submitExperience(
  experienceId: string,
  user: AuthenticatedExperienceUser,
  updateData: ExperienceUpdateData,
  onStatsRefreshError?: (error: unknown, context: { experienceId: string }) => void,
): Promise<ExperienceRecord> {
  const normalizedUpdateData = normalizeIncomingUpdateData(updateData);
  assertCanonicalLivingExpensesPayload(normalizedUpdateData);

  const existingExperience = await getOwnedExperienceOrThrow(
    experienceId,
    user.id,
  );
  assertEditableExperienceStatus(existingExperience);

  const submissionData: ExperienceUpdateData = {
    status: "SUBMITTED",
    submittedAt: new Date(),
    isComplete: true,
    courses: sanitizeCourseMappingsData(
      normalizedUpdateData.courses ?? existingExperience.courses,
    ),
  };

  applySubmitExperienceDataTransforms(
    submissionData,
    normalizedUpdateData,
    existingExperience,
  );

  const basicInfoContext = await buildBasicInfoPersistenceData(
    normalizedUpdateData.basicInfo,
    existingExperience.basicInfo,
    user.email,
  );

  if (basicInfoContext) {
    submissionData.basicInfo = basicInfoContext.basicInfo;
    submissionData.homeUniversityId = basicInfoContext.homeUniversityId;
    submissionData.hostUniversityId = basicInfoContext.hostUniversityId;
    submissionData.hostCity = basicInfoContext.hostCity;
    submissionData.hostCountry = basicInfoContext.hostCountry;
    submissionData.semester = basicInfoContext.semester;
  }

  submissionData.accommodation = sanitizeAccommodationStepData(
    asRecord(
      normalizedUpdateData.accommodation ?? existingExperience.accommodation,
    ),
  );
  submissionData.livingExpenses = sanitizeLivingExpensesStepData(
    normalizedUpdateData.livingExpenses ?? existingExperience.livingExpenses,
    {
      fallbackRent:
        (submissionData.accommodation as ReturnType<
          typeof sanitizeAccommodationStepData
        >).monthlyRent ??
        ((existingExperience.accommodation as Record<string, unknown> | null)
          ?.monthlyRent as number | null | undefined) ??
        null,
    },
  );

  validateSubmissionData(submissionData, existingExperience);

  const updatedExperience = await retryDatabaseOperation(() =>
    prisma.$transaction(async (tx) => {
      const experience = await tx.erasmusExperience.update({
        where: { id: experienceId },
        data: submissionData,
      });

      await persistSubmissionArtifacts(tx, {
        id: experience.id,
        status: experience.status,
        isComplete: experience.isComplete,
        hostCity: experience.hostCity,
        hostCountry: experience.hostCountry,
        hostUniversityId: experience.hostUniversityId,
        courses: experience.courses,
        accommodation: experience.accommodation,
      });

      return experience;
    }),
  ) as ExperienceRecord;

  await refreshPublicDestinationReadModelIfNeeded({
    id: updatedExperience.id,
    status: updatedExperience.status,
    isComplete: updatedExperience.isComplete,
    hostCity: updatedExperience.hostCity,
    hostCountry: updatedExperience.hostCountry,
  });

  triggerStatsRefresh(
    {
      id: updatedExperience.id,
      hostCity: updatedExperience.hostCity,
      hostCountry: updatedExperience.hostCountry,
    },
    onStatsRefreshError,
  );

  return updatedExperience;
}
