const DEFAULT_AUTH_CALLBACK = "/dashboard";
const AUTH_ENTRY_PATHS = new Set(["/login", "/register"]);

function coerceString(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const first = value.find(
      (entry): entry is string =>
        typeof entry === "string" && entry.trim().length > 0,
    );

    return first?.trim() || null;
  }

  return null;
}

function getSafeFallbackPath(fallback: string): string {
  const normalized = fallback.trim();

  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return DEFAULT_AUTH_CALLBACK;
  }

  return AUTH_ENTRY_PATHS.has(normalized) ? DEFAULT_AUTH_CALLBACK : normalized;
}

function toRelativePath(candidate: string): string | null {
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(candidate, "http://localhost");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function normalizeInternalCallbackPath(
  value: string | string[] | undefined,
  fallback = DEFAULT_AUTH_CALLBACK,
): string {
  const safeFallback = getSafeFallbackPath(fallback);
  let current = coerceString(value);

  for (let depth = 0; depth < 5; depth += 1) {
    if (!current) {
      return safeFallback;
    }

    const relativePath = toRelativePath(current);
    if (!relativePath) {
      return safeFallback;
    }

    const parsed = new URL(relativePath, "http://localhost");
    const nextPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    if (!AUTH_ENTRY_PATHS.has(parsed.pathname)) {
      return nextPath;
    }

    current = parsed.searchParams.get("callbackUrl");
  }

  return safeFallback;
}

export function buildLoginRedirectUrl(
  value: string | string[] | undefined,
  fallback = DEFAULT_AUTH_CALLBACK,
): string {
  const callbackPath = normalizeInternalCallbackPath(value, fallback);
  return `/login?callbackUrl=${encodeURIComponent(callbackPath)}`;
}

export function buildRegisterRedirectUrl(
  value: string | string[] | undefined,
  fallback = DEFAULT_AUTH_CALLBACK,
): string {
  const callbackPath = normalizeInternalCallbackPath(value, fallback);
  return `/register?callbackUrl=${encodeURIComponent(callbackPath)}`;
}
