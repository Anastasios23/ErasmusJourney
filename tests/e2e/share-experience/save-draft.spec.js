import { expect, test } from "@playwright/test";

import {
  clickAction,
  createExperienceRecord,
  fillRequiredAccommodation,
  fillRequiredBasicInformation,
  fillRequiredCourseMapping,
  fillRequiredExperience,
  fillRequiredLivingExpenses,
  setupShareExperienceRoutes,
  waitForStableCount,
} from "./helpers.js";

test("save draft sends one write for one click on every step", async ({
  page,
}) => {
  const state = await setupShareExperienceRoutes(page, {
    initialExperience: createExperienceRecord({ currentStep: 1 }),
  });

  await page.goto("/share-experience?step=1");

  await fillRequiredBasicInformation(page, state);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 0);

  await clickAction(page, page.getByRole("button", { name: /save draft/i }));

  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 1);
  await expect(state.mutations[0]).toMatchObject({
    basicInfo: expect.objectContaining({
      homeUniversity: "University of Nicosia",
      homeDepartment: "Computer Science",
      levelOfStudy: "Bachelor",
      exchangeAcademicYear: "2026/2027",
    }),
  });

  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=2$/);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 2);

  await fillRequiredCourseMapping(page);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 2);

  await clickAction(page, page.getByRole("button", { name: /save draft/i }));

  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 3);
  await expect(state.mutations[2]).toMatchObject({
    courses: [
      expect.objectContaining({
        homeCourseName: "Algorithms",
        hostCourseName: "Advanced Algorithms",
      }),
    ],
  });

  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=3$/);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 4);

  await fillRequiredAccommodation(page);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 4);

  await clickAction(page, page.getByRole("button", { name: /save draft/i }));

  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 5);
  await expect(state.mutations[4]).toMatchObject({
    accommodation: expect.objectContaining({
      areaOrNeighborhood: "Near campus",
      monthlyRent: 450,
    }),
  });

  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=4$/);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 6);

  await fillRequiredLivingExpenses(page);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 6);

  await clickAction(page, page.getByRole("button", { name: /save draft/i }));

  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 7);
  await expect(state.mutations[6]).toMatchObject({
    livingExpenses: expect.objectContaining({
      food: 250,
      transport: 45,
      social: 180,
    }),
  });

  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=5$/);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 8);

  await fillRequiredExperience(page);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 8);

  await clickAction(page, page.getByRole("button", { name: /save draft/i }));

  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 9);
  await expect(state.mutations[8]).toMatchObject({
    experience: expect.objectContaining({
      bestExperience: "Meeting people from across Europe.",
      generalTips:
        "Pack early, budget realistically, and ask questions quickly.",
    }),
  });
});
