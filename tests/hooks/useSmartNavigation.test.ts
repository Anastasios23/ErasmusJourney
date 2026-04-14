import { describe, expect, it } from "vitest";

import { buildSmartNavigation } from "../../src/hooks/useSmartNavigation";

describe("buildSmartNavigation", () => {
  it("does not recommend a continue CTA when no canonical experience exists", () => {
    const { analytics } = buildSmartNavigation({
      pathname: "/destinations",
      step: undefined,
      progress: {
        hasExperience: false,
        currentStep: 1,
        isComplete: false,
        completedSteps: {
          basicInfo: false,
          courses: false,
          accommodation: false,
          livingExpenses: false,
          experience: false,
        },
      },
    });

    expect(analytics.nextStep).toBeUndefined();
    expect(analytics.completedSteps).toBe(0);
    expect(analytics.isComplete).toBe(false);
  });

  it("recommends the current canonical draft step when an experience exists", () => {
    const { analytics, steps } = buildSmartNavigation({
      pathname: "/dashboard",
      step: undefined,
      progress: {
        hasExperience: true,
        currentStep: 3,
        isComplete: false,
        completedSteps: {
          basicInfo: true,
          courses: true,
          accommodation: false,
          livingExpenses: false,
          experience: false,
        },
      },
    });

    expect(analytics.nextStep).toMatchObject({
      id: "accommodation",
      name: "Accommodation",
      href: "/share-experience?step=3",
    });
    expect(analytics.completedSteps).toBe(2);
    expect(steps.find((step) => step.id === "accommodation")?.nextRecommended).toBe(
      true,
    );
  });

  it("treats terminal canonical submissions as complete with no next step", () => {
    const { analytics, steps } = buildSmartNavigation({
      pathname: "/my-submissions",
      step: undefined,
      progress: {
        hasExperience: true,
        currentStep: 5,
        isComplete: true,
        completedSteps: {
          basicInfo: false,
          courses: false,
          accommodation: false,
          livingExpenses: false,
          experience: false,
        },
      },
    });

    expect(analytics.nextStep).toBeUndefined();
    expect(analytics.completedSteps).toBe(5);
    expect(analytics.progressPercentage).toBe(100);
    expect(analytics.isComplete).toBe(true);
    expect(steps.every((step) => step.completed)).toBe(true);
  });
});
