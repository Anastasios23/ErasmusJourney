import { prisma } from "../lib/prisma";
import { sanitizeAccommodationStepData } from "../src/lib/accommodation";
import { sanitizeBasicInformationData } from "../src/lib/basicInformation";
import { sanitizeCourseMappingsData } from "../src/lib/courseMatching";
import { sanitizeLivingExpensesStepData } from "../src/lib/livingExpenses";
import {
  getPublicDestinationDetailBySlug,
  getPublicDestinationList,
} from "../src/server/publicDestinations";

type ApprovedExperience = {
  hostCity: string;
  hostCountry: string;
  basicInfo: unknown;
  accommodation: unknown;
  livingExpenses: unknown;
  courses: unknown;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function toCityCountryKey(city: string, country: string): string {
  return `${city.toLowerCase().trim()}|${country.toLowerCase().trim()}`;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function calculateMonthlyTotal(values: Array<number | null>): number | null {
  const numericValues = values.filter(isFiniteNumber);
  if (numericValues.length === 0) {
    return null;
  }

  return numericValues.reduce((sum, value) => sum + value, 0);
}

function isLimitedCityData(submissionCount: number): boolean {
  return submissionCount < 5;
}

async function main(): Promise<void> {
  console.log("Running approved-to-public business proof checks...");

  const approvedExperiences: ApprovedExperience[] =
    await prisma.erasmusExperience
      .findMany({
        where: {
          status: "APPROVED",
          isComplete: true,
          hostCity: { not: null },
          hostCountry: { not: null },
        },
        select: {
          hostCity: true,
          hostCountry: true,
          basicInfo: true,
          accommodation: true,
          livingExpenses: true,
          courses: true,
        },
        orderBy: { updatedAt: "desc" },
      })
      .then((rows) =>
        rows.map((row) => ({
          hostCity: String(row.hostCity),
          hostCountry: String(row.hostCountry),
          basicInfo: row.basicInfo,
          accommodation: row.accommodation,
          livingExpenses: row.livingExpenses,
          courses: row.courses,
        })),
      );

  assert(
    approvedExperiences.length > 0,
    "No approved+complete experiences found for proof run. On a fresh local database, run `npm run db:seed:proof` first.",
  );

  const list = await getPublicDestinationList();
  assert(list.length > 0, "Public destination list is empty.");

  const firstDestination = list[0];
  const key = toCityCountryKey(firstDestination.city, firstDestination.country);

  const sourceExperiences = approvedExperiences.filter(
    (experience) =>
      toCityCountryKey(experience.hostCity, experience.hostCountry) === key,
  );

  assert(
    sourceExperiences.length > 0,
    "No approved source experiences found for selected destination key.",
  );

  assert(
    firstDestination.submissionCount === sourceExperiences.length,
    `List submissionCount mismatch: expected ${sourceExperiences.length}, got ${firstDestination.submissionCount}`,
  );

  const detail = await getPublicDestinationDetailBySlug(firstDestination.slug);
  assert(detail, "Detail payload missing for list destination slug.");

  assert(
    detail.submissionCount === sourceExperiences.length,
    `Detail submissionCount mismatch: expected ${sourceExperiences.length}, got ${detail.submissionCount}`,
  );

  const expectedLimitedData = isLimitedCityData(sourceExperiences.length);
  assert(
    detail.isLimitedData === expectedLimitedData,
    `Limited-data flag mismatch: expected ${expectedLimitedData}, got ${detail.isLimitedData}`,
  );

  const computedRentValues: number[] = [];
  const computedMonthlyTotals: number[] = [];
  let sourceCourseMappings = 0;
  let sourceAccommodationTypes = 0;

  for (const experience of sourceExperiences) {
    const basicInfo = sanitizeBasicInformationData(
      experience.basicInfo as Partial<Record<string, unknown>>,
    );
    const accommodation = sanitizeAccommodationStepData(
      experience.accommodation as Partial<Record<string, unknown>>,
    );
    const living = sanitizeLivingExpensesStepData(
      experience.livingExpenses as Partial<Record<string, unknown>>,
      {
        fallbackRent: isFiniteNumber(accommodation.monthlyRent)
          ? accommodation.monthlyRent
          : null,
      },
    );

    if (basicInfo.hostCity && basicInfo.hostCountry) {
      // no-op: ensures Step 1 data path still carries usable location context
    }

    if (isFiniteNumber(living.rent)) {
      computedRentValues.push(living.rent);
    }

    const monthlyTotal = calculateMonthlyTotal([
      living.rent,
      living.food,
      living.transport,
      living.social,
      living.travel,
      living.other,
    ]);

    if (isFiniteNumber(monthlyTotal)) {
      computedMonthlyTotals.push(monthlyTotal);
    }

    if (accommodation.accommodationType) {
      sourceAccommodationTypes += 1;
    }

    const mappings = sanitizeCourseMappingsData(experience.courses);
    sourceCourseMappings += mappings.length;
  }

  assert(
    detail.accommodationSummary.sampleSize === computedRentValues.length,
    `Accommodation sample size mismatch: expected ${computedRentValues.length}, got ${detail.accommodationSummary.sampleSize}`,
  );

  assert(
    detail.costSummary.sampleSize === computedMonthlyTotals.length,
    `Cost sample size mismatch: expected ${computedMonthlyTotals.length}, got ${detail.costSummary.sampleSize}`,
  );

  if (detail.accommodationSummary.isLimitedData) {
    assert(
      detail.accommodationSummary.types.length === 0,
      "Accommodation aggregate types must be hidden while limited-data guard is active.",
    );
    assert(
      detail.accommodationSummary.averageRent === null,
      "Accommodation average rent must be hidden while limited-data guard is active.",
    );
  } else if (sourceAccommodationTypes > 0) {
    assert(
      detail.accommodationSummary.types.length > 0,
      "Expected accommodation type insights to be populated from approved data.",
    );
  }

  if (sourceCourseMappings > 0) {
    assert(
      detail.courseEquivalenceExamples.length > 0,
      "Expected course equivalence examples to be populated from approved data.",
    );
  }

  console.log(
    `Business proof passed for ${detail.city}, ${detail.country}: approved submissions propagate to list/detail with aligned section metrics.`,
  );
}

main()
  .catch((error) => {
    console.error("Approved-to-public business proof failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
