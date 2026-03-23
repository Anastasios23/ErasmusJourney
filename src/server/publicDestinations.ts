import { prisma } from "../../lib/prisma";
import {
  getAccommodationTypeLabel,
  getDifficultyFindingAccommodationLabel,
  sanitizeAccommodationStepData,
} from "../lib/accommodation";
import { sanitizeBasicInformationData } from "../lib/basicInformation";
import { sanitizeCourseMappingsData } from "../lib/courseMatching";
import { sanitizeLivingExpensesStepData } from "../lib/livingExpenses";
import type {
  PublicDestinationCourseExample,
  PublicDestinationDetail,
  PublicDestinationListItem,
} from "../types/publicDestinations";

type RawExperience = {
  id: string;
  hostCity: string | null;
  hostCountry: string | null;
  hostUniversityId: string | null;
  basicInfo: unknown;
  accommodation: unknown;
  livingExpenses: unknown;
  courses: unknown;
  experience: unknown;
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
  accommodationType: Map<string, { count: number; rents: number[] }>;
  accommodationDifficulty: Map<string, number>;
  courseExamples: PublicDestinationCourseExample[];
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

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function pushIfNumber(target: number[], value: number | null | undefined): void {
  if (typeof value === "number" && Number.isFinite(value)) {
    target.push(value);
  }
}

function normalizeTipText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return null;
  }

  return normalized.length > 300 ? `${normalized.slice(0, 297)}...` : normalized;
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
  ].filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (items.length === 0) {
    return null;
  }

  return Number(items.reduce((sum, value) => sum + value, 0).toFixed(2));
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
      basicInfo: true,
      accommodation: true,
      livingExpenses: true,
      courses: true,
      experience: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

function buildGroupedDestinations(experiences: RawExperience[]): Map<string, GroupedDestinationData> {
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
        accommodationType: new Map<string, { count: number; rents: number[] }>(),
        accommodationDifficulty: new Map<string, number>(),
        courseExamples: [],
        practicalTips: [],
      });
    }

    const destination = grouped.get(key)!;
    destination.submissionCount += 1;

    const basicInfo = sanitizeBasicInformationData(toRecord(experience.basicInfo));
    const accommodation = sanitizeAccommodationStepData(toRecord(experience.accommodation));
    const livingExpenses = sanitizeLivingExpensesStepData(
      toRecord(experience.livingExpenses),
      {
        fallbackRent:
          typeof accommodation.monthlyRent === "number"
            ? accommodation.monthlyRent
            : null,
      },
    );

    if (basicInfo.hostUniversity) {
      destination.universities.add(basicInfo.hostUniversity);
    } else if (experience.hostUniversityId) {
      destination.universities.add(experience.hostUniversityId);
    }

    pushIfNumber(destination.rents, livingExpenses.rent);
    pushIfNumber(destination.livingFood, livingExpenses.food);
    pushIfNumber(destination.livingTransport, livingExpenses.transport);
    pushIfNumber(destination.livingSocial, livingExpenses.social);
    pushIfNumber(destination.livingTravel, livingExpenses.travel);
    pushIfNumber(destination.livingOther, livingExpenses.other);

    const monthlyTotal = buildMonthlyTotal(livingExpenses);
    pushIfNumber(destination.monthlyCosts, monthlyTotal);

    if (accommodation.accommodationType) {
      const label = getAccommodationTypeLabel(accommodation.accommodationType);
      const current = destination.accommodationType.get(label) || {
        count: 0,
        rents: [],
      };

      current.count += 1;
      pushIfNumber(current.rents, livingExpenses.rent ?? accommodation.monthlyRent);
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

    const courseMappings = sanitizeCourseMappingsData(experience.courses);
    for (const mapping of courseMappings) {
      if (!mapping.homeCourseName || !mapping.hostCourseName) {
        continue;
      }

      destination.courseExamples.push({
        homeCourseName: mapping.homeCourseName,
        hostCourseName: mapping.hostCourseName,
        recognitionType: recognitionLabel(mapping.recognitionType),
        notes: mapping.notes,
      });
    }

    const experienceData = toRecord(experience.experience);
    const tips = [
      normalizeTipText(experienceData?.generalTips),
      normalizeTipText(experienceData?.academicAdvice),
      normalizeTipText(experienceData?.socialAdvice),
      normalizeTipText(experienceData?.bestExperience),
      normalizeTipText(accommodation.accommodationReview),
    ].filter((tip): tip is string => Boolean(tip));

    destination.practicalTips.push(...tips);
  }

  return grouped;
}

function toListItem(destination: GroupedDestinationData): PublicDestinationListItem {
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

export async function getPublicDestinationList(): Promise<PublicDestinationListItem[]> {
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

  const destination = Array.from(grouped.values()).find(
    (item) => item.slug === slug,
  );

  if (!destination) {
    return null;
  }

  const uniqueCourseExamples = Array.from(
    new Map(
      destination.courseExamples.map((example) => [
        `${example.homeCourseName}|${example.hostCourseName}|${example.recognitionType}`,
        example,
      ]),
    ).values(),
  ).slice(0, 8);

  const uniqueTips = Array.from(new Set(destination.practicalTips)).slice(0, 8);

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
      currency: "EUR",
      sampleSize: destination.monthlyCosts.length,
      averageRent: average(destination.rents),
      averageFood: average(destination.livingFood),
      averageTransport: average(destination.livingTransport),
      averageSocial: average(destination.livingSocial),
      averageTravel: average(destination.livingTravel),
      averageOther: average(destination.livingOther),
      averageMonthlyCost: average(destination.monthlyCosts),
    },
    courseEquivalenceExamples: uniqueCourseExamples,
    practicalTips: uniqueTips,
  };
}
