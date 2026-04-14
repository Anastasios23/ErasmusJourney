import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

const removedLegacyModels = [
  "accommodations",
  "admin_destinations",
  "generated_destinations",
  "generated_accommodations",
  "generated_course_exchanges",
  "university_exchanges",
  "destination_submissions",
  "destinations",
  "form_submissions",
  "custom_destinations",
  "partnership_tracking",
  "stories",
  "story_engagements",
  "CityStatistics",
] as const;

describe("legacy destination schema cleanup", () => {
  it("does not expose removed legacy destination models in the Prisma client", () => {
    const modelNames = Object.values(Prisma.ModelName);

    for (const modelName of removedLegacyModels) {
      expect(modelNames).not.toContain(modelName);
    }
  });
});
