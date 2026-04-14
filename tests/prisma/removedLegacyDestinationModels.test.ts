import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

const removedLegacyModels = [
  "accommodations",
  "admin_destinations",
  "generated_destinations",
  "generated_accommodations",
  "generated_course_exchanges",
  "university_exchanges",
] as const;

describe("legacy destination schema cleanup", () => {
  it("does not expose removed legacy destination models in the Prisma client", () => {
    const modelNames = Object.values(Prisma.ModelName);

    for (const modelName of removedLegacyModels) {
      expect(modelNames).not.toContain(modelName);
    }
  });
});
