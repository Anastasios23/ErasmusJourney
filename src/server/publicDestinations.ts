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
import { getExperiencePublicWordingEdits } from "../lib/experienceModeration";
import type { AdminPublicImpactPreview } from "../types/adminPublicImpactPreview";
import type {
  PublicDestinationAccommodationInsights,
  PublicDestinationCourseEquivalenceGroup,
  PublicDestinationCourseExample,
  PublicDestinationCourseEquivalences,
  PublicDestinationDetail,
  PublicDestinationListItem,
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

let publicDestinationReadModelCache:
  | PublicDestinationReadModelCacheEntry
  | null = null;
let publicDestinationReadModelPromise: Promise<PublicDestinationReadModel> | null =
  null;
let publicDestinationRefreshPromise: Promise<void> | null = null;

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

async function loadApprovedExperiences(): Promise<RawExperience[]> {
  return prisma.erasmusExperience.findMany({
    where: {
      status: "APPROVED",
      isComplete: true,
      hostCity: { not: null },
      hostCountry: { not: null },
    },
    select: {
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
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function loadExperienceById(id: string): Promise<RawExperience | null> {
  return prisma.erasmusExperience.findUnique({
    where: { id },
    select: {
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
    },
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

function toListItem(
  destination: GroupedDestinationData,
): PublicDestinationListItem {
  return {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    hostUniversityCount: destination.universities.size,
    submissionCount: destination.submissionCount,
    latestReportSubmittedAt: toIsoDate(destination.latestReportSubmittedAt),
    averageRent: average(destination.rents),
    averageMonthlyCost: average(destination.monthlyCosts),
  };
}

function buildDestinationDetail(
  destination: GroupedDestinationData,
): PublicDestinationDetail {
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
    averageRent: average(destination.rents),
    averageMonthlyCost: average(destination.monthlyCosts),
    accommodationSummary: {
      sampleSize: destination.rents.length,
      averageRent: average(destination.rents),
      types: Array.from(destination.accommodationType.entries())
        .map(([type, value]) => ({
          type,
          count: value.count,
          averageRent: average(value.rents),
        }))
        .sort((left, right) => right.count - left.count),
      difficulty: Array.from(destination.accommodationDifficulty.entries())
        .map(([level, count]) => ({ level, count }))
        .sort((left, right) => right.count - left.count),
    },
    costSummary: {
      currency: deriveCurrency(destination.currencies),
      sampleSize: destination.monthlyCosts.length,
      averageRent: average(destination.rents),
      averageFood: average(destination.livingFood),
      averageTransport: average(destination.livingTransport),
      averageSocial: average(destination.livingSocial),
      averageTravel: average(destination.livingTravel),
      averageOther: average(destination.livingOther),
      averageMonthlyCost: average(destination.monthlyCosts),
    },
    courseEquivalenceExamples: buildUniqueCourseExamples(
      destination.courseEquivalences,
    ),
    practicalTips: uniqueTips,
  };
}

function buildAccommodationInsights(
  destination: GroupedDestinationData,
): PublicDestinationAccommodationInsights {
  return {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    hostUniversityCount: destination.universities.size,
    submissionCount: destination.submissionCount,
    latestReportSubmittedAt: toIsoDate(destination.latestReportSubmittedAt),
    currency: deriveCurrency(destination.currencies),
    sampleSize: destination.accommodationSubmissionCount,
    rentSampleSize: destination.rents.length,
    averageRent: average(destination.rents),
    recommendationRate: percentage(
      destination.accommodationRecommendationYesCount,
      destination.accommodationRecommendationTotal,
    ),
    recommendationSampleSize: destination.accommodationRecommendationTotal,
    recommendationYesCount: destination.accommodationRecommendationYesCount,
    types: Array.from(destination.accommodationType.entries())
      .map(([type, value]) => ({
        type,
        count: value.count,
        averageRent: average(value.rents),
      }))
      .sort((left, right) => right.count - left.count),
    difficulty: Array.from(destination.accommodationDifficulty.entries())
      .map(([level, count]) => ({ level, count }))
      .sort((left, right) => right.count - left.count),
    commonAreas: Array.from(destination.accommodationAreas.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }

        return left.name.localeCompare(right.name);
      })
      .slice(0, 8),
    reviewSnippets: dedupeCaseInsensitive(
      destination.accommodationReviewSnippets,
    ).slice(0, 6),
  };
}

function buildCourseEquivalences(
  destination: GroupedDestinationData,
): PublicDestinationCourseEquivalences {
  const groups = buildCourseEquivalenceGroups(destination.courseEquivalences);
  const homeUniversities = new Set(
    groups.map((group) => group.homeUniversity.toLowerCase()),
  );

  return {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    hostUniversityCount: destination.universities.size,
    submissionCount: destination.submissionCount,
    latestReportSubmittedAt: toIsoDate(destination.latestReportSubmittedAt),
    homeUniversityCount: homeUniversities.size,
    totalMappings: destination.courseEquivalences.length,
    groups,
  };
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
    detailsBySlug.set(destination.slug, buildDestinationDetail(destination));
    accommodationBySlug.set(
      destination.slug,
      buildAccommodationInsights(destination),
    );
    courseEquivalencesBySlug.set(
      destination.slug,
      buildCourseEquivalences(destination),
    );

    return toListItem(destination);
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

  const city = previewExperience.hostCity!.trim();
  const country = previewExperience.hostCountry!.trim();

  const slug = destinationSlug(city, country);
  const currentGrouped = buildGroupedDestinations(approvedExperiences);
  const currentDestination = findDestinationBySlug(currentGrouped, slug);
  const previewAlreadyApproved = approvedExperiences.some(
    (experience) => experience.id === previewExperience.id,
  );
  const projectedGrouped = buildGroupedDestinations(
    previewAlreadyApproved
      ? approvedExperiences
      : [...approvedExperiences, previewExperience],
  );
  const projectedDestination = findDestinationBySlug(projectedGrouped, slug);

  if (!projectedDestination) {
    return null;
  }

  const courseContributionExamples =
    buildPendingCourseContributionExamples(previewExperience);

  return {
    slug,
    city: projectedDestination.city,
    country: projectedDestination.country,
    destination: {
      isNewDestination: !currentDestination,
      before: currentDestination ? buildDestinationDetail(currentDestination) : null,
      after: buildDestinationDetail(projectedDestination),
    },
    accommodation: {
      before: currentDestination
        ? buildAccommodationInsights(currentDestination)
        : null,
      after: buildAccommodationInsights(projectedDestination),
      contribution: buildPendingAccommodationContribution(previewExperience),
    },
    courses: {
      before: currentDestination
        ? buildCourseEquivalences(currentDestination)
        : null,
      after: buildCourseEquivalences(projectedDestination),
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
