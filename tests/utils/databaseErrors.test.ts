import { describe, expect, it } from "vitest";

import {
  getDatabaseUnavailableDetails,
  getErrorMessage,
  isDatabaseConnectionError,
} from "../../lib/databaseErrors";

describe("database error helpers", () => {
  it("detects Prisma initialization errors caused by unreachable databases", () => {
    const error = Object.assign(
      new Error("Can't reach database server at `localhost:5432`."),
      {
        name: "PrismaClientInitializationError",
      },
    );

    expect(isDatabaseConnectionError(error)).toBe(true);
  });

  it("detects Prisma connection errors by code when the name is generic", () => {
    const error = Object.assign(new Error("Prisma error"), {
      code: "P1001",
    });

    expect(isDatabaseConnectionError(error)).toBe(true);
  });

  it("keeps the database unavailable guidance actionable", () => {
    expect(getDatabaseUnavailableDetails()).toContain("DATABASE_URL");
    expect(getDatabaseUnavailableDetails()).toContain("Start the database server");
    expect(getErrorMessage(new Error("example failure"))).toBe(
      "example failure",
    );
  });
});
