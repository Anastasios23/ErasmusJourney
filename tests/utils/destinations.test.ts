import { describe, it, expect } from "vitest";
import { ERASMUS_DESTINATIONS } from "../../src/data/destinations";

describe("Destinations Data", () => {
  it("should have valid destination objects", () => {
    expect(ERASMUS_DESTINATIONS).toBeDefined();
    expect(Array.isArray(ERASMUS_DESTINATIONS)).toBe(true);
    expect(ERASMUS_DESTINATIONS.length).toBeGreaterThan(0);
  });

  it("should have required fields for each destination", () => {
    ERASMUS_DESTINATIONS.forEach((destination) => {
      expect(destination).toHaveProperty("id");
      expect(destination).toHaveProperty("city");
      expect(destination).toHaveProperty("country");
      expect(destination).toHaveProperty("university");
      expect(destination).toHaveProperty("language");
      expect(destination).toHaveProperty("costOfLiving");
      expect(destination).toHaveProperty("averageRent");
      expect(destination).toHaveProperty("imageUrl");
      expect(destination).toHaveProperty("description");

      // Validate data types
      expect(typeof destination.id).toBe("string");
      expect(typeof destination.city).toBe("string");
      expect(typeof destination.country).toBe("string");
      expect(typeof destination.averageRent).toBe("number");
      expect(["low", "medium", "high"]).toContain(destination.costOfLiving);
      expect(Array.isArray(destination.partnerUniversities)).toBe(true);
      expect(Array.isArray(destination.popularWith)).toBe(true);
    });
  });

  it("should have unique IDs for all destinations", () => {
    const ids = ERASMUS_DESTINATIONS.map((dest) => dest.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should filter destinations by cost level", () => {
    const lowCostDestinations = ERASMUS_DESTINATIONS.filter(
      (dest) => dest.costOfLiving === "low",
    );
    expect(lowCostDestinations.length).toBeGreaterThanOrEqual(0);

    lowCostDestinations.forEach((dest) => {
      expect(dest.costOfLiving).toBe("low");
    });
  });

  it("should filter destinations by country", () => {
    const germanDestinations = ERASMUS_DESTINATIONS.filter(
      (dest) => dest.country === "Germany",
    );

    germanDestinations.forEach((dest) => {
      expect(dest.country).toBe("Germany");
    });
  });
});
