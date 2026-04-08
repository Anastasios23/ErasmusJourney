import { sanitizeAccommodationStepData } from "./accommodation";
import {
  isCourseMappingComplete,
  sanitizeCourseMappingsData,
} from "./courseMatching";

export const CANONICAL_REVIEW_ACTIONS = [
  "APPROVED",
  "REJECTED",
  "REQUEST_CHANGES",
  "WORDING_EDITED",
] as const;

export type CanonicalReviewAction = (typeof CANONICAL_REVIEW_ACTIONS)[number];

export type LegacyCompatibleReviewAction =
  | CanonicalReviewAction
  | "REVISION_REQUESTED";

export interface ExperiencePublicWordingEdits {
  accommodationReview?: string | null;
  generalTips?: string | null;
  academicAdvice?: string | null;
  socialAdvice?: string | null;
  bestExperience?: string | null;
  courseNotes?: Record<string, string | null>;
}

interface StoredExperienceModerationMetadata {
  legacyAdminNotes?: string;
  publicWordingEdits?: ExperiencePublicWordingEdits;
}

export interface ExperiencePublicWordingSource {
  accommodation?: unknown;
  experience?: unknown;
  courses?: unknown;
  adminNotes?: string | null;
}

export interface PublicWordingEditorCourseNote {
  id: string;
  label: string;
  value: string;
}

export interface PublicWordingEditorState {
  accommodationReview: string;
  generalTips: string;
  academicAdvice: string;
  socialAdvice: string;
  bestExperience: string;
  courseNotes: PublicWordingEditorCourseNote[];
}

export interface PublicWordingChangeSummary {
  label: string;
  mode: "updated" | "cleared";
}

function normalizeOptionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function isStoredCourseNotes(
  value: unknown,
): value is Record<string, string | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (item) => typeof item === "string" || item === null,
  );
}

function normalizeStoredWordingEdits(
  value: unknown,
): ExperiencePublicWordingEdits {
  const source = toRecord(value);

  if (!source) {
    return {};
  }

  const courseNotes = isStoredCourseNotes(source.courseNotes)
    ? Object.fromEntries(
        Object.entries(source.courseNotes)
          .map(([key, note]) => {
            if (typeof note === "string") {
              const normalized = note.trim();
              return normalized ? [key, normalized] : [key, null];
            }

            return [key, null];
          })
          .filter(([key]) => Boolean(normalizeOptionalString(key))),
      )
    : undefined;

  return {
    accommodationReview:
      source.accommodationReview === null
        ? null
        : normalizeOptionalString(source.accommodationReview) || undefined,
    generalTips:
      source.generalTips === null
        ? null
        : normalizeOptionalString(source.generalTips) || undefined,
    academicAdvice:
      source.academicAdvice === null
        ? null
        : normalizeOptionalString(source.academicAdvice) || undefined,
    socialAdvice:
      source.socialAdvice === null
        ? null
        : normalizeOptionalString(source.socialAdvice) || undefined,
    bestExperience:
      source.bestExperience === null
        ? null
        : normalizeOptionalString(source.bestExperience) || undefined,
    ...(courseNotes && Object.keys(courseNotes).length > 0
      ? { courseNotes }
      : {}),
  };
}

export function normalizeReviewAction(
  action: string | null | undefined,
): CanonicalReviewAction | null {
  switch (action) {
    case "APPROVED":
    case "REJECTED":
    case "REQUEST_CHANGES":
    case "WORDING_EDITED":
      return action;
    case "REVISION_REQUESTED":
      return "REQUEST_CHANGES";
    default:
      return null;
  }
}

export function parseExperienceModerationMetadata(
  adminNotes: string | null | undefined,
): StoredExperienceModerationMetadata {
  const normalizedAdminNotes = normalizeOptionalString(adminNotes);

  if (!normalizedAdminNotes) {
    return {};
  }

  try {
    const parsed = JSON.parse(normalizedAdminNotes) as unknown;
    const record = toRecord(parsed);

    if (!record) {
      return {
        legacyAdminNotes: normalizedAdminNotes,
      };
    }

    return {
      legacyAdminNotes: normalizeOptionalString(record.legacyAdminNotes) || undefined,
      publicWordingEdits: normalizeStoredWordingEdits(record.publicWordingEdits),
    };
  } catch {
    return {
      legacyAdminNotes: normalizedAdminNotes,
    };
  }
}

export function getExperiencePublicWordingEdits(
  adminNotes: string | null | undefined,
): ExperiencePublicWordingEdits {
  return parseExperienceModerationMetadata(adminNotes).publicWordingEdits || {};
}

function getSourceCourseNotes(source: ExperiencePublicWordingSource) {
  return sanitizeCourseMappingsData(source.courses)
    .filter(isCourseMappingComplete)
    .map((mapping) => ({
      id: mapping.id,
      label: `${mapping.homeCourseName} -> ${mapping.hostCourseName}`,
      originalValue: normalizeOptionalString(mapping.notes),
    }));
}

export function getPublicWordingEditorState(
  source: ExperiencePublicWordingSource,
): PublicWordingEditorState {
  const accommodation = sanitizeAccommodationStepData(
    toRecord(source.accommodation),
  );
  const experience = toRecord(source.experience) || {};
  const wordingEdits = getExperiencePublicWordingEdits(source.adminNotes);

  return {
    accommodationReview:
      wordingEdits.accommodationReview === null
        ? ""
        : wordingEdits.accommodationReview ??
          normalizeOptionalString(accommodation.accommodationReview),
    generalTips:
      wordingEdits.generalTips === null
        ? ""
        : wordingEdits.generalTips ??
          normalizeOptionalString(experience.generalTips),
    academicAdvice:
      wordingEdits.academicAdvice === null
        ? ""
        : wordingEdits.academicAdvice ??
          normalizeOptionalString(experience.academicAdvice),
    socialAdvice:
      wordingEdits.socialAdvice === null
        ? ""
        : wordingEdits.socialAdvice ??
          normalizeOptionalString(experience.socialAdvice),
    bestExperience:
      wordingEdits.bestExperience === null
        ? ""
        : wordingEdits.bestExperience ??
          normalizeOptionalString(experience.bestExperience),
    courseNotes: getSourceCourseNotes(source).map((courseNote) => ({
      id: courseNote.id,
      label: courseNote.label,
      value:
        wordingEdits.courseNotes?.[courseNote.id] === null
          ? ""
          : wordingEdits.courseNotes?.[courseNote.id] ?? courseNote.originalValue,
    })),
  };
}

function buildStoredNarrativeOverride(
  rawValue: string,
  nextValue: string,
): string | null | undefined {
  if (nextValue === rawValue) {
    return undefined;
  }

  return nextValue ? nextValue : null;
}

export function buildStoredPublicWordingEdits(
  source: ExperiencePublicWordingSource,
  nextState: PublicWordingEditorState,
): ExperiencePublicWordingEdits {
  const accommodation = sanitizeAccommodationStepData(
    toRecord(source.accommodation),
  );
  const experience = toRecord(source.experience) || {};
  const sourceCourseNotes = getSourceCourseNotes(source);

  const nextEdits: ExperiencePublicWordingEdits = {};

  const narrativeFields: Array<
    [
      keyof Omit<ExperiencePublicWordingEdits, "courseNotes">,
      string,
      string,
    ]
  > = [
    [
      "accommodationReview",
      normalizeOptionalString(accommodation.accommodationReview),
      normalizeOptionalString(nextState.accommodationReview),
    ],
    [
      "generalTips",
      normalizeOptionalString(experience.generalTips),
      normalizeOptionalString(nextState.generalTips),
    ],
    [
      "academicAdvice",
      normalizeOptionalString(experience.academicAdvice),
      normalizeOptionalString(nextState.academicAdvice),
    ],
    [
      "socialAdvice",
      normalizeOptionalString(experience.socialAdvice),
      normalizeOptionalString(nextState.socialAdvice),
    ],
    [
      "bestExperience",
      normalizeOptionalString(experience.bestExperience),
      normalizeOptionalString(nextState.bestExperience),
    ],
  ];

  for (const [field, rawValue, nextValue] of narrativeFields) {
    const override = buildStoredNarrativeOverride(rawValue, nextValue);

    if (override !== undefined) {
      nextEdits[field] = override;
    }
  }

  const courseNoteOverrides = Object.fromEntries(
    sourceCourseNotes
      .map((courseNote) => {
        const nextValue =
          nextState.courseNotes.find((item) => item.id === courseNote.id)?.value ??
          courseNote.originalValue;
        const override = buildStoredNarrativeOverride(
          courseNote.originalValue,
          normalizeOptionalString(nextValue),
        );

        return override !== undefined ? [courseNote.id, override] : null;
      })
      .filter(
        (
          entry,
        ): entry is [string, string | null] => Array.isArray(entry) && entry.length === 2,
      ),
  );

  if (Object.keys(courseNoteOverrides).length > 0) {
    nextEdits.courseNotes = courseNoteOverrides;
  }

  return nextEdits;
}

export function serializeExperienceModerationMetadata(
  adminNotes: string | null | undefined,
  publicWordingEdits: ExperiencePublicWordingEdits,
): string | null {
  const existingMetadata = parseExperienceModerationMetadata(adminNotes);
  const hasPublicWordingEdits = Object.entries(publicWordingEdits).some(
    ([field, value]) => {
      if (field === "courseNotes") {
        return Boolean(value && Object.keys(value).length > 0);
      }

      return value !== undefined;
    },
  );

  if (!existingMetadata.legacyAdminNotes && !hasPublicWordingEdits) {
    return null;
  }

  return JSON.stringify({
    ...(existingMetadata.legacyAdminNotes
      ? { legacyAdminNotes: existingMetadata.legacyAdminNotes }
      : {}),
    ...(hasPublicWordingEdits ? { publicWordingEdits } : {}),
  });
}

export function summarizePublicWordingChanges(
  source: ExperiencePublicWordingSource,
  nextState: PublicWordingEditorState,
): PublicWordingChangeSummary[] {
  const currentState = getPublicWordingEditorState(source);
  const summaries: PublicWordingChangeSummary[] = [];

  const narrativeLabels: Array<
    [keyof Omit<PublicWordingEditorState, "courseNotes">, string]
  > = [
    ["accommodationReview", "Accommodation review wording"],
    ["generalTips", "General tips wording"],
    ["academicAdvice", "Academic advice wording"],
    ["socialAdvice", "Social advice wording"],
    ["bestExperience", "Best experience wording"],
  ];

  for (const [field, label] of narrativeLabels) {
    const currentValue = normalizeOptionalString(currentState[field]);
    const nextValue = normalizeOptionalString(nextState[field]);

    if (currentValue === nextValue) {
      continue;
    }

    summaries.push({
      label,
      mode: nextValue ? "updated" : "cleared",
    });
  }

  const nextCourseNotes = new Map(
    nextState.courseNotes.map((courseNote) => [
      courseNote.id,
      normalizeOptionalString(courseNote.value),
    ]),
  );

  for (const courseNote of currentState.courseNotes) {
    const currentValue = normalizeOptionalString(courseNote.value);
    const nextValue = nextCourseNotes.get(courseNote.id) ?? currentValue;

    if (currentValue === nextValue) {
      continue;
    }

    summaries.push({
      label: `Course note wording: ${courseNote.label}`,
      mode: nextValue ? "updated" : "cleared",
    });
  }

  return summaries;
}

