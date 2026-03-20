export const COURSE_RECOGNITION_VALUES = [
  "full_equivalence",
  "department_elective",
  "free_elective",
  "other",
] as const;

export type CourseRecognitionType =
  (typeof COURSE_RECOGNITION_VALUES)[number];

export const COURSE_RECOGNITION_OPTIONS: Array<{
  value: CourseRecognitionType;
  label: string;
}> = [
  { value: "full_equivalence", label: "Full equivalence" },
  { value: "department_elective", label: "Department elective" },
  { value: "free_elective", label: "Free elective" },
  { value: "other", label: "Other recognition" },
];

export interface CourseMappingData {
  id: string;
  homeCourseCode: string;
  homeCourseName: string;
  homeECTS: number | null;
  hostCourseCode: string;
  hostCourseName: string;
  hostECTS: number | null;
  recognitionType: CourseRecognitionType | "";
  notes: string;
}

export interface CourseMappingFormRow {
  id: string;
  homeCourseCode: string;
  homeCourseName: string;
  homeECTS: string;
  hostCourseCode: string;
  hostCourseName: string;
  hostECTS: string;
  recognitionType: CourseRecognitionType | "";
  notes: string;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseECTSValue(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized) {
      return null;
    }

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function stringifyECTSValue(value: number | null): string {
  return value === null ? "" : String(value);
}

export function createCourseMappingId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `course-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyCourseMappingRow(): CourseMappingFormRow {
  return {
    id: createCourseMappingId(),
    homeCourseCode: "",
    homeCourseName: "",
    homeECTS: "",
    hostCourseCode: "",
    hostCourseName: "",
    hostECTS: "",
    recognitionType: "",
    notes: "",
  };
}

export function normalizeRecognitionType(
  value: unknown,
): CourseRecognitionType | "" {
  const normalized = normalizeString(value)
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "full_equivalence":
    case "full_equivalent":
    case "equivalence":
      return "full_equivalence";
    case "department_elective":
    case "departmental_elective":
    case "dept_elective":
      return "department_elective";
    case "free_elective":
    case "general_elective":
    case "university_elective":
      return "free_elective";
    case "other":
      return "other";
    default:
      return "";
  }
}

function deriveRecognitionType(mapping: any): CourseRecognitionType | "" {
  const explicitRecognitionType = normalizeRecognitionType(
    mapping?.recognitionType,
  );

  if (explicitRecognitionType) {
    return explicitRecognitionType;
  }

  if (mapping?.transferApproved === true) {
    return "full_equivalence";
  }

  return "";
}

function getRawMappings(input: unknown): any[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (
    input &&
    typeof input === "object" &&
    Array.isArray((input as { mappings?: unknown[] }).mappings)
  ) {
    return (input as { mappings: unknown[] }).mappings as any[];
  }

  return [];
}

export function hasCourseMappingContent(mapping: CourseMappingData): boolean {
  return !!(
    mapping.homeCourseCode ||
    mapping.homeCourseName ||
    mapping.homeECTS !== null ||
    mapping.hostCourseCode ||
    mapping.hostCourseName ||
    mapping.hostECTS !== null ||
    mapping.recognitionType ||
    mapping.notes
  );
}

export function sanitizeCourseMapping(
  mapping: unknown,
): CourseMappingData | null {
  const source = mapping && typeof mapping === "object" ? mapping : {};
  const item = source as Record<string, unknown>;

  const sanitized: CourseMappingData = {
    id: normalizeString(item.id) || createCourseMappingId(),
    homeCourseCode:
      normalizeString(item.homeCourseCode) ||
      normalizeString(item.homeCode) ||
      normalizeString(item.cyprusCourseCode),
    homeCourseName:
      normalizeString(item.homeCourseName) ||
      normalizeString(item.homeName) ||
      normalizeString(item.cyprusCourseName),
    homeECTS:
      parseECTSValue(item.homeECTS) ??
      parseECTSValue(item.homeCredits) ??
      parseECTSValue(item.homeEcts) ??
      parseECTSValue(item.cyprusCourseCredits) ??
      parseECTSValue(item.cyprusCourseECTS),
    hostCourseCode:
      normalizeString(item.hostCourseCode) || normalizeString(item.hostCode),
    hostCourseName:
      normalizeString(item.hostCourseName) ||
      normalizeString(item.hostName) ||
      normalizeString(item.hostCourse),
    hostECTS:
      parseECTSValue(item.hostECTS) ??
      parseECTSValue(item.hostCredits) ??
      parseECTSValue(item.hostEcts) ??
      parseECTSValue(item.hostCourseCredits) ??
      parseECTSValue(item.ects),
    recognitionType: deriveRecognitionType(item),
    notes:
      normalizeString(item.notes) ||
      normalizeString(item.matchingNotes) ||
      normalizeString(item.recommendationNotes),
  };

  return hasCourseMappingContent(sanitized) ? sanitized : null;
}

export function sanitizeCourseMappingsData(input: unknown): CourseMappingData[] {
  return getRawMappings(input)
    .map((mapping) => sanitizeCourseMapping(mapping))
    .filter((mapping): mapping is CourseMappingData => Boolean(mapping));
}

export function isCourseMappingComplete(mapping: CourseMappingData): boolean {
  return !!(
    mapping.homeCourseName &&
    mapping.homeECTS !== null &&
    mapping.homeECTS > 0 &&
    mapping.hostCourseName &&
    mapping.hostECTS !== null &&
    mapping.hostECTS > 0 &&
    mapping.recognitionType
  );
}

export function hasCompleteCourseMatchingData(input: unknown): boolean {
  const mappings = sanitizeCourseMappingsData(input);
  return mappings.length > 0 && mappings.every(isCourseMappingComplete);
}

export function toCourseMappingFormRows(
  input: unknown,
): CourseMappingFormRow[] {
  return sanitizeCourseMappingsData(input).map((mapping) => ({
    id: mapping.id,
    homeCourseCode: mapping.homeCourseCode,
    homeCourseName: mapping.homeCourseName,
    homeECTS: stringifyECTSValue(mapping.homeECTS),
    hostCourseCode: mapping.hostCourseCode,
    hostCourseName: mapping.hostCourseName,
    hostECTS: stringifyECTSValue(mapping.hostECTS),
    recognitionType: mapping.recognitionType,
    notes: mapping.notes,
  }));
}

export function buildCourseMappingsPayload(
  rows: CourseMappingFormRow[],
): CourseMappingData[] {
  return rows
    .map((row) =>
      sanitizeCourseMapping({
        ...row,
        homeECTS: row.homeECTS,
        hostECTS: row.hostECTS,
      }),
    )
    .filter((mapping): mapping is CourseMappingData => Boolean(mapping));
}

export function getRecognitionTypeLabel(
  value: CourseRecognitionType | "" | null | undefined,
): string {
  if (!value) {
    return "";
  }

  return (
    COURSE_RECOGNITION_OPTIONS.find((option) => option.value === value)?.label ||
    value
  );
}
