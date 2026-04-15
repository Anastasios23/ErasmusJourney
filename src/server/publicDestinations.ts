import { prisma } from "../../lib/prisma";
import {
  getAccommodationTypeLabel,
  getDifficultyFindingAccommodationLabel,
  sanitizeAccommodationStepData,
} from "../lib/accommodation";
import { sanitizeBasicInformationData } from "../lib/basicInformation";
import {
  getCanonicalDepartmentLabel,
  getDepartmentMatchKey,
} from "../lib/departmentNormalization";
import { sanitizeCourseMappingsData } from "../lib/courseMatching";
import { sanitizeLivingExpensesStepData } from "../lib/livingExpenses";
import {
  normalizePublicDestinationText,
  sanitizePublicDestinationArea,
  sanitizePublicDestinationNarrative,
} from "../lib/publicDestinationPresentation";
import { PUBLIC_DESTINATION_READ_MODEL_TTL_MS } from "../lib/publicDestinationCache";
import { buildPreviewUnavailableReason } from "../lib/adminPublicImpactPreview";
import { EXPERIENCE_STATUS } from "../lib/canonicalWorkflow";
import { getExperiencePublicWordingEdits } from "../lib/experienceModeration";
import type { AdminPublicImpactPreview } from "../types/adminPublicImpactPreview";
import type {
  PublicDestinationAccommodationInsights,
  PublicDestinationCourseEquivalenceGroup,
  PublicDestinationCourseExample,
  PublicDestinationCourseEquivalences,
  PublicDestinationDetail,
  PublicDestinationListItem,
  PublicDestinationReadModelDetail,
} from "../types/publicDestinations";

type RawExperience = {
  id: string;
  hostCity: string | null;
  hostCountry: string | null;
  hostUniversityId: string | null;
  publicWordingOverrides: unknown;
  submittedAt: Date | null;
  updatedAt: Date;
  hostUniversity: { name: string } | null;
  basicInfo: unknown;
  accommodation: unknown;
  livingExpenses: unknown;
  courses: unknown;
  experience: unknown;
};

type GroupedCourseEquivalence = {
  homeUniversity: string;
  homeDepartment: string;
  hostUniversity?: string;
  homeCourseName: string;
  hostCourseName: string;
  credits?: number | null;
  recognitionType: string;
  notes?: string;
};

type GroupedDestinationData = {
  slug: string;
  city: string;
  country: string;
  universities: Set<string>;
  submissionCount: number;
  latestReportSubmittedAt: Date | null;
  rents: number[];
  monthlyCosts: number[];
  livingFood: number[];
  livingTransport: number[];
  livingSocial: number[];
  livingTravel: number[];
  livingOther: number[];
  accommodationSubmissionCount: number;
  accommodationType: Map<string, { count: number; rents: number[] }>;
  accommodationDifficulty: Map<string, number>;
  accommodationRecommendationYesCount: number;
  accommodationRecommendationTotal: number;
  accommodationAreas: Map<string, number>;
  accommodationReviewSnippets: string[];
  currencies: Map<string, number>;
  courseEquivalences: GroupedCourseEquivalence[];
  practicalTips: string[];
};

type PublicDestinationReadModel = {
  destinations: PublicDestinationListItem[];
  detailsBySlug: Map<string, PublicDestinationDetail>;
  accommodationBySlug: Map<string, PublicDestinationAccommodationInsights>;
  courseEquivalencesBySlug: Map<
    string,
    PublicDestinationCourseEquivalences
  >;
};

type PersistedPublicDestinationReadModelRow = {
  slug: string;
  city: string;
  country: string;
  hostUniversityCount: number;
  submissionCount: number;
  latestReportSubmittedAt: Date | null;
  averageRent: number | null;
  averageMonthlyCost: number | null;
  detail: unknown;
  accommodation: unknown;
  courseEquivalences: unknown;
};

type PublicDestinationReadModelCacheEntry = {
  expiresAt: number;
  value: PublicDestinationReadModel;
};

type DestinationIdentity = {
  slug: string;
  city: string;
  country: string;
};

type PublicDestinationCityView = {
  listItem: PublicDestinationListItem;
  detail: PublicDestinationDetail;
  accommodation: PublicDestinationAccommodationInsights;
  courseEquivalences: PublicDestinationCourseEquivalences;
};

let publicDestinationReadModelCache:
  | PublicDestinationReadModelCacheEntry
  | null = null;
let publicDestinationReadModelPromise: Promise<PublicDestinationReadModel> | null =
  null;
let publicDestinationRefreshPromise: Promise<void> | null = null;

const CITY_SPARSE_DATA_THRESHOLD = 5;
const AGGREGATE_SPARSE_DATA_THRESHOLD = 3;

const RAW_EXPERIENCE_SELECT = {
  id: true,
  hostCity: true,
  hostCountry: true,
  hostUniversityId: true,
  publicWordingOverrides: true,
  submittedAt: true,
  updatedAt: true,
  hostUniversity: {
    select: {
      name: true,
    },
  },
  basicInfo: true,
  accommodation: true,
  livingExpenses: true,
  courses: true,
  experience: true,
} as const;

function toRecord(value: unknown): Partial<Record<string, unknown>> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Partial<Record<string, unknown>>;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function destinationSlug(city: string, country: string): string {
  return `${slugify(city)}-${slugify(country)}`;
}

function normalizeCurrency(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return normalized || null;
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function percentage(part: number, total: number): number | null {
  if (total <= 0) {
    return null;
  }

  return Number(((part / total) * 100).toFixed(0));
}

function toIsoDate(value: Date | null): string | null {
  return value instanceof Date ? value.toISOString() : null;
}

function pushIfNumber(
  target: number[],
  value: number | null | undefined,
): void {
  if (typeof value === "number" && Number.isFinite(value)) {
    target.push(value);
  }
}

function sumCounts(values: Map<string, number>): number {
  return Array.from(values.values()).reduce((sum, value) => sum + value, 0);
}

function isLimitedCityData(submissionCount: number): boolean {
  return submissionCount < CITY_SPARSE_DATA_THRESHOLD;
}

function canShowAggregate(
  submissionCount: number,
  aggregateSampleSize: number,
): boolean {
  return (
    !isLimitedCityData(submissionCount) &&
    aggregateSampleSize >= AGGREGATE_SPARSE_DATA_THRESHOLD
  );
}

function dedupeCaseInsensitive(values: string[]): string[] {
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(value);
  }

  return deduped;
}

function recognitionLabel(recognitionType: string): string {
  switch (recognitionType) {
    case "full_equivalence":
      return "Full equivalence";
    case "department_elective":
      return "Department elective";
    case "free_elective":
      return "Free elective";
    case "other":
      return "Other";
    default:
      return "Unspecified";
  }
}

function deriveCurrency(currencies: Map<string, number>): string {
  if (currencies.size === 0) {
    return "EUR";
  }

  if (currencies.size === 1) {
    return Array.from(currencies.keys())[0];
  }

  const [topCurrency] = Array.from(currencies.entries()).sort(
    (left, right) => right[1] - left[1],
  );

  if (!topCurrency) {
    return "EUR";
  }

  return `${topCurrency[0]} (mixed)`;
}

function buildMonthlyTotal(values: {
  rent: number | null;
  food: number | null;
  transport: number | null;
  social: number | null;
  travel: number | null;
  other: number | null;
}): number | null {
  const items = [
    values.rent,
    values.food,
    values.transport,
    values.social,
    values.travel,
    values.other,
  ].filter(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  );

  if (items.length === 0) {
    return null;
  }

  return Number(items.reduce((sum, value) => sum + value, 0).toFixed(2));
}

function hasAccommodationSignals(
  value: ReturnType<typeof sanitizeAccommodationStepData>,
): boolean {
  return Boolean(
    value.accommodationType ||
      typeof value.monthlyRent === "number" ||
      value.areaOrNeighborhood ||
      value.difficultyFindingAccommodation ||
      typeof value.wouldRecommend === "boolean" ||
      value.accommodationReview,
  );
}

function normalizeLabel(value: unknown, maxLength = 140): string {
  return normalizePublicDestinationText(value, { maxLength }) || "";
}

function getEffectivePublicWording(
  overrideValue: string | null | undefined,
  rawValue: unknown,
): string {
  if (overrideValue === null) {
    return "";
  }

  if (typeof overrideValue === "string") {
    return overrideValue;
  }

  return typeof rawValue === "string" ? rawValue : "";
}

function getDestinationIdentity(
  cityValue: string | null | undefined,
  countryValue: string | null | undefined,
): DestinationIdentity | null {
  const city = typeof cityValue === "string" ? cityValue.trim() : "";
  const country = typeof countryValue === "string" ? countryValue.trim() : "";

  if (!city || !country) {
    return null;
  }

  return {
    slug: destinationSlug(city, country),
    city,
    country,
  };
}

async function loadApprovedExperiences(): Promise<RawExperience[]> {
  return prisma.erasmusExperience.findMany({
    where: {
      status: EXPERIENCE_STATUS.APPROVED,
      isComplete: true,
      hostCity: { not: null },
      hostCountry: { not: null },
    },
    select: RAW_EXPERIENCE_SELECT,
    orderBy: { updatedAt: "desc" },
  });
}

async function loadExperienceById(id: string): Promise<RawExperience | null> {
  return prisma.erasmusExperience.findUnique({
    where: { id },
    select: RAW_EXPERIENCE_SELECT,
  });
}

function buildGroupedDestinations(
  experiences: RawExperience[],
): Map<string, GroupedDestinationData> {
  const grouped = new Map<string, GroupedDestinationData>();

  for (const experience of experiences) {
    const city = (experience.hostCity || "").trim();
    const country = (experience.hostCountry || "").trim();

    if (!city || !country) {
      continue;
    }

    const slug = destinationSlug(city, country);
    const key = `${city.toLowerCase()}|${country.toLowerCase()}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        slug,
        city,
        country,
        universities: new Set<string>(),
        submissionCount: 0,
        latestReportSubmittedAt: null,
        rents: [],
        monthlyCosts: [],
        livingFood: [],
        livingTransport: [],
        livingSocial: [],
        livingTravel: [],
        livingOther: [],
        accommodationSubmissionCount: 0,
        accommodationType: new Map<string, { count: number; rents: number[] }>(),
        accommodationDifficulty: new Map<string, number>(),
        accommodationRecommendationYesCount: 0,
        accommodationRecommendationTotal: 0,
        accommodationAreas: new Map<string, number>(),
        accommodationReviewSnippets: [],
        currencies: new Map<string, number>(),
        courseEquivalences: [],
        practicalTips: [],
      });
    }

    const destination = grouped.get(key)!;
    destination.submissionCount += 1;
    const freshnessCandidate = experience.submittedAt ?? experience.updatedAt;
    if (
      freshnessCandidate &&
      (!destination.latestReportSubmittedAt ||
        freshnessCandidate.getTime() >
          destination.latestReportSubmittedAt.getTime())
    ) {
      destination.latestReportSubmittedAt = freshnessCandidate;
    }

    const basicInfo = sanitizeBasicInformationData(
      toRecord(experience.basicInfo),
    );
    const publicWordingEdits = getExperiencePublicWordingEdits(
      experience.publicWordingOverrides,
    );
    const accommodation = sanitizeAccommodationStepData(
      toRecord(experience.accommodation),
    );
    const livingExpenses = sanitizeLivingExpensesStepData(
      toRecord(experience.livingExpenses),
      {
        fallbackRent:
          typeof accommodation.monthlyRent === "number"
            ? accommodation.monthlyRent
            : null,
      },
    );

    const hostUniversity =
      normalizeLabel(basicInfo.hostUniversity, 140) ||
      normalizeLabel(experience.hostUniversity?.name, 140);
    if (hostUniversity) {
      destination.universities.add(hostUniversity);
    }

    const normalizedCurrency = normalizeCurrency(livingExpenses.currency);
    if (normalizedCurrency) {
      destination.currencies.set(
        normalizedCurrency,
        (destination.currencies.get(normalizedCurrency) || 0) + 1,
      );
    }

    const rent = livingExpenses.rent ?? accommodation.monthlyRent;
    pushIfNumber(destination.rents, rent);
    pushIfNumber(destination.livingFood, livingExpenses.food);
    pushIfNumber(destination.livingTransport, livingExpenses.transport);
    pushIfNumber(destination.livingSocial, livingExpenses.social);
    pushIfNumber(destination.livingTravel, livingExpenses.travel);
    pushIfNumber(destination.livingOther, livingExpenses.other);

    const monthlyTotal = buildMonthlyTotal({
      rent,
      food: livingExpenses.food,
      transport: livingExpenses.transport,
      social: livingExpenses.social,
      travel: livingExpenses.travel,
      other: livingExpenses.other,
    });
    pushIfNumber(destination.monthlyCosts, monthlyTotal);

    if (hasAccommodationSignals(accommodation)) {
      destination.accommodationSubmissionCount += 1;
    }

    if (accommodation.accommodationType) {
      const label = getAccommodationTypeLabel(accommodation.accommodationType);
      const current = destination.accommodationType.get(label) || {
        count: 0,
        rents: [],
      };

      current.count += 1;
      pushIfNumber(current.rents, rent);
      destination.accommodationType.set(label, current);
    }

    if (accommodation.difficultyFindingAccommodation) {
      const level = getDifficultyFindingAccommodationLabel(
        accommodation.difficultyFindingAccommodation,
      );
      destination.accommodationDifficulty.set(
        level,
        (destination.accommodationDifficulty.get(level) || 0) + 1,
      );
    }

    if (typeof accommodation.wouldRecommend === "boolean") {
      destination.accommodationRecommendationTotal += 1;
      if (accommodation.wouldRecommend) {
        destination.accommodationRecommendationYesCount += 1;
      }
    }

    const area = sanitizePublicDestinationArea(accommodation.areaOrNeighborhood);
    if (area) {
      destination.accommodationAreas.set(
        area,
        (destination.accommodationAreas.get(area) || 0) + 1,
      );
    }

    const reviewSnippet = sanitizePublicDestinationNarrative(
      getEffectivePublicWording(
        publicWordingEdits.accommodationReview,
        accommodation.accommodationReview,
      ),
      { maxLength: 180 },
    );
    if (reviewSnippet) {
      destination.accommodationReviewSnippets.push(reviewSnippet);
    }

    const courseMappings = sanitizeCourseMappingsData(experience.courses);
    const homeUniversity =
      normalizeLabel(basicInfo.homeUniversity, 140) ||
      "Unspecified home university";
    const canonicalDepartment = getCanonicalDepartmentLabel(
      basicInfo.homeDepartment,
    );
    const homeDepartment = normalizeLabel(canonicalDepartment, 120);

    for (const mapping of courseMappings) {
      const homeCourseName = normalizeLabel(mapping.homeCourseName, 160);
      const hostCourseName = normalizeLabel(mapping.hostCourseName, 160);

      if (!homeCourseName || !hostCourseName) {
        continue;
      }

      destination.courseEquivalences.push({
        homeUniversity,
        homeDepartment,
        hostUniversity: hostUniversity || undefined,
        homeCourseName,
        hostCourseName,
        credits: mapping.hostECTS ?? mapping.homeECTS ?? null,
        recognitionType: recognitionLabel(mapping.recognitionType),
        notes:
          sanitizePublicDestinationNarrative(
            getEffectivePublicWording(
              publicWordingEdits.courseNotes?.[mapping.id],
              mapping.notes,
            ),
            {
              maxLength: 220,
            },
          ) || undefined,
      });
    }

    const experienceData = toRecord(experience.experience);
    const tips = [
      sanitizePublicDestinationNarrative(
        getEffectivePublicWording(
          publicWordingEdits.generalTips,
          experienceData?.generalTips,
        ),
        {
          maxLength: 220,
        },
      ),
      sanitizePublicDestinationNarrative(
        getEffectivePublicWording(
          publicWordingEdits.academicAdvice,
          experienceData?.academicAdvice,
        ),
        {
          maxLength: 220,
        },
      ),
      sanitizePublicDestinationNarrative(
        getEffectivePublicWording(
          publicWordingEdits.socialAdvice,
          experienceData?.socialAdvice,
        ),
        {
          maxLength: 220,
        },
      ),
      sanitizePublicDestinationNarrative(
        getEffectivePublicWording(
          publicWordingEdits.bestExperience,
          experienceData?.bestExperience,
        ),
        {
          maxLength: 220,
        },
      ),
    ].filter((tip): tip is string => Boolean(tip));

    destination.practicalTips.push(...tips);
  }

  return grouped;
}

function findDestinationBySlug(
  grouped: Map<string, GroupedDestinationData>,
  slug: string,
): GroupedDestinationData | null {
  return (
    Array.from(grouped.values()).find((destination) => destination.slug === slug) ||
    null
  );
}

function isSameDestination(
  experience: RawExperience,
  destination: DestinationIdentity,
): boolean {
  return (
    experience.hostCity?.trim().toLowerCase() ===
      destination.city.toLowerCase() &&
    experience.hostCountry?.trim().toLowerCase() ===
      destination.country.toLowerCase()
  );
}

function selectDestinationRecords(
  experiences: RawExperience[],
  destination: DestinationIdentity,
): RawExperience[] {
  return experiences.filter((experience) =>
    isSameDestination(experience, destination),
  );
}

function toListItem(
  destination: GroupedDestinationData,
): PublicDestinationListItem {
  const isLimitedData = isLimitedCityData(destination.submissionCount);

  return {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    hostUniversityCount: destination.universities.size,
    submissionCount: destination.submissionCount,
    latestReportSubmittedAt: toIsoDate(destination.latestReportSubmittedAt),
    isLimitedData,
    averageRent: canShowAggregate(destination.submissionCount, destination.rents.length)
      ? average(destination.rents)
      : null,
    averageMonthlyCost: canShowAggregate(
      destination.submissionCount,
      destination.monthlyCosts.length,
    )
      ? average(destination.monthlyCosts)
      : null,
  };
}

function buildDestinationDetail(
  destination: GroupedDestinationData,
): PublicDestinationDetail {
  const isLimitedData = isLimitedCityData(destination.submissionCount);
  const canShowCostSummary = canShowAggregate(
    destination.submissionCount,
    destination.monthlyCosts.length,
  );
  const canShowAccommodationSummary = canShowAggregate(
    destination.submissionCount,
    destination.accommodationSubmissionCount,
  );
  const courseSampleSize = destination.courseEquivalences.length;
  const courseIsLimitedData =
    isLimitedData || courseSampleSize < AGGREGATE_SPARSE_DATA_THRESHOLD;
  const uniqueTips = dedupeCaseInsensitive(destination.practicalTips).slice(
    0,
    8,
  );

  return {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    hostUniversityCount: destination.universities.size,
    submissionCount: destination.submissionCount,
    latestReportSubmittedAt: toIsoDate(destination.latestReportSubmittedAt),
    isLimitedData,
    averageRent: canShowCostSummary ? average(destination.rents) : null,
    averageMonthlyCost: canShowCostSummary
      ? average(destination.monthlyCosts)
      : null,
    accommodationSummary: {
      sampleSize: destination.accommodationSubmissionCount,
      isLimitedData: !canShowAccommodationSummary,
      averageRent: canShowAccommodationSummary ? average(destination.rents) : null,
      types: canShowAccommodationSummary
        ? Array.from(destination.accommodationType.entries())
            .map(([type, value]) => ({
              type,
              count: value.count,
              averageRent: average(value.rents),
            }))
            .sort((left, right) => right.count - left.count)
        : [],
      difficulty: canShowAccommodationSummary
        ? Array.from(destination.accommodationDifficulty.entries())
            .map(([level, count]) => ({ level, count }))
            .sort((left, right) => right.count - left.count)
        : [],
    },
    costSummary: {
      currency: deriveCurrency(destination.currencies),
      sampleSize: destination.monthlyCosts.length,
      isLimitedData: !canShowCostSummary,
      averageRent: canShowCostSummary ? average(destination.rents) : null,
      averageFood: canShowCostSummary ? average(destination.livingFood) : null,
      averageTransport: canShowCostSummary
        ? average(destination.livingTransport)
        : null,
      averageSocial: canShowCostSummary ? average(destination.livingSocial) : null,
      averageTravel: canShowCostSummary ? average(destination.livingTravel) : null,
      averageOther: canShowCostSummary ? average(destination.livingOther) : null,
      averageMonthlyCost: canShowCostSummary
        ? average(destination.monthlyCosts)
        : null,
    },
    courseSampleSize,
    courseIsLimitedData,
    courseEquivalenceExamples: buildUniqueCourseExamples(
      destination.courseEquivalences,
    ),
    practicalTips: uniqueTips,
  };
}

function buildAccommodationInsights(
  destination: GroupedDestinationData,
): PublicDestinationAccommodationInsights {
  const isLimitedData =
    isLimitedCityData(destination.submissionCount) ||
    destination.accommodationSubmissionCount < AGGREGATE_SPARSE_DATA_THRESHOLD;
  const canShowRentAggregate = canShowAggregate(
    destination.submissionCount,
    destination.rents.length,
  );
  const canShowRecommendationAggregate = canShowAggregate(
    destination.submissionCount,
    destination.accommodationRecommendationTotal,
  );
  const typeSampleSize = Array.from(destination.accommodationType.values()).reduce(
    (sum, value) => sum + value.count,
    0,
  );
  const difficultySampleSize = sumCounts(destination.accommodationDifficulty);
  const areaSampleSize = sumCounts(destination.accommodationAreas);
  const reviewSnippetSampleSize = destination.accommodationReviewSnippets.length;
  const canShowTypeAggregate = canShowAggregate(
    destination.submissionCount,
    typeSampleSize,
  );
  const canShowDifficultyAggregate = canShowAggregate(
    destination.submissionCount,
    difficultySampleSize,
  );
  const canShowAreaAggregate = canShowAggregate(
    destination.submissionCount,
    areaSampleSize,
  );
  const canShowReviewSnippets = canShowAggregate(
    destination.submissionCount,
    reviewSnippetSampleSize,
  );

  return {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    hostUniversityCount: destination.universities.size,
    submissionCount: destination.submissionCount,
    latestReportSubmittedAt: toIsoDate(destination.latestReportSubmittedAt),
    isLimitedData,
    currency: deriveCurrency(destination.currencies),
    sampleSize: destination.accommodationSubmissionCount,
    rentSampleSize: destination.rents.length,
    averageRent: canShowRentAggregate ? average(destination.rents) : null,
    recommendationRate: canShowRecommendationAggregate
      ? percentage(
          destination.accommodationRecommendationYesCount,
          destination.accommodationRecommendationTotal,
        )
      : null,
    recommendationSampleSize: destination.accommodationRecommendationTotal,
    recommendationYesCount: destination.accommodationRecommendationYesCount,
    types: canShowTypeAggregate
      ? Array.from(destination.accommodationType.entries())
          .map(([type, value]) => ({
            type,
            count: value.count,
            averageRent: average(value.rents),
          }))
          .sort((left, right) => right.count - left.count)
      : [],
    difficulty: canShowDifficultyAggregate
      ? Array.from(destination.accommodationDifficulty.entries())
          .map(([level, count]) => ({ level, count }))
          .sort((left, right) => right.count - left.count)
      : [],
    commonAreas: canShowAreaAggregate
      ? Array.from(destination.accommodationAreas.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((left, right) => {
            if (right.count !== left.count) {
              return right.count - left.count;
            }

            return left.name.localeCompare(right.name);
          })
          .slice(0, 8)
      : [],
    reviewSnippets: canShowReviewSnippets
      ? dedupeCaseInsensitive(destination.accommodationReviewSnippets).slice(0, 6)
      : [],
  };
}

function buildCourseEquivalences(
  destination: GroupedDestinationData,
): PublicDestinationCourseEquivalences {
  const groups = buildCourseEquivalenceGroups(destination.courseEquivalences);
  const homeUniversities = new Set(
    groups.map((group) => group.homeUniversity.toLowerCase()),
  );
  const totalMappings = destination.courseEquivalences.length;

  return {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    hostUniversityCount: destination.universities.size,
    submissionCount: destination.submissionCount,
    latestReportSubmittedAt: toIsoDate(destination.latestReportSubmittedAt),
    isLimitedData:
      isLimitedCityData(destination.submissionCount) ||
      totalMappings < AGGREGATE_SPARSE_DATA_THRESHOLD,
    homeUniversityCount: homeUniversities.size,
    totalMappings,
    groups,
  };
}

function buildCityPublicViewFromGroupedDestination(
  destination: GroupedDestinationData,
): PublicDestinationCityView {
  const detail = buildDestinationDetail(destination);
  const accommodation = buildAccommodationInsights(destination);
  const courseEquivalences = buildCourseEquivalences(destination);

  return {
    listItem: toListItem(destination),
    detail,
    accommodation,
    courseEquivalences,
  };
}

function buildCityPublicView(
  experiences: RawExperience[],
  destination: DestinationIdentity,
): PublicDestinationCityView | null {
  const grouped = buildGroupedDestinations(
    selectDestinationRecords(experiences, destination),
  );
  const groupedDestination = findDestinationBySlug(grouped, destination.slug);

  if (!groupedDestination) {
    return null;
  }

  return buildCityPublicViewFromGroupedDestination(groupedDestination);
}

function buildPendingAccommodationContribution(
  experience: RawExperience,
): AdminPublicImpactPreview["accommodation"]["contribution"] {
  const publicWordingEdits = getExperiencePublicWordingEdits(
    experience.publicWordingOverrides,
  );
  const accommodation = sanitizeAccommodationStepData(
    toRecord(experience.accommodation),
  );

  const type = accommodation.accommodationType
    ? getAccommodationTypeLabel(accommodation.accommodationType)
    : undefined;
  const area = sanitizePublicDestinationArea(accommodation.areaOrNeighborhood);
  const difficulty = accommodation.difficultyFindingAccommodation
    ? getDifficultyFindingAccommodationLabel(
        accommodation.difficultyFindingAccommodation,
      )
    : undefined;
  const reviewSnippet = sanitizePublicDestinationNarrative(
    getEffectivePublicWording(
      publicWordingEdits.accommodationReview,
      accommodation.accommodationReview,
    ),
    { maxLength: 180 },
  );

  if (
    !type &&
    typeof accommodation.monthlyRent !== "number" &&
    !area &&
    !difficulty &&
    typeof accommodation.wouldRecommend !== "boolean" &&
    !reviewSnippet
  ) {
    return null;
  }

  return {
    type,
    rent: accommodation.monthlyRent,
    currency: accommodation.currency || "EUR",
    area: area || undefined,
    difficulty,
    wouldRecommend: accommodation.wouldRecommend,
    reviewSnippet: reviewSnippet || undefined,
  };
}

function buildPendingCourseContributionExamples(
  experience: RawExperience,
): AdminPublicImpactPreview["courses"]["contributionExamples"] {
  const basicInfo = sanitizeBasicInformationData(toRecord(experience.basicInfo));
  const publicWordingEdits = getExperiencePublicWordingEdits(
    experience.publicWordingOverrides,
  );
  const homeUniversity =
    normalizeLabel(basicInfo.homeUniversity, 140) ||
    "Unspecified home university";
  const homeDepartment = normalizeLabel(
    getCanonicalDepartmentLabel(basicInfo.homeDepartment),
    120,
  );
  const hostUniversity =
    normalizeLabel(basicInfo.hostUniversity, 140) ||
    normalizeLabel(experience.hostUniversity?.name, 140) ||
    undefined;

  const examples: AdminPublicImpactPreview["courses"]["contributionExamples"] =
    [];

  for (const mapping of sanitizeCourseMappingsData(experience.courses)) {
    const homeCourseName = normalizeLabel(mapping.homeCourseName, 160);
    const hostCourseName = normalizeLabel(mapping.hostCourseName, 160);

    if (!homeCourseName || !hostCourseName) {
      continue;
    }

    examples.push({
      homeUniversity,
      homeDepartment: homeDepartment || undefined,
      hostUniversity,
      homeCourseName,
      hostCourseName,
      recognitionType: recognitionLabel(mapping.recognitionType),
      notes:
        sanitizePublicDestinationNarrative(
          getEffectivePublicWording(
            publicWordingEdits.courseNotes?.[mapping.id],
            mapping.notes,
          ),
          {
            maxLength: 220,
          },
        ) || undefined,
    });

    if (examples.length >= 6) {
      break;
    }
  }

  return examples;
}

function buildUniqueCourseExamples(
  entries: GroupedCourseEquivalence[],
): PublicDestinationCourseExample[] {
  return Array.from(
    new Map(
      entries.map((entry) => [
        `${entry.homeCourseName}|${entry.hostCourseName}|${entry.recognitionType}`,
        {
          homeCourseName: entry.homeCourseName,
          hostCourseName: entry.hostCourseName,
          credits: entry.credits ?? null,
          recognitionType: entry.recognitionType,
          ...(typeof entry.notes === "string" ? { notes: entry.notes } : {}),
        },
      ]),
    ).values(),
  ).slice(0, 8);
}

function buildCourseEquivalenceGroups(
  entries: GroupedCourseEquivalence[],
): PublicDestinationCourseEquivalenceGroup[] {
  const grouped = new Map<
    string,
    {
      homeUniversity: string;
      homeDepartment?: string;
      hostUniversities: Set<string>;
      entries: GroupedCourseEquivalence[];
    }
  >();

  for (const entry of entries) {
    const departmentKey = entry.homeDepartment
      ? getDepartmentMatchKey(entry.homeDepartment)
      : "__none__";
    const key = `${entry.homeUniversity.toLowerCase()}|${departmentKey}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        homeUniversity: entry.homeUniversity,
        homeDepartment: entry.homeDepartment || undefined,
        hostUniversities: new Set<string>(),
        entries: [],
      });
    }

    const group = grouped.get(key)!;
    if (entry.hostUniversity) {
      group.hostUniversities.add(entry.hostUniversity);
    }
    group.entries.push(entry);
  }

  return Array.from(grouped.values())
    .map((group) => {
      const examples = Array.from(
        new Map(
          group.entries.map((entry) => [
            [
              entry.homeCourseName,
              entry.hostCourseName,
              entry.hostUniversity || "",
              entry.recognitionType,
              entry.notes || "",
            ].join("|"),
            {
              homeCourseName: entry.homeCourseName,
              hostCourseName: entry.hostCourseName,
              credits: entry.credits ?? null,
              ...(typeof entry.hostUniversity === "string"
                ? { hostUniversity: entry.hostUniversity }
                : {}),
              recognitionType: entry.recognitionType,
              ...(typeof entry.notes === "string" ? { notes: entry.notes } : {}),
            },
          ]),
        ).values(),
      ).slice(0, 12);

      return {
        homeUniversity: group.homeUniversity,
        ...(typeof group.homeDepartment === "string"
          ? { homeDepartment: group.homeDepartment }
          : {}),
        mappingCount: group.entries.length,
        hostUniversities: Array.from(group.hostUniversities).sort((left, right) =>
          left.localeCompare(right),
        ),
        examples,
      };
    })
    .sort((left, right) => {
      if (right.mappingCount !== left.mappingCount) {
        return right.mappingCount - left.mappingCount;
      }

      const universityComparison = left.homeUniversity.localeCompare(
        right.homeUniversity,
      );
      if (universityComparison !== 0) {
        return universityComparison;
      }

      return (left.homeDepartment || "").localeCompare(
        right.homeDepartment || "",
      );
    });
}

function sortGroupedDestinations(
  grouped: Map<string, GroupedDestinationData>,
): GroupedDestinationData[] {
  return Array.from(grouped.values()).sort((left, right) => {
    if (right.submissionCount !== left.submissionCount) {
      return right.submissionCount - left.submissionCount;
    }

    return left.city.localeCompare(right.city);
  });
}

function buildPublicDestinationReadModel(
  experiences: RawExperience[],
): PublicDestinationReadModel {
  const grouped = buildGroupedDestinations(experiences);
  const sortedDestinations = sortGroupedDestinations(grouped);
  const detailsBySlug = new Map<string, PublicDestinationDetail>();
  const accommodationBySlug = new Map<
    string,
    PublicDestinationAccommodationInsights
  >();
  const courseEquivalencesBySlug = new Map<
    string,
    PublicDestinationCourseEquivalences
  >();

  const destinations = sortedDestinations.map((destination) => {
    const cityView = buildCityPublicViewFromGroupedDestination(destination);

    detailsBySlug.set(destination.slug, cityView.detail);
    accommodationBySlug.set(destination.slug, cityView.accommodation);
    courseEquivalencesBySlug.set(
      destination.slug,
      cityView.courseEquivalences,
    );

    return cityView.listItem;
  });

  return {
    destinations,
    detailsBySlug,
    accommodationBySlug,
    courseEquivalencesBySlug,
  };
}

function createEmptyPublicDestinationReadModel(): PublicDestinationReadModel {
  return {
    destinations: [],
    detailsBySlug: new Map<string, PublicDestinationDetail>(),
    accommodationBySlug: new Map<
      string,
      PublicDestinationAccommodationInsights
    >(),
    courseEquivalencesBySlug: new Map<
      string,
      PublicDestinationCourseEquivalences
    >(),
  };
}

function buildPersistedPublicDestinationReadModel(
  rows: PersistedPublicDestinationReadModelRow[],
): PublicDestinationReadModel {
  const readModel = createEmptyPublicDestinationReadModel();

  for (const row of rows) {
    const detail = toRecord(row.detail) as unknown as
      | PublicDestinationDetail
      | null;
    const accommodation = toRecord(
      row.accommodation,
    ) as unknown as PublicDestinationAccommodationInsights | null;
    const courseEquivalences = toRecord(
      row.courseEquivalences,
    ) as unknown as PublicDestinationCourseEquivalences | null;

    if (!detail || !accommodation || !courseEquivalences) {
      continue;
    }

    readModel.destinations.push({
      slug: row.slug,
      city: row.city,
      country: row.country,
      hostUniversityCount: row.hostUniversityCount,
      submissionCount: row.submissionCount,
      latestReportSubmittedAt: toIsoDate(row.latestReportSubmittedAt),
      isLimitedData: isLimitedCityData(row.submissionCount),
      averageRent: row.averageRent,
      averageMonthlyCost: row.averageMonthlyCost,
    });
    readModel.detailsBySlug.set(row.slug, detail);
    readModel.accommodationBySlug.set(row.slug, accommodation);
    readModel.courseEquivalencesBySlug.set(row.slug, courseEquivalences);
  }

  return readModel;
}

async function loadPersistedPublicDestinationReadModelRows(): Promise<
  PersistedPublicDestinationReadModelRow[]
> {
  return (await prisma.publicDestinationReadModel.findMany({
    select: {
      slug: true,
      city: true,
      country: true,
      hostUniversityCount: true,
      submissionCount: true,
      latestReportSubmittedAt: true,
      averageRent: true,
      averageMonthlyCost: true,
      detail: true,
      accommodation: true,
      courseEquivalences: true,
    },
    orderBy: [{ submissionCount: "desc" }, { city: "asc" }],
  })) as PersistedPublicDestinationReadModelRow[];
}

async function persistPublicDestinationReadModel(
  readModel: PublicDestinationReadModel,
): Promise<void> {
  const rows = readModel.destinations.map((destination) => ({
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    hostUniversityCount: destination.hostUniversityCount,
    submissionCount: destination.submissionCount,
    latestReportSubmittedAt: destination.latestReportSubmittedAt
      ? new Date(destination.latestReportSubmittedAt)
      : null,
    averageRent: destination.averageRent,
    averageMonthlyCost: destination.averageMonthlyCost,
    detail: readModel.detailsBySlug.get(destination.slug)!,
    accommodation: readModel.accommodationBySlug.get(destination.slug)!,
    courseEquivalences:
      readModel.courseEquivalencesBySlug.get(destination.slug)!,
  }));

  await prisma.$transaction(async (tx) => {
    if (rows.length === 0) {
      await tx.publicDestinationReadModel.deleteMany();
      return;
    }

    await tx.publicDestinationReadModel.deleteMany({
      where: {
        slug: {
          notIn: rows.map((row) => row.slug),
        },
      },
    });

    for (const row of rows) {
      await tx.publicDestinationReadModel.upsert({
        where: { slug: row.slug },
        create: row,
        update: {
          city: row.city,
          country: row.country,
          hostUniversityCount: row.hostUniversityCount,
          submissionCount: row.submissionCount,
          latestReportSubmittedAt: row.latestReportSubmittedAt,
          averageRent: row.averageRent,
          averageMonthlyCost: row.averageMonthlyCost,
          detail: row.detail,
          accommodation: row.accommodation,
          courseEquivalences: row.courseEquivalences,
        },
      });
    }
  });
}

export async function refreshPublicDestinationReadModel(): Promise<void> {
  if (publicDestinationRefreshPromise) {
    return publicDestinationRefreshPromise;
  }

  publicDestinationRefreshPromise = loadApprovedExperiences()
    .then(async (experiences) => {
      const readModel = buildPublicDestinationReadModel(experiences);
      await persistPublicDestinationReadModel(readModel);
      publicDestinationReadModelCache = {
        expiresAt: Date.now() + PUBLIC_DESTINATION_READ_MODEL_TTL_MS,
        value: readModel,
      };
      publicDestinationReadModelPromise = null;
    })
    .finally(() => {
      publicDestinationRefreshPromise = null;
    });

  return publicDestinationRefreshPromise;
}

function shouldLazyBootstrapPublicDestinationReadModel(): boolean {
  return process.env.NODE_ENV !== "production";
}

async function loadPublicDestinationReadModel(): Promise<PublicDestinationReadModel> {
  const now = Date.now();

  if (
    publicDestinationReadModelCache &&
    publicDestinationReadModelCache.expiresAt > now
  ) {
    return publicDestinationReadModelCache.value;
  }

  if (publicDestinationReadModelPromise) {
    return publicDestinationReadModelPromise;
  }

  const staleReadModel = publicDestinationReadModelCache?.value ?? null;

  const value = loadPersistedPublicDestinationReadModelRows()
    .then(async (rows) => {
      if (rows.length === 0) {
        if (shouldLazyBootstrapPublicDestinationReadModel()) {
          await refreshPublicDestinationReadModel();
          return (
            publicDestinationReadModelCache?.value ??
            createEmptyPublicDestinationReadModel()
          );
        }

        console.warn(
          "Persisted public destination read model is empty. This is expected when no approved public experiences exist. If approved experiences should already be public in this environment, run `npm run db:refresh-public-destination-read-model` during setup or deploy.",
        );

        const emptyReadModel = createEmptyPublicDestinationReadModel();
        publicDestinationReadModelCache = {
          expiresAt: Date.now() + PUBLIC_DESTINATION_READ_MODEL_TTL_MS,
          value: emptyReadModel,
        };
        return emptyReadModel;
      }

      const readModel = buildPersistedPublicDestinationReadModel(rows);
      publicDestinationReadModelCache = {
        expiresAt: Date.now() + PUBLIC_DESTINATION_READ_MODEL_TTL_MS,
        value: readModel,
      };
      return readModel;
    })
    .catch((error) => {
      if (staleReadModel) {
        console.error(
          "Failed to refresh public destination read model, serving stale snapshot:",
          error,
        );
        return staleReadModel;
      }

      throw error;
    })
    .finally(() => {
      if (publicDestinationReadModelPromise === value) {
        publicDestinationReadModelPromise = null;
      }
    });

  publicDestinationReadModelPromise = value;

  return value;
}

export function invalidatePublicDestinationReadModel(): void {
  publicDestinationReadModelCache = null;
  publicDestinationReadModelPromise = null;
}

export async function getPublicDestinationList(): Promise<
  PublicDestinationListItem[]
> {
  const readModel = await loadPublicDestinationReadModel();
  return readModel.destinations;
}

export async function getPublicDestinationDetailBySlug(
  slug: string,
): Promise<PublicDestinationDetail | null> {
  const readModel = await loadPublicDestinationReadModel();
  return readModel.detailsBySlug.get(slug) ?? null;
}

export async function getPublicDestinationReadModelBySlug(
  slug: string,
): Promise<PublicDestinationReadModelDetail | null> {
  const readModel = await loadPublicDestinationReadModel();
  const listItem =
    readModel.destinations.find((destination) => destination.slug === slug) ??
    null;
  const detail = readModel.detailsBySlug.get(slug) ?? null;
  const accommodation = readModel.accommodationBySlug.get(slug) ?? null;
  const courseEquivalences =
    readModel.courseEquivalencesBySlug.get(slug) ?? null;

  if (!listItem || !detail || !accommodation || !courseEquivalences) {
    return null;
  }

  return {
    slug: listItem.slug,
    city: listItem.city,
    country: listItem.country,
    hostUniversityCount: listItem.hostUniversityCount,
    submissionCount: listItem.submissionCount,
    latestReportSubmittedAt: listItem.latestReportSubmittedAt,
    averageRent: listItem.averageRent,
    averageMonthlyCost: listItem.averageMonthlyCost,
    detail,
    accommodation,
    courseEquivalences,
  };
}

export async function getPublicAccommodationInsightsByDestinationSlug(
  slug: string,
): Promise<PublicDestinationAccommodationInsights | null> {
  const readModel = await loadPublicDestinationReadModel();
  return readModel.accommodationBySlug.get(slug) ?? null;
}

export async function getPublicCourseEquivalencesByDestinationSlug(
  slug: string,
): Promise<PublicDestinationCourseEquivalences | null> {
  const readModel = await loadPublicDestinationReadModel();
  return readModel.courseEquivalencesBySlug.get(slug) ?? null;
}

export async function getAdminPublicImpactPreviewByExperienceId(
  experienceId: string,
): Promise<AdminPublicImpactPreview | null> {
  const [approvedExperiences, previewExperience] = await Promise.all([
    loadApprovedExperiences(),
    loadExperienceById(experienceId),
  ]);

  if (!previewExperience) {
    return null;
  }

  if (buildPreviewUnavailableReason(previewExperience)) {
    return null;
  }

  const destination = getDestinationIdentity(
    previewExperience.hostCity,
    previewExperience.hostCountry,
  );

  if (!destination) {
    return null;
  }

  const previewAlreadyApproved = approvedExperiences.some(
    (experience) => experience.id === previewExperience.id,
  );
  const currentDestination = buildCityPublicView(approvedExperiences, destination);
  const projectedExperiences = previewAlreadyApproved
    ? approvedExperiences
    : [...approvedExperiences, previewExperience];
  const projectedDestination = buildCityPublicView(
    projectedExperiences,
    destination,
  );

  if (!projectedDestination) {
    return null;
  }

  const courseContributionExamples =
    buildPendingCourseContributionExamples(previewExperience);

  return {
    slug: destination.slug,
    city: projectedDestination.detail.city,
    country: projectedDestination.detail.country,
    destination: {
      isNewDestination: !currentDestination,
      before: currentDestination?.detail ?? null,
      after: projectedDestination.detail,
    },
    accommodation: {
      before: currentDestination?.accommodation ?? null,
      after: projectedDestination.accommodation,
      contribution: buildPendingAccommodationContribution(previewExperience),
    },
    courses: {
      before: currentDestination?.courseEquivalences ?? null,
      after: projectedDestination.courseEquivalences,
      contributionCount: courseContributionExamples.length,
      contributionExamples: courseContributionExamples,
    },
  };
}

export async function getAdminPublicImpactPreviewUnavailableReasonByExperienceId(
  experienceId: string,
) {
  const experience = await loadExperienceById(experienceId);

  if (!experience) {
    return null;
  }

  return buildPreviewUnavailableReason(experience);
}
