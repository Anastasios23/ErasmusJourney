import { describe, expect, it } from "vitest";

import {
  getDatabaseUnavailableCause,
  getDatabaseUnavailableDetails,
  getErrorMessage,
  getInternalServerDetails,
  getInternalServerStack,
  isDatabaseConnectionError,
} from "../../lib/databaseErrors";

describe("database error helpers", () => {
  it("hides internal database details in production", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      expect(getDatabaseUnavailableDetails()).toBe(
        "The service cannot reach the database right now. Please try again later.",
      );
      expect(getDatabaseUnavailableCause(new Error("example failure"))).toBe(
        undefined,
      );
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

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
    expect(getDatabaseUnavailableCause(new Error("example failure"))).toBe(
      "example failure",
    );
    expect(getInternalServerDetails(new Error("example failure"))).toBe(
      "example failure",
    );
    expect(getErrorMessage(new Error("example failure"))).toBe(
      "example failure",
    );
  });

  it("hides generic internal server details outside development", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      expect(getInternalServerDetails(new Error("example failure"))).toBe(
        "Please try again later.",
      );
      expect(getInternalServerStack(new Error("example failure"))).toBe(
        undefined,
      );
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });
});
