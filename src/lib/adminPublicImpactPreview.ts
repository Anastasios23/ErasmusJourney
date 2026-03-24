import type {
  AdminPublicImpactMissingField,
  AdminPublicImpactPreviewUnavailable,
} from "../types/adminPublicImpactPreview";

interface DestinationIdentitySource {
  hostCity?: string | null;
  hostCountry?: string | null;
}

function isBlank(value: string | null | undefined): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

export function getMissingDestinationIdentityFields(
  source: DestinationIdentitySource,
): AdminPublicImpactMissingField[] {
  const missingFields: AdminPublicImpactMissingField[] = [];

  if (isBlank(source.hostCity)) {
    missingFields.push("hostCity");
  }

  if (isBlank(source.hostCountry)) {
    missingFields.push("hostCountry");
  }

  return missingFields;
}

export function buildPreviewUnavailableReason(
  source: DestinationIdentitySource,
): AdminPublicImpactPreviewUnavailable | null {
  const missingFields = getMissingDestinationIdentityFields(source);

  if (missingFields.length === 0) {
    return null;
  }

  return {
    code: "INCOMPLETE_DESTINATION_IDENTITY",
    message:
      "Cannot preview or publish this submission to public destination pages until the destination city and country are complete.",
    missingFields,
  };
}
