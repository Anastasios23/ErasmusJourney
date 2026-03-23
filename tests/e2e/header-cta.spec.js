import { expect, test } from "@playwright/test";

const mockSession = {
  user: {
    name: "Smoke Test User",
    email: "student@example.com",
    image: null,
  },
  expires: "2099-01-01T00:00:00.000Z",
};

const mockExperience = [
  {
    id: "smoke-experience",
    currentStep: 1,
    completedSteps: "[]",
    basicInfo: {},
    courses: [],
    accommodation: {},
    livingExpenses: {},
    experience: {},
    status: "DRAFT",
    isComplete: false,
    lastSavedAt: null,
    submittedAt: null,
  },
];

test.beforeEach(async ({ page }) => {
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
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockExperience),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockExperience[0]),
    });
  });
});

test("homepage CTA opens the share experience form at step 1", async ({
  page,
}) => {
  await page.goto("/");

  const cta = page
    .getByRole("link", { name: /Start Journey|Continue:/ })
    .first();

  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "/share-experience?step=1");

  await cta.click();

  await expect(page).toHaveURL(/\/share-experience\?step=1$/);
  await expect(
    page.getByRole("heading", { name: "Share Your Experience" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Basic Information" }),
  ).toBeVisible();
  await expect(
    page.getByText("Your academic and exchange details", { exact: true }),
  ).toBeVisible();
});
