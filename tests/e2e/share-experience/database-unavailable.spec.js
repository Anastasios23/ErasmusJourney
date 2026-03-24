import { expect, test } from "@playwright/test";

import {
  clickAction,
  createExperienceRecord,
  setupShareExperienceRoutes,
  waitForStableCount,
} from "./helpers.js";

const databaseUnavailableMessage =
  "Unable to connect to the database. Please try again when the connection is restored.";

test("database unavailable on load shows friendly retry UI and recovers without a saved state", async ({
  page,
}) => {
  let getAttempts = 0;

  await setupShareExperienceRoutes(page, {
    initialExperience: createExperienceRecord({ currentStep: 1 }),
    experienceGetHandler: async ({ route, state }) => {
      getAttempts += 1;

      if (getAttempts === 1) {
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: "Database unavailable",
            details: databaseUnavailableMessage,
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([state.experienceRecord]),
      });
    },
  });

  await page.goto("/share-experience?step=1");

  await expect(page.getByText(databaseUnavailableMessage)).toBeVisible({
    timeout: 20_000,
  });
  await expect(
    page.getByRole("button", { name: /retry connection/i }),
  ).toBeVisible();
  await expect(page.getByText(/^Saved$/)).toHaveCount(0);
  await expect(page.getByText(/Last saved:/)).toHaveCount(0);

  await clickAction(
    page,
    page.getByRole("button", { name: /retry connection/i }),
  );

  await expect(
    page.getByRole("heading", { name: "Basic Information", exact: true }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(databaseUnavailableMessage)).toHaveCount(0);
  await expect(page.getByText(/^Saved$/)).toHaveCount(0);
  await expect(page.getByText(/Last saved:/)).toHaveCount(0);
  await expect(getAttempts).toBe(2);
});

test("database unavailable on save draft does not show a misleading saved state", async ({
  page,
}) => {
  const state = await setupShareExperienceRoutes(page, {
    initialExperience: createExperienceRecord({
      currentStep: 1,
    }),
    experienceMutationHandler: async ({ route }) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Database unavailable",
          details: databaseUnavailableMessage,
        }),
      });
    },
  });

  await page.goto("/share-experience?step=1");
  await expect(
    page.getByRole("heading", { name: "Basic Information", exact: true }),
  ).toBeVisible();
  await page.locator("#exchangeAcademicYear").fill("2026/2027");
  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 0);

  await clickAction(page, page.getByRole("button", { name: /save draft/i }));

  await waitForStableCount(page, () => Promise.resolve(state.mutations.length), 1);
  await expect(page.getByText(databaseUnavailableMessage)).toBeVisible();
  await expect(page.getByText(/^Saved$/)).toHaveCount(0);
  await expect(page.getByText(/Last saved:/)).toHaveCount(0);
});
