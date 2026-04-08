import {
  getAccommodationTypeLabel,
  sanitizeAccommodationStepData,
} from "./accommodation";
import { sanitizeBasicInformationData } from "./basicInformation";
import {
  isCourseMappingComplete,
  sanitizeCourseMappingsData,
} from "./courseMatching";
import {
  calculateLivingExpensesTotal,
  sanitizeLivingExpensesStepData,
} from "./livingExpenses";
import type { AdminPublicImpactPreviewUnavailable } from "../types/adminPublicImpactPreview";

type BadgeVariant = "secondary" | "success" | "warning" | "error" | "info";

export interface AdminReviewSubmissionLike {
  basicInfo?: unknown;
  courses?: unknown;
  accommodation?: unknown;
  livingExpenses?: unknown;
  experience?: Record<string, unknown> | null;
  hostCity?: string | null;
  hostCountry?: string | null;
  revisionCount?: number;
  submittedAt?: string | null;
  publicImpactPreviewUnavailableReason?: AdminPublicImpactPreviewUnavailable | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface ModerationBadgeMeta {
  label: string;
  variant: BadgeVariant;
}

export interface ApprovalReadiness {
  status: "ready" | "blocked";
  label: string;
  variant: BadgeVariant;
  description: string;
  missingFields: string[];
}

export interface SubmissionModerationSummary {
  destinationIdentity: string;
  courseSummary: string;
  accommodationSummary: string;
  budgetSummary: string;
  tipsSummary: string;
  coreDestinationMissingFields: string[];
  accommodationMissingFields: string[];
  courseMissingFields: string[];
  budgetMissingFields: string[];
  publishableSections: string[];
}

const CORE_DESTINATION_FIELD_LABELS: Record<string, string> = {
  homeUniversity: "Home university",
  homeDepartment: "Home department",
  hostUniversity: "Host university",
  hostCity: "Host city",
  hostCountry: "Host country",
};

const PUBLIC_CONTRACT_FIELD_LABELS: Record<string, string> = {
  ...CORE_DESTINATION_FIELD_LABELS,
  accommodationType: "Accommodation type",
  monthlyRent: "Monthly rent",
  wouldRecommend: "Would recommend",
  accommodationRating: "Accommodation rating",
  food: "Food",
  transport: "Transport",
  social: "Social",
  courseMappings: "At least 1 complete course mapping",
};

function truncateText(value: string, maxLength = 140): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
}

function formatMoney(value: number | null | undefined, currency: string): string {
  return typeof value === "number" ? `${value} ${currency}` : "N/A";
}

function getNormalizedBasicInfo(submission: AdminReviewSubmissionLike) {
  return sanitizeBasicInformationData({
    ...(submission.basicInfo as Record<string, unknown> | null | undefined),
    hostCity:
      (submission.basicInfo as Record<string, unknown> | null | undefined)
        ?.hostCity || submission.hostCity,
    hostCountry:
      (submission.basicInfo as Record<string, unknown> | null | undefined)
        ?.hostCountry || submission.hostCountry,
  });
}

export function getCoreDestinationMissingFields(
  submission: AdminReviewSubmissionLike,
): string[] {
  const basicInfo = getNormalizedBasicInfo(submission);

  return Object.entries(CORE_DESTINATION_FIELD_LABELS)
    .filter(([field]) => !basicInfo[field as keyof typeof basicInfo])
    .map(([, label]) => label);
}

export function getRevisionStatusMeta(
  revisionCount = 0,
): ModerationBadgeMeta {
  if (revisionCount > 0) {
    return {
      label: `Needs revision (${revisionCount})`,
      variant: "warning",
    };
  }

  return {
    label: "New submission",
    variant: "secondary",
  };
}

export function getApprovalReadiness(
  submission: AdminReviewSubmissionLike,
): ApprovalReadiness {
  const coreMissingFields = getCoreDestinationMissingFields(submission);
  const previewMissingFields =
    submission.publicImpactPreviewUnavailableReason?.missingFields?.map(
      (field) => PUBLIC_CONTRACT_FIELD_LABELS[field] || field,
    ) || [];
  const missingFields = Array.from(
    new Set([...coreMissingFields, ...previewMissingFields]),
  );

  if (missingFields.length > 0) {
    return {
      status: "blocked",
      label: "Blocked",
      variant: "error",
      description:
        "Complete the minimum public contract before approving this submission.",
      missingFields,
    };
  }

  return {
    status: "ready",
    label: "Ready",
    variant: "success",
    description: "Minimum public contract is complete and can publish safely.",
    missingFields: [],
  };
}

export function getSubmissionModerationSummary(
  submission: AdminReviewSubmissionLike,
): SubmissionModerationSummary {
  const basicInfo = getNormalizedBasicInfo(submission);
  const courseMappings = sanitizeCourseMappingsData(submission.courses);
  const completeCourseMappings = courseMappings.filter(isCourseMappingComplete);
  const accommodation = sanitizeAccommodationStepData(
    submission.accommodation as Partial<Record<string, unknown>> | null | undefined,
  );
  const livingExpenses = sanitizeLivingExpensesStepData(
    submission.livingExpenses as Partial<Record<string, unknown>> | null | undefined,
    {
      fallbackRent:
        typeof accommodation.monthlyRent === "number"
          ? accommodation.monthlyRent
          : null,
    },
  );
  const experience = (submission.experience || {}) as Record<string, unknown>;
  const totalBudget = calculateLivingExpensesTotal(livingExpenses);

  const destinationIdentity = [
    basicInfo.hostUniversity,
    basicInfo.hostCity,
    basicInfo.hostCountry,
    basicInfo.homeUniversity ? `Home: ${basicInfo.homeUniversity}` : null,
    basicInfo.homeDepartment ? basicInfo.homeDepartment : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const accommodationMissingFields = [
    accommodation.accommodationType ? null : "Accommodation type",
    typeof accommodation.monthlyRent === "number" ? null : "Monthly rent",
    typeof accommodation.wouldRecommend === "boolean"
      ? null
      : "Would recommend",
    typeof accommodation.accommodationRating === "number"
      ? null
      : "Accommodation rating",
  ].filter((value): value is string => Boolean(value));

  const budgetMissingFields = [
    livingExpenses.food === null ? "Food" : null,
    livingExpenses.transport === null ? "Transport" : null,
    livingExpenses.social === null ? "Social" : null,
  ].filter((value): value is string => Boolean(value));

  const courseMissingFields =
    completeCourseMappings.length > 0 ? [] : ["At least 1 complete course mapping"];

  const publishableSections: string[] = [];
  const coreMissingFields = getCoreDestinationMissingFields(submission);

  if (coreMissingFields.length === 0) {
    publishableSections.push("Destination");
  }
  if (coreMissingFields.length === 0 && accommodationMissingFields.length === 0) {
    publishableSections.push("Accommodation");
  }
  if (coreMissingFields.length === 0 && courseMissingFields.length === 0) {
    publishableSections.push("Courses");
  }
  if (coreMissingFields.length === 0 && budgetMissingFields.length === 0) {
    publishableSections.push("Budget");
  }

  const accommodationSummaryParts = [
    accommodation.accommodationType
      ? getAccommodationTypeLabel(accommodation.accommodationType)
      : null,
    typeof accommodation.monthlyRent === "number"
      ? `${accommodation.monthlyRent} ${accommodation.currency} / month`
      : null,
    typeof accommodation.wouldRecommend === "boolean"
      ? accommodation.wouldRecommend
        ? "Recommends it"
        : "Does not recommend it"
      : null,
    typeof accommodation.accommodationRating === "number"
      ? `${accommodation.accommodationRating}/5 rating`
      : null,
  ].filter(Boolean);

  const courseSummary =
    courseMappings.length === 0
      ? "No course mappings added"
      : `${completeCourseMappings.length}/${courseMappings.length} complete mapping${
          courseMappings.length === 1 ? "" : "s"
        }`;

  const budgetSummaryParts = [
    `Food ${formatMoney(livingExpenses.food, livingExpenses.currency)}`,
    `Transport ${formatMoney(livingExpenses.transport, livingExpenses.currency)}`,
    `Social ${formatMoney(livingExpenses.social, livingExpenses.currency)}`,
    totalBudget > 0 ? `Total ${totalBudget.toFixed(0)} ${livingExpenses.currency}` : null,
  ].filter(Boolean);

  const tipsSummary =
    truncateText(
      String(
        experience.generalTips ||
          experience.bestExperience ||
          experience.academicAdvice ||
          experience.socialAdvice ||
          "",
      ),
    ) || "No useful advice summary yet";

  return {
    destinationIdentity: destinationIdentity || "Destination identity incomplete",
    courseSummary,
    accommodationSummary:
      accommodationSummaryParts.join(" | ") || "Accommodation summary incomplete",
    budgetSummary:
      budgetSummaryParts.join(" | ") || "Budget summary incomplete",
    tipsSummary,
    coreDestinationMissingFields: coreMissingFields,
    accommodationMissingFields,
    courseMissingFields,
    budgetMissingFields,
    publishableSections,
  };
}

export function getSubmissionQueueCategory(
  submission: AdminReviewSubmissionLike,
): "ready" | "blocked" | "needs_revision" {
  if ((submission.revisionCount || 0) > 0) {
    return "needs_revision";
  }

  return getApprovalReadiness(submission).status === "blocked"
    ? "blocked"
    : "ready";
}

export function formatSubmissionTimestamp(value: string | null | undefined): string {
  if (!value) {
    return "N/A";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return parsed.toLocaleDateString();
}
