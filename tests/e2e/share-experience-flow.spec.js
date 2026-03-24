import { expect, test } from "@playwright/test";

const mockSession = {
  user: {
    id: "smoke-user",
    name: "Smoke Test User",
    email: "student@example.com",
    image: null,
  },
  expires: "2099-01-01T00:00:00.000Z",
};

const baseExperience = {
  id: "smoke-experience",
  currentStep: 2,
  completedSteps: "[1]",
  basicInfo: {
    homeUniversity: "University of Cyprus",
    homeDepartment: "Computer Science",
    studyLevel: "bachelor",
    exchangeAcademicYear: "2025/2026",
  },
  courses: [],
  accommodation: {},
  livingExpenses: {},
  experience: {},
  status: "DRAFT",
  isComplete: false,
  hasSubmitted: false,
  lastSavedAt: null,
  submittedAt: null,
};

async function waitForStableMutationCount(page, mutations, expectedCount) {
  await expect.poll(() => mutations.length).toBe(expectedCount);
  await page.waitForTimeout(300);
  expect(mutations).toHaveLength(expectedCount);
}

async function chooseComboboxOption(page, combobox, optionLabel) {
  await page.waitForTimeout(250);
  await combobox.click({ force: true });
  await page.getByRole("option", { name: optionLabel }).click({ force: true });
  await expect(combobox).toContainText(optionLabel);
}

async function clickAction(page, locator) {
  await page.waitForTimeout(250);
  await locator.click({ force: true });
}

test("share experience smoke flows from step 2 to step 5 without field-change autosaves", async ({
  page,
}) => {
  let experienceRecord = structuredClone(baseExperience);
  const mutations = [];

  await page.route("**/api/auth/session*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockSession),
    });
  });

  await page.route("**/api/forms/get*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ submissions: [] }),
    });
  });

  await page.route("**/api/erasmus-experiences*", async (route) => {
    const request = route.request();
    const method = request.method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([experienceRecord]),
      });
      return;
    }

    const payload = request.postDataJSON() ?? {};
    mutations.push(payload);

    const completedSteps = Array.isArray(payload.completedSteps)
      ? JSON.stringify(payload.completedSteps)
      : experienceRecord.completedSteps;

    experienceRecord = {
      ...experienceRecord,
      ...payload,
      completedSteps,
      currentStep: payload.currentStep ?? experienceRecord.currentStep,
      status:
        payload.action === "submit" ? "SUBMITTED" : experienceRecord.status,
      isComplete:
        payload.action === "submit" ? true : experienceRecord.isComplete,
      submittedAt:
        payload.action === "submit"
          ? "2026-03-24T12:00:00.000Z"
          : experienceRecord.submittedAt,
      lastSavedAt: "2026-03-24T12:00:00.000Z",
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(experienceRecord),
    });
  });

  await page.goto("/share-experience?step=2");

  await expect(
    page.getByRole("heading", { name: "Course Matching", exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => page.locator("main input").count(), {
      timeout: 15_000,
    })
    .toBeGreaterThan(0);

  const step2Inputs = page.locator("main input");
  await step2Inputs.nth(1).fill("Algorithms");
  await step2Inputs.nth(2).fill("6");
  await step2Inputs.nth(4).fill("Advanced Algorithms");
  await step2Inputs.nth(5).fill("6");
  await chooseComboboxOption(
    page,
    page.locator('button[id^="recognition-type-"]').first(),
    "Full equivalence",
  );

  await waitForStableMutationCount(page, mutations, 0);

  await clickAction(
    page,
    page.getByRole("button", { name: /continue to accommodation/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=3$/);
  await expect(
    page.getByRole("heading", { name: "Accommodation", exact: true }),
  ).toBeVisible();
  await waitForStableMutationCount(page, mutations, 1);

  const step3Comboboxes = page.getByRole("combobox");
  await chooseComboboxOption(
    page,
    step3Comboboxes.nth(0),
    "Shared apartment",
  );
  await page.locator("#monthlyRent").fill("450");
  await chooseComboboxOption(page, step3Comboboxes.nth(2), "Yes");
  await chooseComboboxOption(page, step3Comboboxes.nth(3), "Yes");
  await page.locator("#areaOrNeighborhood").fill("Near campus");
  await page
    .getByText("Accommodation Rating *")
    .locator("..")
    .getByRole("button")
    .nth(3)
    .click();

  await waitForStableMutationCount(page, mutations, 1);

  await clickAction(
    page,
    page.getByRole("button", { name: /continue to living expenses/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=4$/);
  await expect(
    page.getByRole("heading", { name: "Living Expenses", exact: true }),
  ).toBeVisible();
  await waitForStableMutationCount(page, mutations, 2);

  await page.locator("#food").fill("250");
  await page.locator("#transport").fill("45");
  await page.locator("#social").fill("180");

  await waitForStableMutationCount(page, mutations, 2);

  await clickAction(
    page,
    page.getByRole("button", { name: /continue to experience/i }),
  );

  await expect(page).toHaveURL(/\/share-experience\?step=5$/);
  await expect(
    page.getByRole("heading", { name: "Share Experience", exact: true }),
  ).toBeVisible();
  await waitForStableMutationCount(page, mutations, 3);

  await page
    .getByText("How would you rate your Erasmus experience overall? *")
    .locator("..")
    .getByRole("button")
    .nth(4)
    .click();
  await page
    .locator("#best")
    .fill("Meeting people from across Europe.");
  await page
    .locator("#tips")
    .fill("Pack early, budget realistically, and ask questions quickly.");

  await waitForStableMutationCount(page, mutations, 3);

  await clickAction(
    page,
    page.getByRole("button", { name: /submit experience/i }),
  );

  await expect(page).toHaveURL(/\/submission-confirmation\?submitted=true/);
  await expect(
    page.getByRole("heading", { name: "Submission Successful!" }),
  ).toBeVisible();
  await expect(mutations).toHaveLength(4);
  await expect(mutations.at(-1)).toMatchObject({
    id: "smoke-experience",
    action: "submit",
    experience: expect.objectContaining({
      bestExperience: "Meeting people from across Europe.",
      generalTips:
        "Pack early, budget realistically, and ask questions quickly.",
    }),
  });
});
