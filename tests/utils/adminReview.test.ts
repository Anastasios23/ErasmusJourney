import { describe, expect, it } from "vitest";

import {
  getApprovalReadiness,
  getSubmissionModerationSummary,
  getSubmissionQueueCategory,
} from "../../src/lib/adminReview";

describe("adminReview helpers", () => {
  it("blocks approval when core destination identity is incomplete", () => {
    const readiness = getApprovalReadiness({
      basicInfo: {
        homeUniversity: "University of Cyprus",
        hostUniversity: "University of Amsterdam",
      },
    });

    expect(readiness.status).toBe("blocked");
    expect(readiness.missingFields).toEqual(
      expect.arrayContaining([
        "Home department",
        "Host city",
        "Host country",
      ]),
    );
  });

  it("summarizes publishable sections by section completeness", () => {
    const summary = getSubmissionModerationSummary({
      basicInfo: {
        homeUniversity: "University of Cyprus",
        homeDepartment: "Computer Science",
        hostUniversity: "University of Amsterdam",
        hostCity: "Amsterdam",
        hostCountry: "Netherlands",
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
        currency: "EUR",
        wouldRecommend: true,
        accommodationRating: 4,
      },
      livingExpenses: {
        currency: "EUR",
        food: 250,
        transport: 45,
        social: 180,
      },
      experience: {
        generalTips: "Budget realistically and ask questions early.",
      },
    });

    expect(summary.publishableSections).toEqual([
      "Destination",
      "Accommodation",
      "Courses",
      "Budget",
    ]);
    expect(summary.courseSummary).toBe("1/1 complete mapping");
    expect(summary.accommodationSummary).toContain("Shared apartment");
    expect(summary.budgetSummary).toContain("Food 250 EUR");
  });

  it("classifies revised submissions separately from ready and blocked queues", () => {
    expect(
      getSubmissionQueueCategory({
        revisionCount: 1,
        basicInfo: {
          homeUniversity: "University of Cyprus",
          homeDepartment: "Computer Science",
          hostUniversity: "University of Amsterdam",
          hostCity: "Amsterdam",
          hostCountry: "Netherlands",
        },
      }),
    ).toBe("needs_revision");
  });

  it("blocks approval readiness when the minimum public contract is incomplete", () => {
    const readiness = getApprovalReadiness({
      basicInfo: {
        homeUniversity: "University of Cyprus",
        homeDepartment: "Computer Science",
        hostUniversity: "University of Amsterdam",
        hostCity: "Amsterdam",
        hostCountry: "Netherlands",
      },
      publicImpactPreviewUnavailableReason: {
        code: "INCOMPLETE_MINIMUM_PUBLIC_CONTRACT",
        message:
          "Cannot preview or publish this submission until the minimum public contract is complete: destination identity, accommodation reality, living costs, and at least one complete course-equivalence example.",
        missingFields: [
          "accommodationType",
          "monthlyRent",
          "wouldRecommend",
          "accommodationRating",
          "food",
          "transport",
          "social",
          "courseMappings",
        ],
      },
    });

    expect(readiness.status).toBe("blocked");
    expect(readiness.description).toBe(
      "Complete the minimum public contract before approving this submission.",
    );
    expect(readiness.missingFields).toEqual([
      "Accommodation type",
      "Monthly rent",
      "Would recommend",
      "Accommodation rating",
      "Food",
      "Transport",
      "Social",
      "At least 1 complete course mapping",
    ]);
  });
});
