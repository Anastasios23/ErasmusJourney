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
import { getMissingMinimumPublicContractFields } from "./adminPublicImpactPreview";

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
  hostUniversity: "Host university",
  hostCity: "Host city",
  hostCountry: "Host country",
};

const PUBLIC_CONTRACT_FIELD_LABELS: Record<string, string> = {
  ...CORE_DESTINATION_FIELD_LABELS,
  accommodationType: "Accommodation type",
  monthlyRent: "Monthly rent",
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

function hasOwnField(source: object, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(source, field);
}

function getNormalizedBasicInfo(submission: AdminReviewSubmissionLike) {
  const submissionRecord = submission as Record<string, unknown>;
  const explicitHostCity = hasOwnField(submissionRecord, "hostCity")
    ? submission.hostCity
    : undefined;
  const explicitHostCountry = hasOwnField(submissionRecord, "hostCountry")
    ? submission.hostCountry
    : undefined;

  return sanitizeBasicInformationData({
    ...(submission.basicInfo as Record<string, unknown> | null | undefined),
    hostCity:
      explicitHostCity !== undefined
        ? explicitHostCity
        : (submission.basicInfo as Record<string, unknown> | null | undefined)
            ?.hostCity,
    hostCountry:
      explicitHostCountry !== undefined
        ? explicitHostCountry
        : (submission.basicInfo as Record<string, unknown> | null | undefined)
            ?.hostCountry,
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
      label: `Changes requested (${revisionCount})`,
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
  const minimumPublicContractMissingFields =
    submission.publicImpactPreviewUnavailableReason?.missingFields ||
    getMissingMinimumPublicContractFields(submission);
  const missingFields = Array.from(
    new Set(
      minimumPublicContractMissingFields.map(
        (field) => PUBLIC_CONTRACT_FIELD_LABELS[field] || field,
      ),
    ),
  );

  if (missingFields.length > 0) {
    return {
      status: "blocked",
      label: "Blocked",
      variant: "error",
      description:
        "Complete the MVP minimum public contract before approving this submission.",
      missingFields,
    };
  }

  return {
    status: "ready",
    label: "Ready",
    variant: "success",
    description:
      "MVP minimum public contract is complete. Remaining gaps are enrichment only.",
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
    livingExpenses.other === null ? "Other" : null,
  ].filter((value): value is string => Boolean(value));

  const courseMissingFields =
    [
      completeCourseMappings.length > 0
        ? null
        : "At least 1 complete course mapping",
      basicInfo.homeDepartment ? null : "Home department",
    ].filter((value): value is string => Boolean(value));

  const accommodationBlockerMissingFields = accommodationMissingFields.filter(
    (field) => field === "Accommodation type" || field === "Monthly rent",
  );
  const courseBlockerMissingFields = courseMissingFields.filter(
    (field) => field === "At least 1 complete course mapping",
  );
  const hasBudgetSignal = [
    livingExpenses.food,
    livingExpenses.transport,
    livingExpenses.social,
    livingExpenses.travel,
    livingExpenses.other,
  ].some((value) => typeof value === "number");

  const publishableSections: string[] = [];
  const coreMissingFields = getCoreDestinationMissingFields(submission);

  if (coreMissingFields.length === 0) {
    publishableSections.push("Destination");
  }
  if (
    coreMissingFields.length === 0 &&
    accommodationBlockerMissingFields.length === 0
  ) {
    publishableSections.push("Accommodation");
  }
  if (coreMissingFields.length === 0 && courseBlockerMissingFields.length === 0) {
    publishableSections.push("Courses");
  }
  if (coreMissingFields.length === 0 && hasBudgetSignal) {
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
    typeof accommodation.monthlyRent === "number"
      ? `Minimum signal: rent ${accommodation.monthlyRent} ${accommodation.currency} / month`
      : "Minimum signal missing: monthly rent",
    `Food ${formatMoney(livingExpenses.food, livingExpenses.currency)}`,
    `Transport ${formatMoney(livingExpenses.transport, livingExpenses.currency)}`,
    `Social ${formatMoney(livingExpenses.social, livingExpenses.currency)}`,
    `Other ${formatMoney(livingExpenses.other, livingExpenses.currency)}`,
    totalBudget > 0
      ? `Expanded monthly total ${totalBudget.toFixed(0)} ${livingExpenses.currency}`
      : null,
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
      budgetSummaryParts.join(" | ") ||
      "Living-cost summary incomplete beyond rent",
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
