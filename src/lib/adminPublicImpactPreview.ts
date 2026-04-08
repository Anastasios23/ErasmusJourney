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
  const hasCompleteCourseMapping = sanitizeCourseMappingsData(
    source.courses,
  ).some(isCourseMappingComplete);

  if (isBlank(basicInfo.homeUniversity)) {
    missingFields.push("homeUniversity");
  }

  if (isBlank(basicInfo.hostUniversity)) {
    missingFields.push("hostUniversity");
  }

  if (isBlank(basicInfo.hostCity)) {
    missingFields.push("hostCity");
  }

  // Public destination slugs and persisted read-model rows are keyed by
  // city+country, so country stays in the MVP minimum contract to avoid
  // collisions between cities that share the same name across countries.
  if (isBlank(basicInfo.hostCountry)) {
    missingFields.push("hostCountry");
  }

  if (!accommodation.accommodationType) {
    missingFields.push("accommodationType");
  }

  if (typeof accommodation.monthlyRent !== "number") {
    missingFields.push("monthlyRent");
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
      "Cannot preview or publish this submission until the MVP minimum public contract is complete: host city, host country, host university, home university, accommodation type, monthly rent, and at least one complete course-equivalence example.",
    missingFields,
  };
}
