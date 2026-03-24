import { expect, test } from "@playwright/test";

import { createExperienceRecord, setupShareExperienceRoutes } from "./helpers.js";

const completeBasicInfo = {
  homeUniversity: "University of Nicosia (UNIC)",
  homeDepartment: "Computer Science",
  levelOfStudy: "Bachelor",
  hostUniversity: "University of Amsterdam",
  exchangeAcademicYear: "2026/2027",
  exchangePeriod: "Fall",
  hostCity: "Amsterdam",
  hostCountry: "Netherlands",
};

test("dashboard keeps locked steps non-clickable until previous steps are complete", async ({
  page,
}) => {
  await setupShareExperienceRoutes(page, {
    initialExperience: createExperienceRecord({
      currentStep: 1,
      completedSteps: [],
      basicInfo: {},
    }),
  });

  await page.goto("/dashboard");

  await expect(page.locator('a[href="/share-experience?step=2"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Locked" }).first()).toBeVisible();
});

test("dashboard course matching link opens step 2 only when step 1 is complete", async ({
  page,
}) => {
  const state = await setupShareExperienceRoutes(page, {
    initialExperience: createExperienceRecord({
      currentStep: 2,
      completedSteps: [1],
      basicInfo: completeBasicInfo,
    }),
  });

  await page.goto("/dashboard");

  const courseMatchingLink = page.locator('a[href="/share-experience?step=2"]').first();

  await expect(courseMatchingLink).toBeVisible();
  await courseMatchingLink.click();

  await expect(page).toHaveURL(/\/share-experience\?step=2$/);
  await expect(
    page.getByRole("heading", { name: "Course Matching" }).first(),
  ).toBeVisible();
  expect(state.departmentRequests).toHaveLength(0);
  expect(state.agreementRequests).toHaveLength(0);
});
