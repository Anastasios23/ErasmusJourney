import { randomUUID } from "crypto";

import { isCyprusUniversityEmail } from "../../../lib/authUtils";
import { prisma } from "../../../lib/prisma";
import {
  createEmptyAccommodationStepData,
  sanitizeAccommodationStepData,
} from "../../lib/accommodation";
import {
  createEmptyLivingExpensesStepData,
  sanitizeLivingExpensesStepData,
} from "../../lib/livingExpenses";
import { EXPERIENCE_STATUS } from "../../lib/canonicalWorkflow";
import { buildBasicInfoPersistenceData } from "./basicInfoPersistence";
import { ErasmusExperienceHttpError } from "./errors";
import {
  asRecord,
  assertCanonicalLivingExpensesPayload,
  assertEditableExperienceStatus,
  getOwnedExperienceOrThrow,
  normalizeIncomingUpdateData,
  retryDatabaseOperation,
  type AuthenticatedExperienceUser,
  type CreateDraftResult,
  type ExperienceRecord,
  type ExperienceUpdateData,
} from "./helpers";

export type { AuthenticatedExperienceUser, CreateDraftResult } from "./helpers";

async function ensureUserRecordExists(
  user: AuthenticatedExperienceUser,
): Promise<void> {
  let userExists = (await retryDatabaseOperation(() =>
    prisma.users.findUnique({
      where: { id: user.id },
      select: { id: true },
    }),
  )) as { id: string } | null;

  if (!userExists && user.email) {
    const userByEmail = (await retryDatabaseOperation(() =>
      prisma.users.findUnique({
        where: { email: user.email! },
        select: { id: true },
      }),
    )) as { id: string } | null;

    if (!userByEmail) {
      const email = user.email;

      if (!isCyprusUniversityEmail(email)) {
        throw new ErasmusExperienceHttpError(403, {
          success: false,
          error: "UNAUTHORIZED_DOMAIN",
          message:
            "Only Cyprus university email addresses may create a submission account.",
        });
      }

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

    console.error(
      "[erasmus-experiences] Session mismatch during create action",
      {
        sessionUserId: user.id,
        databaseUserId: userByEmail.id,
      },
    );

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

  const existingExperience = (await retryDatabaseOperation(() =>
    prisma.erasmusExperience.findUnique({
      where: { userId: user.id },
    }),
  )) as ExperienceRecord | null;

  if (existingExperience) {
    return { experience: existingExperience, created: false };
  }

  const experience = (await retryDatabaseOperation(() =>
    prisma.erasmusExperience.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        status: EXPERIENCE_STATUS.DRAFT,
        semester: null,
        updatedAt: new Date(),
        basicInfo: {},
        courses: [],
        accommodation: createEmptyAccommodationStepData(),
        livingExpenses: createEmptyLivingExpensesStepData(),
        experience: {},
      },
    }),
  )) as ExperienceRecord;

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
          (
            updateFields.accommodation as
              | ReturnType<typeof sanitizeAccommodationStepData>
              | undefined
          )?.monthlyRent ??
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
