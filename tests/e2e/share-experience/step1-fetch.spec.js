import { expect, test } from "@playwright/test";

import {
  chooseComboboxOption,
  createAgreement,
  createExperienceRecord,
  setupShareExperienceRoutes,
  waitForStableCount,
} from "./helpers.js";

test("step 1 loads departments and agreements once per dependency change without repeated GET storms", async ({
  page,
}) => {
  const state = await setupShareExperienceRoutes(page, {
    initialExperience: createExperienceRecord({
      currentStep: 1,
    }),
    departments: ["Computer Science", "Electrical Engineering"],
    agreements: [createAgreement()],
  });

  await page.goto("/share-experience?step=1");

  await expect(
    page.getByRole("heading", { name: "Basic Information", exact: true }),
  ).toBeVisible({ timeout: 20_000 });

  await chooseComboboxOption(
    page,
    page.locator("label", { hasText: "Home University" }).locator("..").locator("button").first(),
    "University of Nicosia (UNIC)",
  );
  await waitForStableCount(
    page,
    () => Promise.resolve(state.departmentRequests.length),
    1,
  );

  await chooseComboboxOption(
    page,
    page.locator("label", { hasText: "Home Department" }).locator("..").locator("button").first(),
    "Computer Science",
  );
  await chooseComboboxOption(
    page,
    page.locator("label", { hasText: "Level of Study" }).locator("..").locator("button").first(),
    "Bachelor",
  );
  await waitForStableCount(
    page,
    () => Promise.resolve(state.agreementRequests.length),
    1,
  );

  await chooseComboboxOption(
    page,
    page.locator("label", { hasText: "Host University" }).locator("..").locator("button").first(),
    "University of Amsterdam (Amsterdam, Netherlands)",
  );
  await page.locator("#exchangeAcademicYear").fill("2026/2027");
  await chooseComboboxOption(
    page,
    page.locator("label", { hasText: "Exchange Period" }).locator("..").locator("button").first(),
    "Fall",
  );

  await waitForStableCount(
    page,
    () => Promise.resolve(state.departmentRequests.length),
    1,
  );
  await waitForStableCount(
    page,
    () => Promise.resolve(state.agreementRequests.length),
    1,
  );
  await expect(state.mutations).toHaveLength(0);
});
