type CurrencyDisplayMeta = {
  amountSuffix: string;
  baseCurrency: string;
  isMixed: boolean;
  label: string;
};

export type PublicDestinationSignalTone = "warning" | "info" | "success";

export interface PublicDestinationSignalSummary {
  label: string;
  tone: PublicDestinationSignalTone;
  evidenceLine: string;
  description: string;
}

const MIXED_CURRENCY_SUFFIX = /\s*\(mixed\)\s*$/i;
const UUID_LIKE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OPAQUE_ID_LIKE = /^(?=.{24,}$)[A-Za-z0-9_-]+$/;
const EMAIL_LIKE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const URL_LIKE = /\b(?:https?:\/\/|www\.)\S+/i;
const PHONE_LIKE = /(?:\+?\d[\d\s().-]{7,}\d)/;
const STREET_ADDRESS_LIKE =
  /\b(?:street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd\.?|lane|ln\.?|drive|dr\.?|strasse|straße|via|viale|piazza|calle|carrer|rue|rua|avenida|avda\.?|plaza|platz)\b/i;
const UNIT_ADDRESS_LIKE =
  /\b(?:apt\.?|apartment|flat|unit|suite|building|bldg\.?)\s*[#-]?\s*\d+/i;

function normalizeCurrencyLabel(value?: string | null): string {
  if (typeof value !== "string") {
    return "EUR";
  }

  const normalized = value.trim();
  return normalized || "EUR";
}

export function getPublicDestinationCurrencyMeta(
  value?: string | null,
): CurrencyDisplayMeta {
  const normalized = normalizeCurrencyLabel(value);
  const isMixed = MIXED_CURRENCY_SUFFIX.test(normalized);
  const baseCurrency =
    normalized.replace(MIXED_CURRENCY_SUFFIX, "").trim() || "EUR";

  return {
    amountSuffix: isMixed ? "mixed currencies" : baseCurrency,
    baseCurrency,
    isMixed,
    label: isMixed ? `${baseCurrency} (mixed currencies)` : baseCurrency,
  };
}

export function formatPublicDestinationMoney(
  value: number | null,
  currency?: string | null,
): string {
  if (value === null) {
    return "N/A";
  }

  const amount = Math.round(value).toLocaleString();
  const meta = getPublicDestinationCurrencyMeta(currency);

  return meta.isMixed
    ? `${amount} (${meta.amountSuffix})`
    : `${amount} ${meta.amountSuffix}`;
}

export function formatPublicDestinationListAmount(
  value: number | null,
): string {
  if (value === null) {
    return "N/A";
  }

  return Math.round(value).toLocaleString();
}

export function formatPublicDestinationFreshness(
  value: string | null,
): string {
  if (!value) {
    return "Unknown";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getPublicDestinationSignalSummary(
  submissionCount: number,
  hostUniversityCount = 0,
): PublicDestinationSignalSummary {
  const normalizedSubmissionCount = Math.max(0, Math.trunc(submissionCount));
  const normalizedHostUniversityCount = Math.max(
    0,
    Math.trunc(hostUniversityCount),
  );
  const submissionLabel =
    normalizedSubmissionCount === 1 ? "submission" : "submissions";
  const hostUniversityLine =
    normalizedHostUniversityCount > 0
      ? ` across ${normalizedHostUniversityCount} host ${
          normalizedHostUniversityCount === 1 ? "university" : "universities"
        }`
      : "";
  const evidenceLine =
    normalizedSubmissionCount === 0
      ? "No approved submissions are aggregated here yet."
      : `Based on ${normalizedSubmissionCount} approved ${submissionLabel}${hostUniversityLine}.`;

  if (normalizedSubmissionCount < 5) {
    return {
      label: "Limited data",
      tone: "warning",
      evidenceLine,
      description:
        "Fewer than 5 approved submissions are available for this city, so averages and summary claims stay hidden until the sample grows.",
    };
  }

  if (normalizedSubmissionCount < 7) {
    return {
      label: "Growing sample",
      tone: "info",
      evidenceLine,
      description:
        "Enough approved submissions are available to start comparing recurring city-level patterns, while still treating results as directional.",
    };
  }

  return {
    label: "Stronger signal",
    tone: "success",
    evidenceLine,
    description:
      "Enough approved reports are available to compare recurring patterns more confidently, while still allowing for personal variation.",
  };
}

export function normalizePublicDestinationText(
  value: unknown,
  options?: { maxLength?: number },
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const maxLength = options?.maxLength ?? 300;
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized || normalized === "[object Object]") {
    return null;
  }

  if (UUID_LIKE.test(normalized) || OPAQUE_ID_LIKE.test(normalized)) {
    return null;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function hasUnsafePublicTextDetails(
  value: string,
  options?: { rejectAddressLikePatterns?: boolean },
): boolean {
  if (EMAIL_LIKE.test(value) || URL_LIKE.test(value) || PHONE_LIKE.test(value)) {
    return true;
  }

  if (
    options?.rejectAddressLikePatterns &&
    (STREET_ADDRESS_LIKE.test(value) || UNIT_ADDRESS_LIKE.test(value))
  ) {
    return true;
  }

  return false;
}

export function sanitizePublicDestinationNarrative(
  value: unknown,
  options?: { maxLength?: number },
): string | null {
  const normalized = normalizePublicDestinationText(value, {
    maxLength: options?.maxLength ?? 220,
  });

  if (!normalized) {
    return null;
  }

  return hasUnsafePublicTextDetails(normalized, {
    rejectAddressLikePatterns: true,
  })
    ? null
    : normalized;
}

export function sanitizePublicDestinationArea(value: unknown): string | null {
  const normalized = normalizePublicDestinationText(value, { maxLength: 80 });

  if (!normalized) {
    return null;
  }

  const firstSegment = normalized.split(/[|,;/]/)[0]?.trim() || "";

  if (!firstSegment) {
    return null;
  }

  return hasUnsafePublicTextDetails(firstSegment, {
    rejectAddressLikePatterns: true,
  })
    ? null
    : firstSegment;
}
