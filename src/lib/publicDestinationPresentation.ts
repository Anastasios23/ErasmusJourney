type CurrencyDisplayMeta = {
  amountSuffix: string;
  baseCurrency: string;
  isMixed: boolean;
  label: string;
};

const MIXED_CURRENCY_SUFFIX = /\s*\(mixed\)\s*$/i;
const UUID_LIKE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OPAQUE_ID_LIKE = /^(?=.{24,}$)[A-Za-z0-9_-]+$/;

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
