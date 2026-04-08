import type {
  AdminPublicImpactMissingField,
  AdminPublicImpactPreviewUnavailable,
} from "../types/adminPublicImpactPreview";
import { sanitizeAccommodationStepData } from "./accommodation";
import { sanitizeBasicInformationData } from "./basicInformation";
import {
  isCourseMappingComplete,
  sanitizeCourseMappingsData,
} from "./courseMatching";
import { sanitizeLivingExpensesStepData } from "./livingExpenses";

interface DestinationIdentitySource {
  basicInfo?: unknown;
  courses?: unknown;
  accommodation?: unknown;
  livingExpenses?: unknown;
  hostCity?: string | null;
  hostCountry?: string | null;
}

function isBlank(value: string | null | undefined): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function hasOwnField(source: object, field: string): boolean {
  return Object.prototype.hasOwnProperty.call(source, field);
}

export function getMissingMinimumPublicContractFields(
  source: DestinationIdentitySource,
): AdminPublicImpactMissingField[] {
  const missingFields: AdminPublicImpactMissingField[] = [];
  const sourceRecord = source as Record<string, unknown>;
  const explicitHostCity = hasOwnField(sourceRecord, "hostCity")
    ? source.hostCity
    : undefined;
  const explicitHostCountry = hasOwnField(sourceRecord, "hostCountry")
    ? source.hostCountry
    : undefined;
  const basicInfo = sanitizeBasicInformationData({
    ...(typeof source.basicInfo === "object" && source.basicInfo
      ? (source.basicInfo as Record<string, unknown>)
      : {}),
    hostCity:
      explicitHostCity !== undefined
        ? explicitHostCity
        : typeof source.basicInfo === "object" && source.basicInfo
          ? (source.basicInfo as Record<string, unknown>).hostCity
          : undefined,
    hostCountry:
      explicitHostCountry !== undefined
        ? explicitHostCountry
        : typeof source.basicInfo === "object" && source.basicInfo
          ? (source.basicInfo as Record<string, unknown>).hostCountry
          : undefined,
  });
  const accommodation = sanitizeAccommodationStepData(
    (typeof source.accommodation === "object" && source.accommodation
      ? (source.accommodation as Record<string, unknown>)
      : null) || undefined,
  );
  const livingExpenses = sanitizeLivingExpensesStepData(
    (typeof source.livingExpenses === "object" && source.livingExpenses
      ? (source.livingExpenses as Record<string, unknown>)
      : null) || undefined,
    {
      fallbackRent:
        typeof accommodation.monthlyRent === "number"
          ? accommodation.monthlyRent
          : null,
    },
  );
  const hasCompleteCourseMapping = sanitizeCourseMappingsData(
    source.courses,
  ).some(isCourseMappingComplete);

  if (isBlank(basicInfo.homeUniversity)) {
    missingFields.push("homeUniversity");
  }

  if (isBlank(basicInfo.homeDepartment)) {
    missingFields.push("homeDepartment");
  }

  if (isBlank(basicInfo.hostUniversity)) {
    missingFields.push("hostUniversity");
  }

  if (isBlank(basicInfo.hostCity)) {
    missingFields.push("hostCity");
  }

  if (isBlank(basicInfo.hostCountry)) {
    missingFields.push("hostCountry");
  }

  if (!accommodation.accommodationType) {
    missingFields.push("accommodationType");
  }

  if (typeof accommodation.monthlyRent !== "number") {
    missingFields.push("monthlyRent");
  }

  if (typeof accommodation.wouldRecommend !== "boolean") {
    missingFields.push("wouldRecommend");
  }

  if (typeof accommodation.accommodationRating !== "number") {
    missingFields.push("accommodationRating");
  }

  if (livingExpenses.food === null) {
    missingFields.push("food");
  }

  if (livingExpenses.transport === null) {
    missingFields.push("transport");
  }

  if (livingExpenses.social === null) {
    missingFields.push("social");
  }

  if (!hasCompleteCourseMapping) {
    missingFields.push("courseMappings");
  }

  return missingFields;
}

export function buildPreviewUnavailableReason(
  source: DestinationIdentitySource,
): AdminPublicImpactPreviewUnavailable | null {
  const missingFields = getMissingMinimumPublicContractFields(source);

  if (missingFields.length === 0) {
    return null;
  }

  return {
    code: "INCOMPLETE_MINIMUM_PUBLIC_CONTRACT",
    message:
      "Cannot preview or publish this submission until the minimum public contract is complete: destination identity, accommodation reality, living costs, and at least one complete course-equivalence example.",
    missingFields,
  };
}
