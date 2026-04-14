import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetServerSession,
  mockUserFindUnique,
  mockExperienceFindUnique,
  mockExperienceUpdate,
  mockReviewActionCreate,
  mockTransaction,
  mockRefreshPublicDestinationReadModel,
  mockRevalidatePublicDestinationPages,
} = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockExperienceFindUnique: vi.fn(),
  mockExperienceUpdate: vi.fn(),
  mockReviewActionCreate: vi.fn(),
  mockTransaction: vi.fn(),
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
      update: mockExperienceUpdate,
    },
    reviewAction: {
      create: mockReviewActionCreate,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock("../../src/server/publicDestinations", () => ({
  refreshPublicDestinationReadModel: mockRefreshPublicDestinationReadModel,
}));

vi.mock("../../src/server/publicDestinationRevalidation", () => ({
  revalidatePublicDestinationPages: mockRevalidatePublicDestinationPages,
}));

import handler from "../../pages/api/admin/erasmus-experiences/[id]/wording-override";

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
  const headers = new Map<string, string | string[]>();

  return {
    statusCode: 200,
    jsonPayload: undefined as unknown,
    setHeader(name: string, value: string | string[]) {
      headers.set(name.toLowerCase(), value);
      return this;
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.jsonPayload = payload;
      return this;
    },
  };
}

describe("admin wording override route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "admin-1",
      },
    });
    mockUserFindUnique.mockResolvedValue({ role: "ADMIN" });

    mockExperienceFindUnique.mockResolvedValue({
      id: "experience-approved-1",
      status: "APPROVED",
      hostCity: "Amsterdam",
      hostCountry: "Netherlands",
      experience: {
        bestExperience: "Original summary",
      },
      accommodation: {
        accommodationReview: "Original housing comment",
      },
      courses: [
        {
          id: "course-1",
          homeCourseName: "Algorithms",
          homeECTS: 6,
          hostCourseName: "Advanced Algorithms",
          hostECTS: 6,
          recognitionType: "full_equivalence",
          notes: "Original course note",
        },
      ],
      publicWordingOverrides: null,
    });

    mockExperienceUpdate.mockImplementation(async ({ data }: { data: any }) => ({
      id: "experience-approved-1",
      status: "APPROVED",
      publicWordingOverrides: data.publicWordingOverrides,
      reviewedAt: data.reviewedAt,
      reviewedBy: data.reviewedBy,
    }));

    mockReviewActionCreate.mockImplementation(async ({ data }: { data: any }) => ({
      id: "review-action-wording_edited",
      action: data.action,
      feedback: data.feedback,
    }));

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
  });

  it("saves approved submission wording overrides without mutating student source data", async () => {
    const req = createMockReq({
      method: "PATCH",
      query: { id: "experience-approved-1" },
      body: {
        overrides: {
          experienceSummary: "Edited summary",
          accommodationComment: "Edited housing comment",
          courseNotes: {
            "course-1": "Edited course note",
          },
        },
      },
    });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(mockExperienceUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "experience-approved-1" },
        data: expect.objectContaining({
          publicWordingOverrides: {
            bestExperience: "Edited summary",
            accommodationReview: "Edited housing comment",
            courseNotes: {
              "course-1": "Edited course note",
            },
          },
          reviewedBy: "admin-1",
        }),
      }),
    );
    expect(
      mockExperienceUpdate.mock.calls[0]?.[0]?.data?.reviewedAt,
    ).toBeInstanceOf(Date);
    expect(mockReviewActionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "WORDING_EDITED",
        }),
      }),
    );
    expect(mockRefreshPublicDestinationReadModel).toHaveBeenCalledTimes(1);
    expect(mockRevalidatePublicDestinationPages).toHaveBeenCalledWith(
      res,
      "amsterdam-netherlands",
    );
  });

  it("returns 409 when submission is not approved", async () => {
    mockExperienceFindUnique.mockResolvedValue({
      id: "experience-submitted-1",
      status: "SUBMITTED",
      hostCity: "Amsterdam",
      hostCountry: "Netherlands",
      experience: {},
      accommodation: {},
      courses: [],
      publicWordingOverrides: null,
    });

    const req = createMockReq({
      method: "PATCH",
      query: { id: "experience-submitted-1" },
      body: {
        overrides: {
          experienceSummary: "Edited summary",
        },
      },
    });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(409);
    expect(res.jsonPayload).toEqual({
      error:
        "Only approved submissions can be edited through wording overrides.",
      status: "SUBMITTED",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockRefreshPublicDestinationReadModel).not.toHaveBeenCalled();
  });
});
