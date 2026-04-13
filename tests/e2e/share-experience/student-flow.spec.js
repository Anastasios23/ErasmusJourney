import { PrismaClient } from "@prisma/client";
import { expect, test } from "@playwright/test";

import { chooseComboboxOption, clickAction } from "./helpers.js";

const prisma = new PrismaClient();

const allowedStudent = {
  firstName: "Student",
  lastName: "Flow",
  email: "student.flow.allowed@unic.ac.cy",
  password: "StrongPass123!",
};

const blockedStudent = {
  firstName: "Blocked",
  lastName: "Student",
  email: "student.flow.blocked@example.com",
  password: "StrongPass123!",
};

const step1Data = {
  homeUniversity: "University of Nicosia",
  homeDepartment: "Architecture",
  bachelorOnlyHost: "University of Trieste (Trieste, Italy)",
  exchangeAcademicYear: "2026/2027",
  exchangePeriod: "Fall",
  exchangeStartDate: "2026-09-01",
  invalidExchangeEndDate: "2026-08-31",
  exchangeEndDate: "2027-01-31",
};

const courseMappingData = {
  homeCourseName: "Architectural Design Studio",
  homeECTS: "6",
  hostCourseName: "Advanced Urban Design",
  hostECTS: "6",
  recognitionType: "Full equivalence",
};

const accommodationData = {
  type: "Shared apartment",
  monthlyRent: "650",
  billsIncluded: "Yes",
  wouldRecommend: "Yes",
  ratingName: "Rate accommodation 4 stars",
  areaOrNeighborhood: "Near the city center",
};

const livingExpensesData = {
  food: "250",
  transport: "45",
  social: "180",
};

const experienceData = {
  ratingName: "Rate your Erasmus experience 5 stars",
  bestExperience:
    "Design workshops and exploring the old town with other Erasmus students.",
  generalTips:
    "Sort accommodation early, keep a realistic budget, and ask coordinators questions quickly.",
  revisedGeneralTips:
    "Sort accommodation early, keep a realistic budget, ask coordinators questions quickly, and keep copies of every approval.",
};

function getRegistrationButton(page) {
  return page.getByRole("button", { name: /create account/i });
}

function getLoginButton(page) {
  return page.getByRole("button", { name: /^sign in$/i });
}

function getContinueButton(page) {
  return page.getByRole("button", { name: /^continue$/i });
}

function getSubmitButton(page) {
  return page.getByRole("button", { name: /submit experience/i });
}

function getSaveDraftButton(page) {
  return page.getByRole("button", { name: /save draft/i });
}

function getLabeledCombobox(page, labelText) {
  return page
    .locator("label", { hasText: labelText })
    .locator("..")
    .locator("button")
    .first();
}

function parseCompletedSteps(experience) {
  if (!experience) {
    return [];
  }

  try {
    return JSON.parse(experience.completedSteps || "[]");
  } catch {
    return [];
  }
}

async function cleanupTestUsers() {
  await prisma.users.deleteMany({
    where: {
      email: {
        in: [allowedStudent.email, blockedStudent.email],
      },
    },
  });
}

async function getUserByEmail(email) {
  return prisma.users.findUnique({
    where: { email },
  });
}

async function getExperienceByEmail(email) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  return prisma.erasmusExperience.findUnique({
    where: { userId: user.id },
  });
}

async function getExperienceCountByEmail(email) {
  const user = await getUserByEmail(email);

  if (!user) {
    return 0;
  }

  return prisma.erasmusExperience.count({
    where: { userId: user.id },
  });
}

async function setExperienceStatus(email, data) {
  const experience = await getExperienceByEmail(email);

  if (!experience) {
    throw new Error(`No experience found for ${email}`);
  }

  return prisma.erasmusExperience.update({
    where: { id: experience.id },
    data,
  });
}

async function fillRegistrationForm(page, student) {
  await page.locator("#firstName").fill(student.firstName);
  await page.locator("#lastName").fill(student.lastName);
  await page.locator("#email").fill(student.email);
  await page.locator("#password").fill(student.password);
  await page.locator("#confirmPassword").fill(student.password);
  await page.getByRole("checkbox").click();
  await expect(getRegistrationButton(page)).toBeEnabled();
}

async function loginStudent(page, callbackPath = "/share-experience?step=1") {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  await page.getByLabel(/^email$/i).fill(allowedStudent.email);
  await page.getByLabel(/^password$/i).fill(allowedStudent.password);
  await clickAction(page, getLoginButton(page));
  await expect(page).toHaveURL(new RegExp(callbackPath.replace("?", "\\?")), {
    timeout: 30_000,
  });
}

function isMatchingErasmusExperienceResponse(response, method, action) {
  if (!response.url().includes("/api/erasmus-experiences")) {
    return false;
  }

  if (response.request().method() !== method) {
    return false;
  }

  if (!action) {
    return true;
  }

  try {
    return response.request().postDataJSON()?.action === action;
  } catch {
    return false;
  }
}

test.describe.serial("student flow", () => {
  test.setTimeout(120_000);

  test.beforeAll(async () => {
    await cleanupTestUsers();
  });

  test.afterAll(async () => {
    await cleanupTestUsers();
    await prisma.$disconnect();
  });

  test("student registration, login, redirects, and first draft creation use the real routes", async ({
    page,
  }) => {
    await page.context().clearCookies();

    await page.goto("/share-experience?step=1");
    await expect(page).toHaveURL(
      /\/login\?callbackUrl=%2Fshare-experience%3Fstep%3D1$/,
      { timeout: 20_000 },
    );

    await page.goto("/my-submissions");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fmy-submissions$/, {
      timeout: 20_000,
    });

    await page.goto("/register");
    await fillRegistrationForm(page, blockedStudent);

    const blockedRegistrationResponse = page.waitForResponse((response) =>
      response.url().includes("/api/auth/register"),
    );

    await clickAction(page, getRegistrationButton(page));

    expect((await blockedRegistrationResponse).status()).toBe(403);
    await expect(
      page.getByText(
        /Registration is restricted to Cyprus university students only/i,
      ),
    ).toBeVisible();
    await expect.poll(async () => Boolean(await getUserByEmail(blockedStudent.email))).toBe(false);

    await page.goto("/register");
    await fillRegistrationForm(page, allowedStudent);

    const allowedRegistrationResponse = page.waitForResponse((response) =>
      response.url().includes("/api/auth/register"),
    );

    await clickAction(page, getRegistrationButton(page));

    expect((await allowedRegistrationResponse).status()).toBe(201);
    await expect(
      page.getByRole("heading", { name: /verify your email/i }),
    ).toBeVisible();

    await expect.poll(async () => {
      const user = await getUserByEmail(allowedStudent.email);

      return user
        ? {
            email: user.email,
            hasPassword: Boolean(user.password),
          }
        : null;
    }).toEqual({
      email: allowedStudent.email,
      hasPassword: true,
    });

    const draftCreateResponse = page.waitForResponse((response) =>
      isMatchingErasmusExperienceResponse(response, "POST", "create"),
    );

    await loginStudent(page);

    expect((await draftCreateResponse).status()).toBe(201);
    await expect(
      page.getByRole("heading", { name: /share your erasmus experience/i }),
    ).toBeVisible();

    await expect.poll(async () => getExperienceCountByEmail(allowedStudent.email)).toBe(1);

    const createdDraft = await getExperienceByEmail(allowedStudent.email);
    expect(createdDraft).toMatchObject({
      status: "DRAFT",
      currentStep: 1,
      isComplete: false,
    });
    expect(parseCompletedSteps(createdDraft)).toEqual([]);

    await page.reload();
    await expect(page).toHaveURL(/\/share-experience\?step=1$/);
    await expect.poll(async () => getExperienceCountByEmail(allowedStudent.email)).toBe(1);
  });

  test("step 1 uses the real validation, draft save, and step access logic", async ({
    page,
  }) => {
    await loginStudent(page);

    await expect(page.getByText(step1Data.homeUniversity)).toBeVisible();
    await expect(
      page.getByText(/locked from your university email/i),
    ).toBeVisible();

    await clickAction(page, getContinueButton(page));

    await expect(
      page.getByText(/home department is required/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/level of study is required/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/host university is required/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/exchange academic year is required/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/exchange period is required/i).first(),
    ).toBeVisible();

    const homeDepartmentCombobox = getLabeledCombobox(page, "Home Department");
    const levelCombobox = getLabeledCombobox(page, "Level of Study");
    const hostUniversityCombobox = getLabeledCombobox(page, "Host University");

    await chooseComboboxOption(
      page,
      homeDepartmentCombobox,
      step1Data.homeDepartment,
    );
    await chooseComboboxOption(page, levelCombobox, "Bachelor");

    await hostUniversityCombobox.click();
    await expect(
      page.getByRole("option", { name: step1Data.bachelorOnlyHost }),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await chooseComboboxOption(page, levelCombobox, "Master");
    await expect(hostUniversityCombobox).toContainText(
      /select your host university/i,
    );

    await hostUniversityCombobox.click();
    await expect(
      page.getByRole("option", { name: step1Data.bachelorOnlyHost }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");

    await chooseComboboxOption(page, levelCombobox, "Bachelor");
    await chooseComboboxOption(
      page,
      hostUniversityCombobox,
      step1Data.bachelorOnlyHost,
    );
    await page.getByLabel(/exchange academic year/i).fill(
      step1Data.exchangeAcademicYear,
    );
    await chooseComboboxOption(
      page,
      getLabeledCombobox(page, "Exchange Period"),
      step1Data.exchangePeriod,
    );
    await page.getByLabel(/exchange start date/i).fill(
      step1Data.exchangeStartDate,
    );
    await page.getByLabel(/exchange end date/i).fill(
      step1Data.invalidExchangeEndDate,
    );

    await clickAction(page, getContinueButton(page));
    await expect(
      page.getByText(/end date must be after start date/i).first(),
    ).toBeVisible();

    await page.getByLabel(/exchange end date/i).fill(step1Data.exchangeEndDate);

    const draftBeforeSave = await getExperienceByEmail(allowedStudent.email);
    const draftBeforeSaveTimestamp = draftBeforeSave.lastSavedAt.getTime();

    await clickAction(page, getSaveDraftButton(page));

    await expect.poll(async () => {
      const experience = await getExperienceByEmail(allowedStudent.email);

      return experience
        ? experience.lastSavedAt.getTime() > draftBeforeSaveTimestamp
        : false;
    }).toBe(true);

    const savedDraft = await getExperienceByEmail(allowedStudent.email);
    expect(savedDraft).toMatchObject({
      currentStep: 1,
      basicInfo: expect.objectContaining({
        homeUniversity: step1Data.homeUniversity,
        homeDepartment: step1Data.homeDepartment,
        levelOfStudy: "Bachelor",
        hostUniversity: "University of Trieste",
        hostCity: "Trieste",
        hostCountry: "Italy",
        exchangeAcademicYear: step1Data.exchangeAcademicYear,
        exchangePeriod: step1Data.exchangePeriod,
      }),
    });
    expect(parseCompletedSteps(savedDraft)).toEqual([]);

    const step1SavedAt = savedDraft.lastSavedAt.getTime();

    await clickAction(page, getContinueButton(page));
    await expect(page).toHaveURL(/\/share-experience\?step=2$/, {
      timeout: 20_000,
    });

    await expect.poll(async () => {
      const experience = await getExperienceByEmail(allowedStudent.email);

      return experience
        ? {
            currentStep: experience.currentStep,
            completedSteps: parseCompletedSteps(experience),
            lastSavedAtAdvanced: experience.lastSavedAt.getTime() > step1SavedAt,
          }
        : null;
    }).toEqual({
      currentStep: 2,
      completedSteps: [1],
      lastSavedAtAdvanced: true,
    });

    await page.goto("/share-experience?step=5");
    await expect(page).toHaveURL(/\/share-experience\?step=2$/, {
      timeout: 20_000,
    });
  });

  test("student can validate, submit, and then gets locked until revision is requested", async ({
    page,
  }) => {
    await loginStudent(page, "/share-experience?step=2");

    await clickAction(page, getContinueButton(page));
    await expect(
      page.getByText(/add at least one course match to continue/i).first(),
    ).toBeVisible();

    await page.locator('input[id^="home-ects-"]').first().fill("0");
    await page.locator('input[id^="host-ects-"]').first().fill("0");

    await clickAction(page, getContinueButton(page));
    await expect(
      page.getByText(/home course name is required/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/host course name is required/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/home ects must be a number greater than 0/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/host ects must be a number greater than 0/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/recognition type is required/i).first(),
    ).toBeVisible();

    await page
      .locator('input[id^="home-name-"]')
      .first()
      .fill(courseMappingData.homeCourseName);
    await page
      .locator('input[id^="home-ects-"]')
      .first()
      .fill(courseMappingData.homeECTS);
    await page
      .locator('input[id^="host-name-"]')
      .first()
      .fill(courseMappingData.hostCourseName);
    await page
      .locator('input[id^="host-ects-"]')
      .first()
      .fill(courseMappingData.hostECTS);
    await chooseComboboxOption(
      page,
      page.locator('button[id^="recognition-type-"]').first(),
      courseMappingData.recognitionType,
    );

    await clickAction(page, getContinueButton(page));
    await expect(page).toHaveURL(/\/share-experience\?step=3$/, {
      timeout: 20_000,
    });

    await expect.poll(async () => {
      const experience = await getExperienceByEmail(allowedStudent.email);

      return experience
        ? {
            currentStep: experience.currentStep,
            completedSteps: parseCompletedSteps(experience),
          }
        : null;
    }).toEqual({
      currentStep: 3,
      completedSteps: [1, 2],
    });

    await clickAction(page, getContinueButton(page));
    await expect(
      page.getByText(/accommodation type is required/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/monthly rent is required/i).first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(/please specify whether bills are included/i)
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(/please say whether you would recommend it/i)
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText(/accommodation rating is required/i).first(),
    ).toBeVisible();

    await chooseComboboxOption(
      page,
      getLabeledCombobox(page, "Accommodation type"),
      accommodationData.type,
    );
    await page.locator("#monthlyRent").fill(accommodationData.monthlyRent);
    await chooseComboboxOption(
      page,
      getLabeledCombobox(page, "Bills included"),
      accommodationData.billsIncluded,
    );
    await chooseComboboxOption(
      page,
      getLabeledCombobox(page, "Would recommend?"),
      accommodationData.wouldRecommend,
    );
    await page
      .getByRole("button", { name: accommodationData.ratingName })
      .click();
    await page
      .locator("#areaOrNeighborhood")
      .fill(accommodationData.areaOrNeighborhood);

    await clickAction(page, getContinueButton(page));
    await expect(page).toHaveURL(/\/share-experience\?step=4$/, {
      timeout: 20_000,
    });

    await expect(page.locator("#rent")).toHaveValue(
      accommodationData.monthlyRent,
    );

    await clickAction(page, getContinueButton(page));
    await expect(
      page
        .locator("label", { hasText: "Food" })
        .locator("..")
        .getByText("Required"),
    ).toBeVisible();
    await expect(
      page
        .locator("label", { hasText: "Transport" })
        .locator("..")
        .getByText("Required"),
    ).toBeVisible();
    await expect(
      page
        .locator("label", { hasText: "Social" })
        .locator("..")
        .getByText("Required"),
    ).toBeVisible();

    await page.locator("#food").fill(livingExpensesData.food);
    await page.locator("#transport").fill(livingExpensesData.transport);
    await page.locator("#social").fill(livingExpensesData.social);

    await clickAction(page, getContinueButton(page));
    await expect(page).toHaveURL(/\/share-experience\?step=5$/, {
      timeout: 20_000,
    });

    await clickAction(page, getSubmitButton(page));
    await expect(
      page.getByText(/please rate your overall experience/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/^required$/i).first()).toBeVisible();

    await page
      .getByRole("button", { name: experienceData.ratingName })
      .click();
    await page.locator("#bestExperience").fill(experienceData.bestExperience);
    await page.locator("#generalTips").fill(experienceData.generalTips);

    const submitResponse = page.waitForResponse((response) =>
      isMatchingErasmusExperienceResponse(response, "PUT", "submit"),
    );

    await clickAction(page, getSubmitButton(page));

    expect((await submitResponse).status()).toBe(200);
    await expect(page).toHaveURL(
      /\/submission-confirmation\?submitted=true/,
      {
        timeout: 30_000,
      },
    );

    await expect.poll(async () => {
      const experience = await getExperienceByEmail(allowedStudent.email);

      return experience
        ? {
            status: experience.status,
            isComplete: experience.isComplete,
            submitted: Boolean(experience.submittedAt),
            currentStep: experience.currentStep,
            completedSteps: parseCompletedSteps(experience),
            rent:
              typeof experience.livingExpenses === "object" &&
              experience.livingExpenses
                ? experience.livingExpenses.rent
                : null,
            generalTips:
              typeof experience.experience === "object" && experience.experience
                ? experience.experience.generalTips
                : null,
          }
        : null;
    }).toEqual({
      status: "SUBMITTED",
      isComplete: true,
      submitted: true,
      currentStep: 5,
      completedSteps: [1, 2, 3, 4],
      rent: 650,
      generalTips: experienceData.generalTips,
    });

    await page.goto("/share-experience");
    await expect(
      page.getByText(/this submission is locked while it is under review/i),
    ).toBeVisible();

    await page.goto("/my-submissions");
    await expect(page.getByText(/my submissions/i).first()).toBeVisible();
    await expect(page.getByText(/under review/i).first()).toBeVisible();
    await expect(
      page.getByText(/experience at university of trieste/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue editing/i }),
    ).toHaveCount(0);
  });

  test("revision-needed submissions reopen on the same record and resubmit successfully", async ({
    page,
  }) => {
    const submittedExperience = await getExperienceByEmail(allowedStudent.email);
    const originalExperienceId = submittedExperience?.id;

    await setExperienceStatus(allowedStudent.email, {
      status: "REVISION_NEEDED",
      reviewFeedback:
        "Please add one clearer practical tip for future architecture students.",
      reviewedAt: new Date(),
      revisionCount: 1,
      isComplete: false,
      updatedAt: new Date(),
    });

    await loginStudent(page, "/my-submissions");

    await expect(page.getByText(/changes requested/i).first()).toBeVisible();
    await expect(
      page.getByText(/please add one clearer practical tip/i),
    ).toBeVisible();

    await clickAction(
      page,
      page.getByRole("button", { name: /respond to changes/i }),
    );

    await expect(page).toHaveURL(/\/share-experience(\?step=5)?$/, {
      timeout: 30_000,
    });
    await expect(getSubmitButton(page)).toBeVisible();
    await expect(
      page.getByText(/this submission is locked while it is under review/i),
    ).toHaveCount(0);

    await page.locator("#generalTips").fill(experienceData.revisedGeneralTips);

    const resubmitResponse = page.waitForResponse((response) =>
      isMatchingErasmusExperienceResponse(response, "PUT", "submit"),
    );

    await clickAction(page, getSubmitButton(page));

    expect((await resubmitResponse).status()).toBe(200);
    await expect(page).toHaveURL(
      /\/submission-confirmation\?submitted=true/,
      {
        timeout: 30_000,
      },
    );

    await expect.poll(async () => {
      const experience = await getExperienceByEmail(allowedStudent.email);

      return experience
        ? {
            id: experience.id,
            status: experience.status,
            isComplete: experience.isComplete,
            submitted: Boolean(experience.submittedAt),
            generalTips:
              typeof experience.experience === "object" && experience.experience
                ? experience.experience.generalTips
                : null,
          }
        : null;
    }).toEqual({
      id: originalExperienceId,
      status: "SUBMITTED",
      isComplete: true,
      submitted: true,
      generalTips: experienceData.revisedGeneralTips,
    });
  });
});
