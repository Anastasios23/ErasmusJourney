import { expect } from "@playwright/test";

const INITIAL_PAGE_TIMEOUT = 20_000;

export const mockSession = {
  user: {
    id: "smoke-user",
    name: "Smoke Test User",
    email: "student@example.com",
    image: null,
    createdAt: "2020-01-01T00:00:00.000Z",
  },
  expires: "2099-01-01T00:00:00.000Z",
};

export function createExperienceRecord(overrides = {}) {
  const completedSteps =
    overrides.completedSteps === undefined ? [] : overrides.completedSteps;

  return {
    id: "smoke-experience",
    currentStep: 1,
    completedSteps:
      typeof completedSteps === "string"
        ? completedSteps
        : JSON.stringify(completedSteps),
    basicInfo: {},
    courses: [],
    accommodation: {},
    livingExpenses: {},
    experience: {},
    status: "DRAFT",
    isComplete: false,
    hasSubmitted: false,
    lastSavedAt: null,
    submittedAt: null,
    ...overrides,
  };
}

export function createAgreement({
  id = "host-1",
  name = "University of Amsterdam",
  city = "Amsterdam",
  country = "Netherlands",
} = {}) {
  return {
    partnerUniversity: {
      id,
      name,
      city,
      country,
    },
  };
}

function getRequestPayload(request) {
  try {
    return request.postDataJSON() ?? {};
  } catch {
    try {
      return JSON.parse(request.postData() || "{}");
    } catch {
      return {};
    }
  }
}

export async function setupShareExperienceRoutes(page, options = {}) {
  const {
    session = mockSession,
    initialExperience = createExperienceRecord(),
    departments = ["Computer Science", "Electrical Engineering"],
    agreements = [createAgreement()],
    experienceGetHandler,
    experienceMutationHandler,
    departmentsHandler,
    agreementsHandler,
  } = options;

  const state = {
    mutations: [],
    departmentRequests: [],
    agreementRequests: [],
    experienceGetRequests: [],
    uploadRequests: [],
    experienceRecord: structuredClone(initialExperience),
  };

  await page.route("**/api/auth/session*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(session),
    });
  });

  await page.route("**/api/universities/*/departments*", async (route) => {
    state.departmentRequests.push(route.request().url());

    if (departmentsHandler) {
      await departmentsHandler({ route, state });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ departments }),
    });
  });

  await page.route("**/api/agreements*", async (route) => {
    state.agreementRequests.push(route.request().url());

    if (agreementsHandler) {
      await agreementsHandler({ route, state });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ agreements }),
    });
  });

  await page.route("**/api/erasmus-experiences*", async (route) => {
    const request = route.request();
    const method = request.method();

    if (method === "GET") {
      state.experienceGetRequests.push(request.url());

      if (experienceGetHandler) {
        await experienceGetHandler({ route, state });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([state.experienceRecord]),
      });
      return;
    }

    const payload = getRequestPayload(request);
    state.mutations.push(payload);

    if (experienceMutationHandler) {
      await experienceMutationHandler({ route, payload, state });
      return;
    }

    const completedSteps = Array.isArray(payload.completedSteps)
      ? JSON.stringify(payload.completedSteps)
      : state.experienceRecord.completedSteps;

    state.experienceRecord = {
      ...state.experienceRecord,
      ...payload,
      completedSteps,
      currentStep: payload.currentStep ?? state.experienceRecord.currentStep,
      status:
        payload.action === "submit"
          ? "SUBMITTED"
          : state.experienceRecord.status,
      isComplete:
        payload.action === "submit" ? true : state.experienceRecord.isComplete,
      submittedAt:
        payload.action === "submit"
          ? "2026-03-24T12:00:00.000Z"
          : state.experienceRecord.submittedAt,
      lastSavedAt: "2026-03-24T12:00:00.000Z",
    };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(state.experienceRecord),
    });
  });

  await page.route("**/api/upload*", async (route) => {
    state.uploadRequests.push(route.request().url());

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        url: `/uploads/${session.user.id}/smoke-upload.png`,
      }),
    });
  });

  return state;
}

export async function waitForStableCount(page, getCount, expectedCount) {
  await expect.poll(getCount).toBe(expectedCount);
  await page.waitForTimeout(300);
  expect(await getCount()).toBe(expectedCount);
}

export async function chooseComboboxOption(page, combobox, optionLabel) {
  await page.waitForTimeout(250);
  await combobox.click();
  await page.getByRole("option", { name: optionLabel }).click();
  await expect(combobox).toContainText(optionLabel);
}

export async function clickAction(page, locator) {
  await page.waitForTimeout(250);
  await locator.click();
}

export async function fillRequiredBasicInformation(page, state) {
  await expect(page.locator("#exchangeAcademicYear")).toBeVisible({
    timeout: INITIAL_PAGE_TIMEOUT,
  });

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
  await expect(
    page.getByText("City: Amsterdam | Country: Netherlands"),
  ).toBeVisible();
}

export async function fillRequiredCourseMapping(page) {
  await expect
    .poll(async () => page.locator('input[id^="home-name-"]').count(), {
      timeout: 30_000,
    })
    .toBeGreaterThan(0);

  await page.locator('input[id^="home-name-"]').first().fill("Algorithms");
  await page.locator('input[id^="home-ects-"]').first().fill("6");
  await page.locator('input[id^="host-name-"]').first().fill("Advanced Algorithms");
  await page.locator('input[id^="host-ects-"]').first().fill("6");
  await chooseComboboxOption(
    page,
    page.locator('button[id^="recognition-type-"]').first(),
    "Full equivalence",
  );
}

export async function fillRequiredAccommodation(page) {
  await expect(page.locator("#monthlyRent")).toBeVisible({
    timeout: INITIAL_PAGE_TIMEOUT,
  });
  const accommodationComboboxes = page.locator("main [role='combobox']");

  await chooseComboboxOption(page, accommodationComboboxes.nth(0), "Shared apartment");
  await page.locator("#monthlyRent").fill("450");
  await chooseComboboxOption(page, accommodationComboboxes.nth(2), "Yes");
  await chooseComboboxOption(page, accommodationComboboxes.nth(3), "Yes");
  await page.locator("#areaOrNeighborhood").fill("Near campus");
  await page
    .getByRole("button", { name: "Rate accommodation 4 stars" })
    .click();
}

export async function fillRequiredLivingExpenses(page) {
  await expect(page.locator("#food")).toBeVisible({
    timeout: INITIAL_PAGE_TIMEOUT,
  });
  await page.locator("#food").fill("250");
  await page.locator("#transport").fill("45");
  await page.locator("#social").fill("180");
}

export async function fillRequiredExperience(page) {
  await expect(page.locator("#generalTips")).toBeVisible({
    timeout: INITIAL_PAGE_TIMEOUT,
  });
  await page
    .getByRole("button", {
      name: "Rate your Erasmus experience 5 stars",
    })
    .click();
  await page
    .locator("#bestExperience")
    .fill("Meeting people from across Europe.");
  await page
    .locator("#generalTips")
    .fill("Pack early, budget realistically, and ask questions quickly.");
}
