import { prisma } from "../../../lib/prisma";
import {
  EXPERIENCE_STATUS,
  type ErasmusExperienceStatus,
} from "../../lib/canonicalWorkflow";
import {
  getAccommodationTypeLabel,
  getBillsIncludedLabel,
  getDifficultyFindingAccommodationLabel,
  getHowFoundAccommodationLabel,
  sanitizeAccommodationStepData,
} from "../../lib/accommodation";
import { sanitizeCourseMappingsData } from "../../lib/courseMatching";
import { refreshPublicDestinationReadModel } from "../publicDestinations";

type TransactionClient = Pick<
  typeof prisma,
  "courseMapping" | "accommodationReview"
>;

type PersistedExperience = {
  id: string;
  status?: ErasmusExperienceStatus | null;
  isComplete?: boolean | null;
  hostCity?: string | null;
  hostCountry?: string | null;
  hostUniversityId?: string | null;
  courses?: unknown;
  accommodation?: unknown;
};

export async function persistCourseMappings(
  tx: TransactionClient,
  experience: PersistedExperience,
): Promise<void> {
  if (!experience.courses || !experience.hostUniversityId) {
    return;
  }

  const mappings = sanitizeCourseMappingsData(experience.courses);

  await tx.courseMapping.deleteMany({
    where: { experienceId: experience.id },
  });

  if (mappings.length === 0) {
    return;
  }

  await tx.courseMapping.createMany({
    data: mappings.map((mapping) => ({
      experienceId: experience.id,
      universityId: experience.hostUniversityId!,
      homeCourseCode: mapping.homeCourseCode || null,
      homeCourseName: mapping.homeCourseName || "",
      homeCredits: mapping.homeECTS || 0,
      hostCourseCode: mapping.hostCourseCode || null,
      hostCourseName: mapping.hostCourseName || "",
      hostCredits: mapping.hostECTS || 0,
      status: "APPROVED",
    })),
  });
}

export async function persistAccommodationReview(
  tx: TransactionClient,
  experience: PersistedExperience,
): Promise<void> {
  if (!experience.accommodation) {
    return;
  }

  const accommodation = sanitizeAccommodationStepData(
    experience.accommodation &&
      typeof experience.accommodation === "object" &&
      !Array.isArray(experience.accommodation)
      ? (experience.accommodation as Record<string, unknown>)
      : null,
  );

  await tx.accommodationReview.deleteMany({
    where: { experienceId: experience.id },
  });

  if (
    !accommodation.accommodationType ||
    typeof accommodation.monthlyRent !== "number" ||
    typeof accommodation.accommodationRating !== "number"
  ) {
    return;
  }

  const structuredNotes = [
    accommodation.billsIncluded
      ? `Bills included: ${getBillsIncludedLabel(accommodation.billsIncluded)}`
      : null,
    accommodation.minutesToUniversity !== undefined
      ? `${accommodation.minutesToUniversity} minutes to university`
      : null,
    accommodation.howFoundAccommodation
      ? `Found via ${getHowFoundAccommodationLabel(
          accommodation.howFoundAccommodation,
        )}`
      : null,
    accommodation.difficultyFindingAccommodation
      ? `Finding difficulty: ${getDifficultyFindingAccommodationLabel(
          accommodation.difficultyFindingAccommodation,
        )}`
      : null,
    typeof accommodation.wouldRecommend === "boolean"
      ? accommodation.wouldRecommend
        ? "Student would recommend it"
        : "Student would not recommend it"
      : null,
  ].filter(Boolean);

  await tx.accommodationReview.create({
    data: {
      experienceId: experience.id,
      name: `${getAccommodationTypeLabel(accommodation.accommodationType)} in ${
        accommodation.areaOrNeighborhood || experience.hostCity || "City"
      }`,
      type: accommodation.accommodationType,
      neighborhood: accommodation.areaOrNeighborhood || null,
      pricePerMonth: accommodation.monthlyRent,
      currency: accommodation.currency || "EUR",
      rating: accommodation.accommodationRating,
      comment:
        accommodation.accommodationReview ||
        (structuredNotes.length > 0 ? structuredNotes.join(". ") : null),
    },
  });
}

export async function persistSubmissionArtifacts(
  tx: TransactionClient,
  experience: PersistedExperience,
): Promise<void> {
  await persistCourseMappings(tx, experience);
  await persistAccommodationReview(tx, experience);
}

export async function refreshPublicDestinationReadModelIfNeeded(
  experience: PersistedExperience,
): Promise<void> {
  if (
    experience.status === EXPERIENCE_STATUS.APPROVED &&
    experience.isComplete &&
    experience.hostCity &&
    experience.hostCountry
  ) {
    await refreshPublicDestinationReadModel();
  }
}

export function triggerStatsRefresh(
  experience: PersistedExperience,
  onError?: (error: unknown, context: { experienceId: string }) => void,
): void {
  // CityStatistics was removed from the canonical schema; keep this hook inert.
  void experience;
  void onError;
}
