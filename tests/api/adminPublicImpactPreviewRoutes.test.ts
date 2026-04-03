import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetServerSession,
  mockUserFindUnique,
  mockExperienceFindUnique,
  mockTransaction,
  mockPreviewBuilder,
  mockPreviewUnavailableReason,
  mockRefreshPublicDestinationReadModel,
  mockRevalidatePublicDestinationPages,
} = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockExperienceFindUnique: vi.fn(),
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
      update: vi.fn(),
    },
    reviewAction: {
      create: vi.fn(),
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

describe("admin public impact preview routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-1" },
    });
    mockUserFindUnique.mockResolvedValue({ role: "ADMIN" });
    mockTransaction.mockResolvedValue([]);
    mockRefreshPublicDestinationReadModel.mockResolvedValue(undefined);
    mockRevalidatePublicDestinationPages.mockResolvedValue(undefined);
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

  it("returns 404 with a publishability reason when destination identity is incomplete", async () => {
    mockPreviewBuilder.mockResolvedValue(null);
    mockPreviewUnavailableReason.mockResolvedValue({
      code: "INCOMPLETE_DESTINATION_IDENTITY",
      message:
        "Cannot preview or publish this submission to public destination pages until the destination city and country are complete.",
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
        "Cannot preview or publish this submission to public destination pages until the destination city and country are complete.",
      code: "INCOMPLETE_DESTINATION_IDENTITY",
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
    mockExperienceFindUnique.mockResolvedValue({
      id: "experience-4",
      status: "SUBMITTED",
      revisionCount: 0,
      hostCity: null,
      hostCountry: "Netherlands",
      semester: "2026/2027 Fall",
      user: {
        id: "student-1",
        name: "Student",
        email: "student@example.com",
      },
    });

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
        "Cannot preview or publish this submission to public destination pages until the destination city and country are complete.",
      code: "INCOMPLETE_DESTINATION_IDENTITY",
      missingFields: ["hostCity"],
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });
});
