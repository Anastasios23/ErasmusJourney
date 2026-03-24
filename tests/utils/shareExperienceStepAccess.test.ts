import { describe, expect, it } from "vitest";

import {
  canAccessShareExperienceStep,
  clampShareExperienceStep,
  getNextAccessibleShareExperienceStep,
} from "../../src/lib/shareExperienceStepAccess";

const completeBasicInfo = {
  homeUniversity: "University of Nicosia (UNIC)",
  homeDepartment: "Computer Science",
  levelOfStudy: "Bachelor",
  hostUniversity: "University of Amsterdam",
  exchangeAcademicYear: "2026/2027",
  exchangePeriod: "Fall",
};

const completeCourseMappings = [
  {
    id: "course-1",
    homeCourseName: "Algorithms",
    homeECTS: 6,
    hostCourseName: "Advanced Algorithms",
    hostECTS: 6,
    recognitionType: "full_equivalence",
  },
];

const completeAccommodation = {
  accommodationType: "shared_apartment",
  monthlyRent: 450,
  billsIncluded: "yes",
  accommodationRating: 4,
  wouldRecommend: true,
};

const completeLivingExpenses = {
  currency: "EUR",
  food: 250,
  transport: 45,
  social: 180,
};

describe("shareExperienceStepAccess", () => {
  it("returns step 1 when basic information is incomplete", () => {
    expect(getNextAccessibleShareExperienceStep({ basicInfo: {} })).toBe(1);
    expect(clampShareExperienceStep(4, { basicInfo: {} })).toBe(1);
    expect(canAccessShareExperienceStep(2, { basicInfo: {} })).toBe(false);
  });

  it("returns step 2 when only basic information is complete", () => {
    const data = {
      basicInfo: completeBasicInfo,
      courses: [],
    };

    expect(getNextAccessibleShareExperienceStep(data)).toBe(2);
    expect(clampShareExperienceStep(5, data)).toBe(2);
    expect(canAccessShareExperienceStep(2, data)).toBe(true);
  });

  it("returns step 5 when all previous steps are complete", () => {
    const data = {
      basicInfo: completeBasicInfo,
      courses: completeCourseMappings,
      accommodation: completeAccommodation,
      livingExpenses: completeLivingExpenses,
    };

    expect(getNextAccessibleShareExperienceStep(data)).toBe(5);
    expect(clampShareExperienceStep(5, data)).toBe(5);
    expect(canAccessShareExperienceStep(4, data)).toBe(true);
  });
});
