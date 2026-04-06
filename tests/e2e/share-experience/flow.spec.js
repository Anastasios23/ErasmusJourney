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

test("share experience smoke flows from step 1 to submit without field-change autosaves", async ({
  page,
}) => {
  const state = await setupShareExperienceRoutes(page, {
    initialExperience: createExperienceRecord({ currentStep: 1 }),
  });

  await page.goto("/share-experience?step=1");

  await fillRequiredBasicInformation(page, state);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 0);

  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=2$/);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 1);

  await fillRequiredCourseMapping(page);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 1);

  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=3$/);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 2);

  await fillRequiredAccommodation(page);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 2);

  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=4$/);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 3);

  await fillRequiredLivingExpenses(page);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 3);

  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=5$/);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 4);

  await fillRequiredExperience(page);
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 4);

  await clickAction(
    page,
    page.getByRole("button", { name: /submit experience/i }),
  );

  await expect(page).toHaveURL(/\/submission-confirmation\?submitted=true/);
  await expect(
    page.getByRole("heading", { name: "Submission Successful!" }),
  ).toBeVisible();
  await expect(state.mutations).toHaveLength(5);
  await expect(state.mutations.at(-1)).toMatchObject({
    id: "smoke-experience",
    action: "submit",
    experience: expect.objectContaining({
      bestExperience: "Meeting people from across Europe.",
      generalTips:
        "Pack early, budget realistically, and ask questions quickly.",
    }),
  });
});
