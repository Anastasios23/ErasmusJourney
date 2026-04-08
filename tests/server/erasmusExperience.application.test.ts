import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockUserFindUnique,
  mockUserCreate,
  mockExperienceFindUnique,
  mockExperienceCreate,
  mockExperienceUpdate,
  mockTransaction,
  mockBuildBasicInfoPersistenceData,
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockUserCreate: vi.fn(),
  mockExperienceFindUnique: vi.fn(),
  mockExperienceCreate: vi.fn(),
  mockExperienceUpdate: vi.fn(),
  mockTransaction: vi.fn(),
  mockBuildBasicInfoPersistenceData: vi.fn(),
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    users: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate,
    },
    erasmusExperience: {
      findUnique: mockExperienceFindUnique,
      create: mockExperienceCreate,
      update: mockExperienceUpdate,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock("../../lib/databaseErrors", () => ({
  isDatabaseConnectionError: vi.fn(() => false),
}));

vi.mock("../../src/server/erasmusExperience/basicInfoPersistence", () => ({
  buildBasicInfoPersistenceData: mockBuildBasicInfoPersistenceData,
}));

vi.mock("../../src/server/erasmusExperience/persistence", () => ({
  persistSubmissionArtifacts: vi.fn(),
  refreshPublicDestinationReadModelIfNeeded: vi.fn(),
  triggerStatsRefresh: vi.fn(),
}));

import {
  createDraft,
  saveDraft,
  submitExperience,
} from "../../src/server/erasmusExperience";

function createExperience(overrides: Record<string, unknown> = {}) {
  return {
    id: "exp-1",
    userId: "user-1",
    currentStep: 1,
    completedSteps: "[]",
    isComplete: false,
    basicInfo: {},
    courses: [],
    accommodation: {},
    livingExpenses: {},
    experience: {},
    status: "DRAFT",
    isPublic: false,
    lastSavedAt: new Date("2026-01-01T00:00:00.000Z"),
    submittedAt: null,
    publishedAt: null,
    semester: null,
    hostCity: null,
    hostCountry: null,
    hostUniversityId: null,
    homeUniversityId: null,
    adminNotes: null,
    adminApproved: false,
    reviewedAt: null,
    reviewedBy: null,
    reviewFeedback: null,
    revisionCount: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("erasmusExperience application guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindUnique.mockResolvedValue({ id: "user-1" });
    mockBuildBasicInfoPersistenceData.mockResolvedValue(null);
    mockTransaction.mockImplementation(async (callback: any) => callback({}));
  });

  it("returns the existing experience unchanged instead of resetting it on createDraft", async () => {
    const existingExperience = createExperience({
      status: "SUBMITTED",
      isComplete: true,
    });

    mockExperienceFindUnique.mockResolvedValue(existingExperience);

    const result = await createDraft({
      id: "user-1",
      email: "student@example.com",
      name: "Student Example",
      image: null,
    });

    expect(result).toEqual({
      experience: existingExperience,
      created: false,
    });
    expect(mockExperienceUpdate).not.toHaveBeenCalled();
    expect(mockExperienceCreate).not.toHaveBeenCalled();
  });

  it("blocks draft saves once a submission is under review", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createExperience({
        status: "SUBMITTED",
        isComplete: true,
      }),
    );

    await expect(
      saveDraft(
        "exp-1",
        { id: "user-1", email: "student@example.com" },
        { basicInfo: { hostCity: "Amsterdam" } },
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      body: expect.objectContaining({
        error: "Submission locked",
        status: "SUBMITTED",
      }),
    });

    expect(mockExperienceUpdate).not.toHaveBeenCalled();
  });

  it("blocks resubmission once an experience is already approved", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createExperience({
        status: "APPROVED",
        isComplete: true,
      }),
    );

    await expect(
      submitExperience(
        "exp-1",
        { id: "user-1", email: "student@example.com" },
        {},
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      body: expect.objectContaining({
        error: "Submission locked",
        status: "APPROVED",
      }),
    });

    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
