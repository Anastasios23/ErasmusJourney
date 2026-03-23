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

    const basicInfo = sanitizeBasicInformationData(
      toRecord(experience.basicInfo),
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
      accommodation.accommodationReview,
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
        notes: sanitizePublicDestinationNarrative(mapping.notes, {
          maxLength: 220,
        }) || undefined,
      });
    }

    const experienceData = toRecord(experience.experience);
    const tips = [
      sanitizePublicDestinationNarrative(experienceData?.generalTips, {
        maxLength: 220,
      }),
      sanitizePublicDestinationNarrative(experienceData?.academicAdvice, {
        maxLength: 220,
      }),
      sanitizePublicDestinationNarrative(experienceData?.socialAdvice, {
        maxLength: 220,
      }),
      sanitizePublicDestinationNarrative(experienceData?.bestExperience, {
        maxLength: 220,
      }),
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
    averageRent: average(destination.rents),
    averageMonthlyCost: average(destination.monthlyCosts),
  };
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
          notes: entry.notes,
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
              hostUniversity: entry.hostUniversity,
              recognitionType: entry.recognitionType,
              notes: entry.notes,
            },
          ]),
        ).values(),
      ).slice(0, 12);

      return {
        homeUniversity: group.homeUniversity,
        homeDepartment: group.homeDepartment,
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

export async function getPublicDestinationList(): Promise<
  PublicDestinationListItem[]
> {
  const experiences = await loadApprovedExperiences();
  const grouped = buildGroupedDestinations(experiences);

  return Array.from(grouped.values())
    .map(toListItem)
    .sort((left, right) => {
      if (right.submissionCount !== left.submissionCount) {
        return right.submissionCount - left.submissionCount;
      }

      return left.city.localeCompare(right.city);
    });
}

export async function getPublicDestinationDetailBySlug(
  slug: string,
): Promise<PublicDestinationDetail | null> {
  const experiences = await loadApprovedExperiences();
  const grouped = buildGroupedDestinations(experiences);
  const destination = findDestinationBySlug(grouped, slug);

  if (!destination) {
    return null;
  }

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

export async function getPublicAccommodationInsightsByDestinationSlug(
  slug: string,
): Promise<PublicDestinationAccommodationInsights | null> {
  const experiences = await loadApprovedExperiences();
  const grouped = buildGroupedDestinations(experiences);
  const destination = findDestinationBySlug(grouped, slug);

  if (!destination) {
    return null;
  }

  return {
    slug: destination.slug,
    city: destination.city,
    country: destination.country,
    hostUniversityCount: destination.universities.size,
    submissionCount: destination.submissionCount,
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

export async function getPublicCourseEquivalencesByDestinationSlug(
  slug: string,
): Promise<PublicDestinationCourseEquivalences | null> {
  const experiences = await loadApprovedExperiences();
  const grouped = buildGroupedDestinations(experiences);
  const destination = findDestinationBySlug(grouped, slug);

  if (!destination) {
    return null;
  }

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
    homeUniversityCount: homeUniversities.size,
    totalMappings: destination.courseEquivalences.length,
    groups,
  };
}
