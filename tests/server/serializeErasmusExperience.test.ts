import { describe, expect, it } from "vitest";

import { serializeErasmusExperienceForClient } from "../../src/server/serializeErasmusExperience";

describe("serializeErasmusExperienceForClient", () => {
  it("preserves course arrays while sanitizing the rest of the experience", () => {
    const serialized = serializeErasmusExperienceForClient({
      id: "experience-1",
      basicInfo: {
        homeUniversity: "University of Nicosia (UNIC)",
        homeDepartment: "Computer Science",
        levelOfStudy: "Bachelor",
        hostUniversity: "University of Amsterdam",
        exchangeAcademicYear: "2026/2027",
        exchangePeriod: "Fall",
      },
      courses: [
        {
          id: "course-1",
          homeCourseName: "Algorithms",
          homeECTS: 6,
          hostCourseName: "Advanced Algorithms",
          hostECTS: 6,
          recognitionType: "full_equivalence",
        },
      ],
      accommodation: {
        accommodationType: "shared_apartment",
        monthlyRent: 450,
        billsIncluded: "yes",
        accommodationRating: 4,
        wouldRecommend: true,
      },
      livingExpenses: {
        food: 250,
        transport: 45,
        social: 180,
      },
      experience: {
        overallRating: 5,
        bestExperience: "Meeting people.",
        generalTips: "Ask questions early.",
      },
    });

    expect(serialized.courses).toHaveLength(1);
    expect(serialized.courses[0]).toMatchObject({
      homeCourseName: "Algorithms",
      hostCourseName: "Advanced Algorithms",
      recognitionType: "full_equivalence",
    });
    expect(serialized.basicInfo.homeUniversity).toBe(
      "University of Nicosia (UNIC)",
    );
    expect(serialized.accommodation.accommodationType).toBe(
      "shared_apartment",
    );
    expect(serialized.livingExpenses.food).toBe(250);
  });

  it("drops non-whitelisted fields from the serialized response", () => {
    const serialized = serializeErasmusExperienceForClient({
      id: "experience-2",
      status: "DRAFT",
      basicInfo: {},
      courses: [],
      accommodation: {},
      livingExpenses: {},
      experience: {},
      internalAuditFlag: true,
      ipAddress: "127.0.0.1",
    });

    expect(serialized).toMatchObject({
      id: "experience-2",
      status: "DRAFT",
    });
    expect(serialized).not.toHaveProperty("internalAuditFlag");
    expect(serialized).not.toHaveProperty("ipAddress");
  });

  it("should not expose userId in output", () => {
    const result = serializeErasmusExperienceForClient({ userId: "secret-id" });
    expect(result).not.toHaveProperty("userId");
  });

  it("should not expose userEmail in output", () => {
    const result = serializeErasmusExperienceForClient({
      userEmail: "user@example.com",
    });
    expect(result).not.toHaveProperty("userEmail");
  });

  it("should not expose reviewedBy in output", () => {
    const result = serializeErasmusExperienceForClient({
      reviewedBy: "admin-id",
    });
    expect(result).not.toHaveProperty("reviewedBy");
  });

  it("should not expose reviewedAt in output", () => {
    const result = serializeErasmusExperienceForClient({
      reviewedAt: new Date(),
    });
    expect(result).not.toHaveProperty("reviewedAt");
  });

  it("should omit reviewFeedback when status is not changes_requested", () => {
    const result = serializeErasmusExperienceForClient({
      status: "pending",
      reviewFeedback: "Some feedback",
    });
    expect(result.reviewFeedback).toBeUndefined();
  });

  it("should include reviewFeedback when status is changes_requested", () => {
    const result = serializeErasmusExperienceForClient({
      status: "changes_requested",
      reviewFeedback: "Please fix section 2.",
    });
    expect(result.reviewFeedback).toBe("Please fix section 2.");
  });
});
