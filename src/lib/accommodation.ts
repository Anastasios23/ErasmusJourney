export const ACCOMMODATION_TYPE_VALUES = [
  "student_residence",
  "shared_apartment",
  "private_apartment",
  "homestay",
  "other",
] as const;

export const BILLS_INCLUDED_VALUES = ["yes", "no", "partially"] as const;

export const HOW_FOUND_ACCOMMODATION_VALUES = [
  "university_dorm",
  "housing_platform",
  "facebook_group",
  "agency",
  "friend",
  "other",
] as const;

export const DIFFICULTY_FINDING_ACCOMMODATION_VALUES = [
  "very_easy",
  "easy",
  "moderate",
  "difficult",
  "very_difficult",
] as const;

export type AccommodationTypeValue = (typeof ACCOMMODATION_TYPE_VALUES)[number];
export type BillsIncludedValue = (typeof BILLS_INCLUDED_VALUES)[number];
export type HowFoundAccommodationValue =
  (typeof HOW_FOUND_ACCOMMODATION_VALUES)[number];
export type DifficultyFindingAccommodationValue =
  (typeof DIFFICULTY_FINDING_ACCOMMODATION_VALUES)[number];

export interface AccommodationStepData {
  accommodationType?: AccommodationTypeValue;
  monthlyRent?: number;
  currency: string;
  billsIncluded?: BillsIncludedValue;
  areaOrNeighborhood?: string;
  minutesToUniversity?: number;
  howFoundAccommodation?: HowFoundAccommodationValue;
  difficultyFindingAccommodation?: DifficultyFindingAccommodationValue;
  accommodationRating?: number;
  wouldRecommend?: boolean;
  accommodationReview?: string;
}

export const ACCOMMODATION_TYPE_OPTIONS: Array<{
  value: AccommodationTypeValue;
  label: string;
}> = [
  { value: "student_residence", label: "Student residence / dorm" },
  { value: "shared_apartment", label: "Shared apartment" },
  { value: "private_apartment", label: "Private apartment / studio" },
  { value: "homestay", label: "Homestay / host family" },
  { value: "other", label: "Other" },
];

export const BILLS_INCLUDED_OPTIONS: Array<{
  value: BillsIncludedValue;
  label: string;
}> = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "partially", label: "Partially" },
];

export const HOW_FOUND_ACCOMMODATION_OPTIONS: Array<{
  value: HowFoundAccommodationValue;
  label: string;
}> = [
  { value: "university_dorm", label: "University dorm office" },
  { value: "housing_platform", label: "Housing platform" },
  { value: "facebook_group", label: "Facebook group" },
  { value: "agency", label: "Agency" },
  { value: "friend", label: "Friend / referral" },
  { value: "other", label: "Other" },
];

export const DIFFICULTY_FINDING_ACCOMMODATION_OPTIONS: Array<{
  value: DifficultyFindingAccommodationValue;
  label: string;
}> = [
  { value: "very_easy", label: "Very easy" },
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "difficult", label: "Difficult" },
  { value: "very_difficult", label: "Very difficult" },
];

function asString(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function asStrictNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized || !/^-?\d+(\.\d+)?$/.test(normalized)) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeAccommodationType(
  value: unknown,
): AccommodationTypeValue | undefined {
  const normalized = asString(value)
    .toLowerCase()
    .replace(/[/-]/g, "_")
    .replace(/\s+/g, "_");

  switch (normalized) {
    case "student_residence":
    case "student_residences":
    case "student_dorm":
    case "student_dormitory":
    case "university_dorm":
    case "university_dormitory":
    case "dorm":
    case "dormitory":
    case "residence":
      return "student_residence";
    case "shared_apartment":
    case "shared_flat":
    case "shared_room":
    case "flatshare":
      return "shared_apartment";
    case "private_apartment":
    case "private_flat":
    case "private_room":
    case "private_studio":
    case "studio":
    case "apartment":
      return "private_apartment";
    case "host_family":
    case "homestay":
      return "homestay";
    case "other":
      return "other";
    default:
      return undefined;
  }
}

function normalizeBillsIncluded(
  value: unknown,
): BillsIncludedValue | undefined {
  const normalized = asString(value).toLowerCase();

  switch (normalized) {
    case "yes":
      return "yes";
    case "no":
      return "no";
    case "partial":
    case "partially":
      return "partially";
    default:
      return undefined;
  }
}

function normalizeHowFoundAccommodation(
  value: unknown,
): HowFoundAccommodationValue | undefined {
  const normalized = asString(value)
    .toLowerCase()
    .replace(/[/-]/g, "_")
    .replace(/\s+/g, "_");

  switch (normalized) {
    case "university_dorm":
    case "university_housing":
    case "dorm":
    case "dorm_office":
      return "university_dorm";
    case "housing_platform":
    case "platform":
    case "website":
    case "housing_site":
      return "housing_platform";
    case "facebook_group":
    case "facebook":
      return "facebook_group";
    case "agency":
      return "agency";
    case "friend":
    case "referral":
      return "friend";
    case "other":
      return "other";
    default:
      return undefined;
  }
}

function normalizeDifficultyFindingAccommodation(
  value: unknown,
): DifficultyFindingAccommodationValue | undefined {
  const normalized = asString(value).toLowerCase().replace(/[ -]/g, "_");

  switch (normalized) {
    case "very_easy":
      return "very_easy";
    case "easy":
      return "easy";
    case "moderate":
      return "moderate";
    case "difficult":
      return "difficult";
    case "very_difficult":
      return "very_difficult";
    default:
      return undefined;
  }
}

function normalizeWouldRecommend(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = asString(value).toLowerCase();
  if (normalized === "yes" || normalized === "true") {
    return true;
  }
  if (normalized === "no" || normalized === "false") {
    return false;
  }

  return undefined;
}

export function createEmptyAccommodationStepData(): AccommodationStepData {
  return {
    currency: "EUR",
  };
}

export function sanitizeAccommodationStepData(
  value?: AccommodationStepData | Partial<Record<string, unknown>> | null,
): AccommodationStepData {
  const rawValue = (value || {}) as Partial<Record<string, unknown>>;
  const monthlyRent = asStrictNumber(rawValue.monthlyRent ?? rawValue.rent);
  const minutesToUniversity = asStrictNumber(
    rawValue.minutesToUniversity ?? rawValue.distanceToUniversity,
  );
  const accommodationRating = asStrictNumber(
    rawValue.accommodationRating ?? rawValue.rating,
  );
  const areaOrNeighborhood = asString(
    rawValue.areaOrNeighborhood ??
      rawValue.neighborhood ??
      rawValue.area ??
      rawValue.location,
  );
  const accommodationReview = asString(
    rawValue.accommodationReview ?? rawValue.review,
  );

  return {
    accommodationType: normalizeAccommodationType(
      rawValue.accommodationType ?? rawValue.type,
    ),
    monthlyRent,
    currency: asString(rawValue.currency).toUpperCase() || "EUR",
    billsIncluded: normalizeBillsIncluded(rawValue.billsIncluded),
    areaOrNeighborhood: areaOrNeighborhood || undefined,
    minutesToUniversity,
    howFoundAccommodation: normalizeHowFoundAccommodation(
      rawValue.howFoundAccommodation,
    ),
    difficultyFindingAccommodation: normalizeDifficultyFindingAccommodation(
      rawValue.difficultyFindingAccommodation ??
        rawValue.easyToFind ??
        rawValue.findingDifficulty,
    ),
    accommodationRating,
    wouldRecommend: normalizeWouldRecommend(rawValue.wouldRecommend),
    accommodationReview: accommodationReview || undefined,
  };
}

export function isAccommodationStepComplete(
  value?: Partial<Record<string, unknown>> | null,
): boolean {
  const sanitized = sanitizeAccommodationStepData(value);

  return (
    !!sanitized.accommodationType &&
    typeof sanitized.monthlyRent === "number" &&
    !!sanitized.billsIncluded &&
    typeof sanitized.accommodationRating === "number" &&
    typeof sanitized.wouldRecommend === "boolean"
  );
}

export function getAccommodationTypeLabel(value?: string | null): string {
  const normalized = normalizeAccommodationType(value);

  switch (normalized) {
    case "student_residence":
      return "Student residence";
    case "shared_apartment":
      return "Shared apartment";
    case "private_apartment":
      return "Private apartment";
    case "homestay":
      return "Homestay";
    case "other":
      return "Other";
    default:
      return asString(value) || "Unknown";
  }
}

export function getBillsIncludedLabel(value?: string | null): string {
  const normalized = normalizeBillsIncluded(value);

  switch (normalized) {
    case "yes":
      return "Yes";
    case "no":
      return "No";
    case "partially":
      return "Partially";
    default:
      return asString(value) || "Unknown";
  }
}

export function getHowFoundAccommodationLabel(value?: string | null): string {
  const normalized = normalizeHowFoundAccommodation(value);

  switch (normalized) {
    case "university_dorm":
      return "University dorm office";
    case "housing_platform":
      return "Housing platform";
    case "facebook_group":
      return "Facebook group";
    case "agency":
      return "Agency";
    case "friend":
      return "Friend / referral";
    case "other":
      return "Other";
    default:
      return asString(value) || "Unknown";
  }
}

export function getDifficultyFindingAccommodationLabel(
  value?: string | null,
): string {
  const normalized = normalizeDifficultyFindingAccommodation(value);

  switch (normalized) {
    case "very_easy":
      return "Very easy";
    case "easy":
      return "Easy";
    case "moderate":
      return "Moderate";
    case "difficult":
      return "Difficult";
    case "very_difficult":
      return "Very difficult";
    default:
      return asString(value) || "Unknown";
  }
}
