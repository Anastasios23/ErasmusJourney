import { expect, test } from "@playwright/test";

import {
  clickAction,
  createExperienceRecord,
  fillRequiredAccommodation,
  fillRequiredBasicInformation,
  fillRequiredCourseMapping,
  fillRequiredLivingExpenses,
  setupShareExperienceRoutes,
  waitForStableCount,
} from "./helpers.js";

test("step 5 photo picker opens and uploads a selected image", async ({
  page,
}) => {
  const state = await setupShareExperienceRoutes(page, {
    initialExperience: createExperienceRecord({ currentStep: 1 }),
  });

  await page.goto("/share-experience?step=1");

  await fillRequiredBasicInformation(page, state);
  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await fillRequiredCourseMapping(page);
  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await fillRequiredAccommodation(page);
  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  await fillRequiredLivingExpenses(page);
  await clickAction(
    page,
    page.getByRole("button", { name: /^continue$/i }),
  );

  const pickerTrigger = page.getByRole("button", { name: "Select photos" });
  await expect(pickerTrigger).toBeVisible({ timeout: 20_000 });

  await page.locator('input[type="file"]').evaluate((input) => {
    window.__photoInputClickCount = 0;
    input.click = () => {
      window.__photoInputClickCount += 1;
    };
  });

  await pickerTrigger.click();

  await expect
    .poll(() => page.evaluate(() => window.__photoInputClickCount ?? 0))
    .toBe(1);

  await page.locator('input[type="file"]').setInputFiles({
    name: "erasmus.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake-image"),
  });

  await waitForStableCount(
    page,
    () => Promise.resolve(state.uploadRequests.length),
    1,
  );

  await expect(page.getByText("1 of 5 photos uploaded")).toBeVisible();
  await expect(page.getByAltText("Upload 1")).toBeVisible();
});
