import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFetch,
  mockGetServerSession,
  mockUserFindUnique,
  mockExperienceFindUnique,
  mockExperienceFindMany,
  mockExperienceUpdate,
  mockReviewActionCreate,
  mockTransaction,
  mockPreviewBuilder,
  mockPreviewUnavailableReason,
  mockRefreshPublicDestinationReadModel,
  mockRevalidatePublicDestinationPages,
} = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockGetServerSession: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockExperienceFindUnique: vi.fn(),
  mockExperienceFindMany: vi.fn(),
  mockExperienceUpdate: vi.fn(),
  mockReviewActionCreate: vi.fn(),
  mockTransaction: vi.fn(),
  mockPreviewBuilder: vi.fn(),
  mockPreviewUnavailableReason: vi.fn(),
  mockRefreshPublicDestinationReadModel: vi.fn(),
  mockRevalidatePublicDestinationPages: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    users: {
      findUnique: mockUserFindUnique,
    },
    erasmusExperience: {
      findUnique: mockExperienceFindUnique,
      findMany: mockExperienceFindMany,
      update: mockExperienceUpdate,
    },
    reviewAction: {
      create: mockReviewActionCreate,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock("../../src/server/publicDestinations", () => ({
  getAdminPublicImpactPreviewByExperienceId: mockPreviewBuilder,
  getAdminPublicImpactPreviewUnavailableReasonByExperienceId:
    mockPreviewUnavailableReason,
  refreshPublicDestinationReadModel: mockRefreshPublicDestinationReadModel,
}));

vi.mock("../../src/server/publicDestinationRevalidation", () => ({
  revalidatePublicDestinationPages: mockRevalidatePublicDestinationPages,
}));

import previewHandler from "../../pages/api/admin/erasmus-experiences/[id]/preview";
import reviewHandler from "../../pages/api/admin/erasmus-experiences/[id]/review";

function createMockReq(options: {
  method: string;
  query?: Record<string, unknown>;
  body?: unknown;
}) {
  return {
    method: options.method,
    query: options.query || {},
    body: options.body,
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    jsonPayload: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.jsonPayload = payload;
      return this;
    },
  };

  return res;
}

function createSubmittedExperience(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "experience-base",
    status: "SUBMITTED",
    revisionCount: 0,
    hostCity: "Amsterdam",
    hostCountry: "Netherlands",
    semester: "2026/2027 Fall",
    adminNotes: null,
    publicWordingOverrides: null,
    basicInfo: {
      homeUniversity: "University of Cyprus",
      hostUniversity: "University of Amsterdam",
      hostCity: "Amsterdam",
      hostCountry: "Netherlands",
    },
    accommodation: {
      accommodationType: "shared_apartment",
      monthlyRent: 500,
      currency: "EUR",
      accommodationReview: "Original housing note.",
    },
    livingExpenses: {
      currency: "EUR",
      food: null,
      transport: null,
      social: null,
      other: null,
    },
    courses: [
      {
        id: "course-1",
        homeCourseName: "Algorithms",
        homeECTS: 6,
        hostCourseName: "Advanced Algorithms",
        hostECTS: 6,
        recognitionType: "full_equivalence",
        notes: "Original course note.",
      },
    ],
    experience: {
      generalTips: "Original general tip.",
      academicAdvice: "Original academic advice.",
      socialAdvice: "Original social advice.",
      bestExperience: "Original best experience.",
    },
    users: {
      email: "student@example.com",
      firstName: "Ada",
      lastName: "Student",
    },
    ...overrides,
  };
}

describe("admin public impact preview routes", () => {
  const previousResendApiKey = process.env.RESEND_API_KEY;
  const previousModerationEmailFrom = process.env.MODERATION_EMAIL_FROM;
  const previousNextAuthUrl = process.env.NEXTAUTH_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockFetch);

    process.env.RESEND_API_KEY = "";
    process.env.MODERATION_EMAIL_FROM = "";
    process.env.NEXTAUTH_URL = "http://localhost:3000";

    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-1" },
    });
    mockUserFindUnique.mockResolvedValue({ role: "ADMIN" });
    mockExperienceFindMany.mockResolvedValue([]);
    mockExperienceUpdate.mockImplementation(async ({ data }: { data: any }) => ({
      id: "experience-base",
      status: data.status || "SUBMITTED",
      adminNotes: data.adminNotes || null,
      publicWordingOverrides:
        data.publicWordingOverrides === undefined
          ? null
          : data.publicWordingOverrides,
      reviewFeedback: data.reviewFeedback || null,
    }));
    mockReviewActionCreate.mockImplementation(
      async ({ data }: { data: { action: string; feedback: string | null } }) => ({
        id: `review-action-${data.action.toLowerCase()}`,
        action: data.action,
        feedback: data.feedback,
      }),
    );
    mockTransaction.mockImplementation(async (callback: any) =>
      callback({
        erasmusExperience: {
          update: mockExperienceUpdate,
        },
        reviewAction: {
          create: mockReviewActionCreate,
        },
      }),
    );
    mockRefreshPublicDestinationReadModel.mockResolvedValue(undefined);
    mockRevalidatePublicDestinationPages.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => "",
    });
  });

  afterAll(() => {
    process.env.RESEND_API_KEY = previousResendApiKey;
    process.env.MODERATION_EMAIL_FROM = previousModerationEmailFrom;
    process.env.NEXTAUTH_URL = previousNextAuthUrl;
  });

  it("returns preview payload for an admin when a preview can be built", async () => {
    const preview = {
      slug: "amsterdam-netherlands",
      city: "Amsterdam",
      country: "Netherlands",
      destination: {
        isNewDestination: false,
        before: null,
        after: { submissionCount: 2 },
      },
      accommodation: {
        before: null,
        after: { sampleSize: 2 },
        contribution: null,
      },
      courses: {
        before: null,
        after: { totalMappings: 3 },
        contributionCount: 1,
        contributionExamples: [],
      },
    };

    mockPreviewBuilder.mockResolvedValue(preview);

    const req = createMockReq({
      method: "GET",
      query: { id: "experience-1" },
    });
    const res = createMockRes();

    await previewHandler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toEqual(preview);
  });

  it("returns 404 with a publishability reason when the minimum contract is incomplete", async () => {
    mockPreviewBuilder.mockResolvedValue(null);
    mockPreviewUnavailableReason.mockResolvedValue({
      code: "INCOMPLETE_MINIMUM_PUBLIC_CONTRACT",
      message:
        "Cannot preview or publish this submission until the MVP minimum public contract is complete: host city, host country, host university, home university, accommodation type, monthly rent, and at least one complete course-equivalence example.",
      missingFields: ["hostCity", "hostCountry"],
    });

    const req = createMockReq({
      method: "GET",
      query: { id: "experience-2" },
    });
    const res = createMockRes();

    await previewHandler(req as any, res as any);

    expect(res.statusCode).toBe(404);
    expect(res.jsonPayload).toEqual({
      error:
        "Cannot preview or publish this submission until the MVP minimum public contract is complete: host city, host country, host university, home university, accommodation type, monthly rent, and at least one complete course-equivalence example.",
      code: "INCOMPLETE_MINIMUM_PUBLIC_CONTRACT",
      missingFields: ["hostCity", "hostCountry"],
    });
  });

  it("returns 403 for non-admin preview access", async () => {
    mockUserFindUnique.mockResolvedValue({ role: "STUDENT" });

    const req = createMockReq({
      method: "GET",
      query: { id: "experience-3" },
    });
    const res = createMockRes();

    await previewHandler(req as any, res as any);

    expect(res.statusCode).toBe(403);
    expect(res.jsonPayload).toEqual({
      error: "Forbidden: Admin access required",
    });
  });

  it("blocks approval when publishability-critical destination fields are missing", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createSubmittedExperience({
        id: "experience-4",
        hostCity: null,
        basicInfo: {
          homeUniversity: "University of Cyprus",
          homeDepartment: "Computer Science",
          hostUniversity: "University of Amsterdam",
          hostCity: null,
          hostCountry: "Netherlands",
        },
      }),
    );

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-4" },
      body: { action: "APPROVED", feedback: "" },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toEqual({
      error:
        "Cannot preview or publish this submission until the MVP minimum public contract is complete: host city, host country, host university, home university, accommodation type, monthly rent, and at least one complete course-equivalence example.",
      code: "INCOMPLETE_MINIMUM_PUBLIC_CONTRACT",
      missingFields: ["hostCity"],
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("allows approval when only enrichment fields are missing", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createSubmittedExperience({
        id: "experience-6",
        livingExpenses: {
          currency: "EUR",
          food: null,
          transport: null,
          social: null,
          other: null,
        },
      }),
    );

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-6" },
      body: { action: "APPROVED", feedback: "" },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toEqual({
      success: true,
      experience: {
        id: "experience-base",
        status: "APPROVED",
        adminNotes: null,
        publicWordingOverrides: null,
        reviewFeedback: null,
      },
      reviewAction: {
        id: "review-action-approved",
        action: "APPROVED",
        feedback: null,
      },
      reviewActions: [
        {
          id: "review-action-approved",
          action: "APPROVED",
          feedback: null,
        },
      ],
      message:
        "Experience approved successfully. Public aggregates were refreshed.",
    });
  });

  it("saves wording-only admin edits without changing student submission state", async () => {
    mockExperienceFindUnique.mockResolvedValue(createSubmittedExperience());

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-7" },
      body: {
        action: "WORDING_EDITED",
        wordingEdits: {
          generalTips: "Cleaner public tip.",
          courseNotes: {
            "course-1": "Cleaner public course note.",
          },
        },
      },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(mockExperienceUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "experience-7" },
        data: expect.objectContaining({
          publicWordingOverrides: {
            generalTips: "Cleaner public tip.",
            courseNotes: {
              "course-1": "Cleaner public course note.",
            },
          },
        }),
      }),
    );
    expect(mockExperienceUpdate.mock.calls[0]?.[0]?.data?.adminNotes).toBeUndefined();
    expect(mockReviewActionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "WORDING_EDITED",
          feedback: expect.stringContaining("Updated General tips wording"),
        }),
      }),
    );
    expect(res.jsonPayload).toEqual({
      success: true,
      experience: {
        id: "experience-base",
        status: "SUBMITTED",
        adminNotes: null,
        publicWordingOverrides: {
          generalTips: "Cleaner public tip.",
          courseNotes: {
            "course-1": "Cleaner public course note.",
          },
        },
        reviewFeedback: null,
      },
      reviewAction: {
        id: "review-action-wording_edited",
        action: "WORDING_EDITED",
        feedback: expect.stringContaining("Updated General tips wording"),
      },
      reviewActions: [
        {
          id: "review-action-wording_edited",
          action: "WORDING_EDITED",
          feedback: expect.stringContaining("Updated General tips wording"),
        },
      ],
      message: "Public wording edits saved. Student source data remains unchanged.",
    });
  });

  it("returns a submission to editable revision state and emails the student", async () => {
    process.env.RESEND_API_KEY = "resend-test-key";
    process.env.MODERATION_EMAIL_FROM =
      "Erasmus Journey <noreply@example.com>";
    mockExperienceFindUnique.mockResolvedValue(createSubmittedExperience());

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-8" },
      body: {
        action: "REQUEST_CHANGES",
        feedback: "Please remove the identifying housing details and clarify the advice.",
      },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer resend-test-key",
        }),
      }),
    );
    expect(res.jsonPayload).toEqual({
      success: true,
      experience: {
        id: "experience-base",
        status: "REVISION_NEEDED",
        adminNotes: null,
        publicWordingOverrides: null,
        reviewFeedback:
          "Please remove the identifying housing details and clarify the advice.",
      },
      reviewAction: {
        id: "review-action-request_changes",
        action: "REQUEST_CHANGES",
        feedback:
          "Please remove the identifying housing details and clarify the advice.",
      },
      reviewActions: [
        {
          id: "review-action-request_changes",
          action: "REQUEST_CHANGES",
          feedback:
            "Please remove the identifying housing details and clarify the advice.",
        },
      ],
      notification: {
        status: "sent",
      },
      message:
        "Changes requested. Submission returned to editable revision state and the student was emailed.",
    });
  });
});
