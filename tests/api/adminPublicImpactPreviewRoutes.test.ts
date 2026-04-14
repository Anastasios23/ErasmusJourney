import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EXPERIENCE_STATUS,
  REVIEW_ACTION,
} from "../../src/lib/canonicalWorkflow";

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
    status: EXPERIENCE_STATUS.SUBMITTED,
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
    mockExperienceUpdate.mockImplementation(
      async ({ data }: { data: any }) => ({
        id: "experience-base",
        status: data.status || EXPERIENCE_STATUS.SUBMITTED,
        adminNotes: data.adminNotes || null,
        publicWordingOverrides:
          data.publicWordingOverrides === undefined
            ? null
            : data.publicWordingOverrides,
        reviewFeedback: data.reviewFeedback || null,
      }),
    );
    mockReviewActionCreate.mockImplementation(
      async ({
        data,
      }: {
        data: { action: string; feedback: string | null };
      }) => ({
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

  it("returns 401 for unauthenticated preview access", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createMockReq({
      method: "GET",
      query: { id: "experience-unauth-preview" },
    });
    const res = createMockRes();

    await previewHandler(req as any, res as any);

    expect(res.statusCode).toBe(401);
    expect(res.jsonPayload).toEqual({ error: "Unauthorized" });
    expect(mockUserFindUnique).not.toHaveBeenCalled();
    expect(mockPreviewBuilder).not.toHaveBeenCalled();
    expect(mockPreviewUnavailableReason).not.toHaveBeenCalled();
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
    expect(mockPreviewBuilder).not.toHaveBeenCalled();
    expect(mockPreviewUnavailableReason).not.toHaveBeenCalled();
  });

  it("returns 403 for non-admin review access", async () => {
    mockUserFindUnique.mockResolvedValue({ role: "STUDENT" });

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-3b" },
      body: { action: REVIEW_ACTION.REJECTED, feedback: "Not publishable." },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(403);
    expect(res.jsonPayload).toEqual({
      error: "Forbidden: Admin access required",
    });
    expect(mockExperienceFindUnique).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockExperienceUpdate).not.toHaveBeenCalled();
    expect(mockReviewActionCreate).not.toHaveBeenCalled();
    expect(mockRefreshPublicDestinationReadModel).not.toHaveBeenCalled();
    expect(mockRevalidatePublicDestinationPages).not.toHaveBeenCalled();
  });

  it("returns 401 for unauthenticated review access without mutating state", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-unauth-review" },
      body: { action: REVIEW_ACTION.APPROVED, feedback: "" },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(401);
    expect(res.jsonPayload).toEqual({ error: "Unauthorized" });
    expect(mockUserFindUnique).not.toHaveBeenCalled();
    expect(mockExperienceFindUnique).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockExperienceUpdate).not.toHaveBeenCalled();
    expect(mockReviewActionCreate).not.toHaveBeenCalled();
    expect(mockRefreshPublicDestinationReadModel).not.toHaveBeenCalled();
    expect(mockRevalidatePublicDestinationPages).not.toHaveBeenCalled();
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
      body: { action: REVIEW_ACTION.APPROVED, feedback: "" },
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
    expect(mockRefreshPublicDestinationReadModel).not.toHaveBeenCalled();
    expect(mockRevalidatePublicDestinationPages).not.toHaveBeenCalled();
  });

  it("requires feedback when requesting changes", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createSubmittedExperience({
        id: "experience-feedback-request-changes",
      }),
    );

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-feedback-request-changes" },
      body: { action: REVIEW_ACTION.REQUEST_CHANGES, feedback: "   " },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toEqual({
      error: "Feedback required when requesting changes",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("requires feedback for rejection", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createSubmittedExperience({
        id: "experience-feedback-rejected",
      }),
    );

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-feedback-rejected" },
      body: { action: REVIEW_ACTION.REJECTED, feedback: "" },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toEqual({
      error: "Feedback required for rejection",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("allows review only from SUBMITTED status", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createSubmittedExperience({
        id: "experience-approved-already",
        status: EXPERIENCE_STATUS.APPROVED,
      }),
    );

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-approved-already" },
      body: { action: REVIEW_ACTION.REJECTED, feedback: "Already reviewed." },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(409);
    expect(res.jsonPayload).toEqual({
      error:
        "Only submissions currently in SUBMITTED status can be reviewed through the canonical moderation workflow.",
      status: EXPERIENCE_STATUS.APPROVED,
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("allows only one revision request", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createSubmittedExperience({
        id: "experience-revision-limit",
        revisionCount: 1,
      }),
    );

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-revision-limit" },
      body: {
        action: REVIEW_ACTION.REQUEST_CHANGES,
        feedback: "Please revise the destination details.",
      },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toEqual({
      error: "Maximum revision limit reached. Please approve or reject.",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("approves a publishable submission and triggers public publishing side effects", async () => {
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
      body: { action: REVIEW_ACTION.APPROVED, feedback: "" },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    const approvalUpdate = mockExperienceUpdate.mock.calls[0]?.[0];

    expect(res.statusCode).toBe(200);
    expect(approvalUpdate).toEqual(
      expect.objectContaining({
        where: { id: "experience-6" },
        data: expect.objectContaining({
          status: EXPERIENCE_STATUS.APPROVED,
          reviewFeedback: null,
          reviewedBy: "admin-1",
        }),
      }),
    );
    expect(approvalUpdate?.data?.publishedAt).toBeInstanceOf(Date);
    expect(approvalUpdate?.data?.reviewedAt).toBeInstanceOf(Date);
    expect(mockReviewActionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          experienceId: "experience-6",
          adminId: "admin-1",
          action: REVIEW_ACTION.APPROVED,
          feedback: null,
        },
      }),
    );
    expect(mockRefreshPublicDestinationReadModel).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePublicDestinationPages).toHaveBeenCalledWith(
      res,
      "amsterdam-netherlands",
    );
    expect(res.jsonPayload).toEqual({
      success: true,
      experience: {
        id: "experience-base",
        status: EXPERIENCE_STATUS.APPROVED,
        adminNotes: null,
        publicWordingOverrides: null,
        reviewFeedback: null,
      },
      reviewAction: {
        id: "review-action-approved",
        action: REVIEW_ACTION.APPROVED,
        feedback: null,
      },
      reviewActions: [
        {
          id: "review-action-approved",
          action: REVIEW_ACTION.APPROVED,
          feedback: null,
        },
      ],
      message:
        "Experience approved successfully. Public aggregates were refreshed.",
    });
  });

  it("unpublishes an approved submission and returns it to moderation queue", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createSubmittedExperience({
        id: "experience-unpublish",
        status: EXPERIENCE_STATUS.APPROVED,
        publishedAt: new Date("2026-03-01T00:00:00.000Z"),
      }),
    );

    const req = createMockReq({
      method: "PATCH",
      query: { id: "experience-unpublish" },
      body: { action: "UNPUBLISH" },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    const unpublishUpdate = mockExperienceUpdate.mock.calls[0]?.[0];

    expect(res.statusCode).toBe(200);
    expect(unpublishUpdate).toEqual(
      expect.objectContaining({
        where: { id: "experience-unpublish" },
        data: expect.objectContaining({
          status: EXPERIENCE_STATUS.SUBMITTED,
          publishedAt: null,
          reviewedBy: "admin-1",
        }),
      }),
    );
    expect(unpublishUpdate?.data?.reviewedAt).toBeInstanceOf(Date);
    expect(mockReviewActionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          experienceId: "experience-unpublish",
          adminId: "admin-1",
          action: "UNPUBLISHED",
        }),
      }),
    );
    expect(mockRefreshPublicDestinationReadModel).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePublicDestinationPages).toHaveBeenCalledWith(
      res,
      "amsterdam-netherlands",
    );
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        success: true,
        message:
          "Submission unpublished and returned to moderation queue. Public aggregates were refreshed.",
      }),
    );
  });

  it("saves wording-only admin edits without changing student submission state", async () => {
    mockExperienceFindUnique.mockResolvedValue(createSubmittedExperience());

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-7" },
      body: {
        action: REVIEW_ACTION.WORDING_EDITED,
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
    expect(
      mockExperienceUpdate.mock.calls[0]?.[0]?.data?.adminNotes,
    ).toBeUndefined();
    expect(mockReviewActionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: REVIEW_ACTION.WORDING_EDITED,
          feedback: expect.stringContaining("Updated General tips wording"),
        }),
      }),
    );
    expect(res.jsonPayload).toEqual({
      success: true,
      experience: {
        id: "experience-base",
        status: EXPERIENCE_STATUS.SUBMITTED,
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
        action: REVIEW_ACTION.WORDING_EDITED,
        feedback: expect.stringContaining("Updated General tips wording"),
      },
      reviewActions: [
        {
          id: "review-action-wording_edited",
          action: REVIEW_ACTION.WORDING_EDITED,
          feedback: expect.stringContaining("Updated General tips wording"),
        },
      ],
      message:
        "Public wording edits saved. Student source data remains unchanged.",
    });
  });

  it("returns a submission to editable revision state and emails the student", async () => {
    process.env.RESEND_API_KEY = "resend-test-key";
    process.env.MODERATION_EMAIL_FROM = "Erasmus Journey <noreply@example.com>";
    mockExperienceFindUnique.mockResolvedValue(createSubmittedExperience());

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-8" },
      body: {
        action: REVIEW_ACTION.REQUEST_CHANGES,
        feedback:
          "Please remove the identifying housing details and clarify the advice.",
      },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    const revisionUpdate = mockExperienceUpdate.mock.calls[0]?.[0];

    expect(res.statusCode).toBe(200);
    expect(revisionUpdate).toEqual(
      expect.objectContaining({
        where: { id: "experience-8" },
        data: expect.objectContaining({
          status: EXPERIENCE_STATUS.REVISION_NEEDED,
          revisionCount: 1,
          publishedAt: null,
          reviewFeedback:
            "Please remove the identifying housing details and clarify the advice.",
          reviewedBy: "admin-1",
        }),
      }),
    );
    expect(revisionUpdate?.data?.reviewedAt).toBeInstanceOf(Date);
    expect(mockReviewActionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          experienceId: "experience-8",
          adminId: "admin-1",
          action: REVIEW_ACTION.REQUEST_CHANGES,
          feedback:
            "Please remove the identifying housing details and clarify the advice.",
        },
      }),
    );
    expect(mockRefreshPublicDestinationReadModel).not.toHaveBeenCalled();
    expect(mockRevalidatePublicDestinationPages).not.toHaveBeenCalled();
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
        status: EXPERIENCE_STATUS.REVISION_NEEDED,
        adminNotes: null,
        publicWordingOverrides: null,
        reviewFeedback:
          "Please remove the identifying housing details and clarify the advice.",
      },
      reviewAction: {
        id: "review-action-request_changes",
        action: REVIEW_ACTION.REQUEST_CHANGES,
        feedback:
          "Please remove the identifying housing details and clarify the advice.",
      },
      reviewActions: [
        {
          id: "review-action-request_changes",
          action: REVIEW_ACTION.REQUEST_CHANGES,
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

  it("keeps rejected submissions non-public", async () => {
    mockExperienceFindUnique.mockResolvedValue(
      createSubmittedExperience({
        id: "experience-9",
      }),
    );

    const req = createMockReq({
      method: "POST",
      query: { id: "experience-9" },
      body: {
        action: REVIEW_ACTION.REJECTED,
        feedback: "Contains identifying information and cannot be published.",
      },
    });
    const res = createMockRes();

    await reviewHandler(req as any, res as any);

    const rejectionUpdate = mockExperienceUpdate.mock.calls[0]?.[0];

    expect(res.statusCode).toBe(200);
    expect(rejectionUpdate).toEqual(
      expect.objectContaining({
        where: { id: "experience-9" },
        data: expect.objectContaining({
          status: EXPERIENCE_STATUS.REJECTED,
          publishedAt: null,
          reviewFeedback:
            "Contains identifying information and cannot be published.",
          reviewedBy: "admin-1",
        }),
      }),
    );
    expect(rejectionUpdate?.data?.reviewedAt).toBeInstanceOf(Date);
    expect(mockReviewActionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          experienceId: "experience-9",
          adminId: "admin-1",
          action: REVIEW_ACTION.REJECTED,
          feedback: "Contains identifying information and cannot be published.",
        },
      }),
    );
    expect(mockRefreshPublicDestinationReadModel).not.toHaveBeenCalled();
    expect(mockRevalidatePublicDestinationPages).not.toHaveBeenCalled();
    expect(res.jsonPayload).toEqual({
      success: true,
      experience: {
        id: "experience-base",
        status: EXPERIENCE_STATUS.REJECTED,
        adminNotes: null,
        publicWordingOverrides: null,
        reviewFeedback:
          "Contains identifying information and cannot be published.",
      },
      reviewAction: {
        id: "review-action-rejected",
        action: REVIEW_ACTION.REJECTED,
        feedback: "Contains identifying information and cannot be published.",
      },
      reviewActions: [
        {
          id: "review-action-rejected",
          action: REVIEW_ACTION.REJECTED,
          feedback: "Contains identifying information and cannot be published.",
        },
      ],
      message: "Experience rejected.",
    });
  });
});
