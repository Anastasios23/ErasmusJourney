function getErrorName(error: unknown): string {
  return error instanceof Error ? error.name : "";
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? "Unknown error");
}

function getErrorCode(error: unknown): string {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return "";
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : "";
}

export function isDatabaseConnectionError(error: unknown): boolean {
  const errorSignature = [
    getErrorName(error),
    getErrorCode(error),
    getErrorMessage(error),
  ].join(" ");

  return (
    getErrorName(error) === "PrismaClientInitializationError" ||
    /connection|timeout|econn|p1001|p2024|can't reach database/i.test(
      errorSignature,
    )
  );
}

export function getDatabaseUnavailableDetails(): string {
  if (process.env.NODE_ENV === "production") {
    return "The service cannot reach the database right now. Please try again later.";
  }

  return "PostgreSQL is not reachable at the configured DATABASE_URL. Start the database server or update DATABASE_URL to a reachable instance.";
}

export function getDatabaseUnavailableCause(
  error: unknown,
): string | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return getErrorMessage(error);
}

export function getInternalServerDetails(
  error: unknown,
  fallback = "Please try again later.",
): string {
  if (process.env.NODE_ENV === "production") {
    return fallback;
  }

  return getErrorMessage(error);
}

export function getInternalServerStack(
  error: unknown,
): string | undefined {
  if (process.env.NODE_ENV !== "development" || !(error instanceof Error)) {
    return undefined;
  }

  return error.stack;
}
