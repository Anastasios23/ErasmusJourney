import { isCyprusUniversityEmail } from "../../../lib/authUtils";
import { prisma } from "../../../lib/prisma";
import { sanitizeAccommodationStepData } from "../../lib/accommodation";
import {
  hasCompleteCourseMatchingData,
  sanitizeCourseMappingsData,
} from "../../lib/courseMatching";
import {
  hasRequiredLivingExpenses,
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
  type ExperienceRecord,
  type ExperienceUpdateData,
} from "./helpers";
import { runSubmissionPublishSideEffects } from "./publishOperations";
import { persistSubmissionArtifacts } from "./persistence";

export { persistSubmissionArtifacts } from "./persistence";

type SubmissionCompletenessCandidate = {
  id: string;
  hostCity?: string | null;
  hostUniversityId?: string | null;
  homeUniversityId?: string | null;
};

type SubmissionCompletenessReader = {
  courseMapping: {
    count: (args: { where: { experienceId: string } }) => Promise<number>;
  };
  accommodationReview: {
    count: (args: { where: { experienceId: string } }) => Promise<number>;
  };
};

function applySubmitExperienceDataTransforms(
  submissionData: ExperienceUpdateData,
  updateData: ExperienceUpdateData,
  existingExperience: ExperienceRecord,
): void {
  const overallReflection = asRecord(updateData.overallReflection);

  if (overallReflection) {
    const existingExperienceData =
      asRecord(existingExperience.experience) || {};
    submissionData.experience = {
      ...existingExperienceData,
      ...overallReflection,
    };
    delete updateData.overallReflection;
  }

  const incomingExperience = asRecord(updateData.experience);

  if (incomingExperience?.helpForStudents || existingExperience.experience) {
    const existingExperienceData =
      asRecord(existingExperience.experience) || {};
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

async function assertSubmissionCompleteness(
  tx: SubmissionCompletenessReader,
  experience: SubmissionCompletenessCandidate,
): Promise<void> {
  const missing: string[] = [];

  if (
    typeof experience.hostCity !== "string" ||
    experience.hostCity.trim().length === 0
  ) {
    missing.push("Host city");
  }

  if (!experience.hostUniversityId) {
    missing.push("Host university");
  }

  if (!experience.homeUniversityId) {
    missing.push("Home university");
  }

  const [courseMappingCount, accommodationReviewCount] = await Promise.all([
    tx.courseMapping.count({
      where: { experienceId: experience.id },
    }),
    tx.accommodationReview.count({
      where: { experienceId: experience.id },
    }),
  ]);

  if (courseMappingCount === 0) {
    missing.push("At least one course mapping");
  }

  if (accommodationReviewCount === 0) {
    missing.push("At least one accommodation review");
  }

  if (missing.length > 0) {
    throw new ErasmusExperienceHttpError(422, {
      error: "SUBMISSION_INCOMPLETE",
      message: "Your submission is missing required information.",
      missing,
    });
  }
}

export async function submitExperience(
  experienceId: string,
  user: AuthenticatedExperienceUser,
  updateData: ExperienceUpdateData,
  onStatsRefreshError?: (
    error: unknown,
    context: { experienceId: string },
  ) => void,
): Promise<ExperienceRecord> {
  if (!isCyprusUniversityEmail(user.email || "")) {
    throw new ErasmusExperienceHttpError(403, {
      success: false,
      error: "UNAUTHORIZED_DOMAIN",
      message: "Only Cyprus university email addresses may submit.",
    });
  }

  const normalizedUpdateData = normalizeIncomingUpdateData(updateData);
  assertCanonicalLivingExpensesPayload(normalizedUpdateData);

  const existingExperience = await getOwnedExperienceOrThrow(
    experienceId,
    user.id,
  );
  assertEditableExperienceStatus(existingExperience);

  const submissionData: ExperienceUpdateData = {
    status: EXPERIENCE_STATUS.SUBMITTED,
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
        (
          submissionData.accommodation as ReturnType<
            typeof sanitizeAccommodationStepData
          >
        ).monthlyRent ??
        ((existingExperience.accommodation as Record<string, unknown> | null)
          ?.monthlyRent as number | null | undefined) ??
        null,
    },
  );

  validateSubmissionData(submissionData, existingExperience);

  const updatedExperience = (await retryDatabaseOperation(() =>
    prisma.$transaction(async (tx) => {
      const submissionCandidate = {
        id: existingExperience.id,
        status: EXPERIENCE_STATUS.SUBMITTED,
        isComplete: true,
        hostCity:
          (submissionData.hostCity as string | null | undefined) ??
          existingExperience.hostCity,
        hostCountry:
          (submissionData.hostCountry as string | null | undefined) ??
          existingExperience.hostCountry,
        hostUniversityId:
          (submissionData.hostUniversityId as string | null | undefined) ??
          existingExperience.hostUniversityId,
        homeUniversityId:
          (submissionData.homeUniversityId as string | null | undefined) ??
          existingExperience.homeUniversityId,
        courses: submissionData.courses ?? existingExperience.courses,
        accommodation:
          submissionData.accommodation ?? existingExperience.accommodation,
      };

      await persistSubmissionArtifacts(tx, submissionCandidate);
      await assertSubmissionCompleteness(tx, submissionCandidate);

      const experience = await tx.erasmusExperience.update({
        where: { id: experienceId },
        data: submissionData,
      });

      return experience;
    }),
  )) as ExperienceRecord;

  await runSubmissionPublishSideEffects(
    updatedExperience,
    onStatsRefreshError,
  );

  return updatedExperience;
}
