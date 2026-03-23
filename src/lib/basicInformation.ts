export const BASIC_INFO_LEVEL_OPTIONS = ["Bachelor", "Master", "PhD"] as const;
export const BASIC_INFO_PERIOD_OPTIONS = [
  "Fall",
  "Spring",
  "Full Year",
] as const;

export type BasicInfoLevel = (typeof BASIC_INFO_LEVEL_OPTIONS)[number];
export type BasicInfoPeriod = (typeof BASIC_INFO_PERIOD_OPTIONS)[number];

export interface BasicInformationData {
  homeUniversity: string;
  homeUniversityCode: string;
  homeDepartment: string;
  levelOfStudy: BasicInfoLevel | "";
  hostUniversity: string;
  hostUniversityId: string;
  hostCity: string;
  hostCountry: string;
  exchangeAcademicYear: string;
  exchangePeriod: BasicInfoPeriod | "";
  languageOfInstruction: string;
  exchangeStartDate: string;
  exchangeEndDate: string;
}

export const BASIC_INFORMATION_REQUIRED_FIELDS: Array<
  keyof BasicInformationData
> = [
  "homeUniversity",
  "homeDepartment",
  "levelOfStudy",
  "hostUniversity",
  "exchangeAcademicYear",
  "exchangePeriod",
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

export function normalizeAcademicYear(value: unknown): string {
  const normalized = asString(value);

  if (/^\d{4}\s*[-/]\s*\d{4}$/.test(normalized)) {
    return normalized.replace(/\s*[-/]\s*/, "/");
  }

  return normalized;
}

export function sanitizeBasicInformationData(
  value?:
    | Partial<Record<string, unknown>>
    | Partial<BasicInformationData>
    | null,
): BasicInformationData {
  const raw = (value ?? {}) as Partial<Record<string, unknown>>;
  const levelOfStudy = asString(raw.levelOfStudy) as BasicInfoLevel;
  const exchangePeriod = asString(raw.exchangePeriod) as BasicInfoPeriod;

  return {
    homeUniversity: asString(raw.homeUniversity),
    homeUniversityCode:
      asString(raw.homeUniversityCode) || asString(raw.homeUniversityId),
    homeDepartment: asString(raw.homeDepartment),
    levelOfStudy: BASIC_INFO_LEVEL_OPTIONS.includes(levelOfStudy)
      ? levelOfStudy
      : "",
    hostUniversity: asString(raw.hostUniversity),
    hostUniversityId: asString(raw.hostUniversityId),
    hostCity: asString(raw.hostCity),
    hostCountry: asString(raw.hostCountry),
    exchangeAcademicYear: normalizeAcademicYear(raw.exchangeAcademicYear),
    exchangePeriod: BASIC_INFO_PERIOD_OPTIONS.includes(exchangePeriod)
      ? exchangePeriod
      : "",
    languageOfInstruction: asString(raw.languageOfInstruction),
    exchangeStartDate: asString(raw.exchangeStartDate),
    exchangeEndDate: asString(raw.exchangeEndDate),
  };
}

export function isBasicInformationComplete(
  value?:
    | Partial<Record<string, unknown>>
    | Partial<BasicInformationData>
    | null,
): boolean {
  const sanitized = sanitizeBasicInformationData(value);

  return BASIC_INFORMATION_REQUIRED_FIELDS.every((field) => !!sanitized[field]);
}

export function buildExperienceSemester(
  value?:
    | Partial<Record<string, unknown>>
    | Partial<BasicInformationData>
    | null,
): string | null {
  const sanitized = sanitizeBasicInformationData(value);

  if (!sanitized.exchangeAcademicYear && !sanitized.exchangePeriod) {
    return null;
  }

  return [sanitized.exchangeAcademicYear, sanitized.exchangePeriod]
    .filter(Boolean)
    .join(" ");
}
