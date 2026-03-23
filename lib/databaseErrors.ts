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
  return "PostgreSQL is not reachable at the configured DATABASE_URL. Start the database server or update DATABASE_URL to a reachable instance.";
}
