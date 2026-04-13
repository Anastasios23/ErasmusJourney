import { beforeEach, describe, expect, it, vi } from "vitest";
import { EXPERIENCE_STATUS } from "../../src/lib/canonicalWorkflow";

const {
  mockGetServerSession,
  mockFindMany,
  mockPreviewBuilder,
  mockPreviewUnavailableReason,
} = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockFindMany: vi.fn(),
  mockPreviewBuilder: vi.fn(),
  mockPreviewUnavailableReason: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    erasmusExperience: {
      findMany: mockFindMany,
    },
  },
}));

vi.mock("../../src/server/publicDestinations", () => ({
  getAdminPublicImpactPreviewByExperienceId: mockPreviewBuilder,
  getAdminPublicImpactPreviewUnavailableReasonByExperienceId:
    mockPreviewUnavailableReason,
}));

import handler from "../../pages/api/admin/erasmus-experiences";

function createMockReq(query: Record<string, unknown> = {}) {
  return {
    method: "GET",
    query,
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

describe("admin erasmus experiences route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPreviewBuilder.mockResolvedValue(null);
    mockPreviewUnavailableReason.mockResolvedValue(null);
  });

  it("returns 403 for unauthenticated sessions without hitting admin data sources", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createMockReq({ status: EXPERIENCE_STATUS.SUBMITTED });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(403);
    expect(res.jsonPayload).toEqual({ error: "Admin access required" });
    expect(mockFindMany).not.toHaveBeenCalled();
    expect(mockPreviewBuilder).not.toHaveBeenCalled();
    expect(mockPreviewUnavailableReason).not.toHaveBeenCalled();
  });

  it("returns 403 for non-admin sessions", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "student-1", role: "USER" },
    });

    const req = createMockReq({ status: EXPERIENCE_STATUS.SUBMITTED });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(403);
    expect(res.jsonPayload).toEqual({ error: "Admin access required" });
    expect(mockFindMany).not.toHaveBeenCalled();
    expect(mockPreviewBuilder).not.toHaveBeenCalled();
    expect(mockPreviewUnavailableReason).not.toHaveBeenCalled();
  });

  it("maps the Prisma users relation into the admin page user contract", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });
    mockFindMany.mockResolvedValue([
      {
        id: "experience-1",
        status: EXPERIENCE_STATUS.SUBMITTED,
        hostCity: "Barcelona",
        hostCountry: "Spain",
        users: {
          id: "student-1",
          email: "manual.student@ucy.ac.cy",
          firstName: "Manual",
          lastName: "Student",
        },
        hostUniversity: null,
        homeUniversity: null,
      },
    ]);
    mockPreviewBuilder.mockResolvedValue({
      slug: "barcelona-spain",
      destination: {
        isNewDestination: true,
        before: null,
        after: { submissionCount: 1 },
      },
      accommodation: {
        before: null,
        after: { sampleSize: 1, reviewSnippets: [] },
        contribution: null,
      },
      courses: {
        before: null,
        after: { totalMappings: 1, groups: [], homeUniversityCount: 1 },
        contributionCount: 0,
        contributionExamples: [],
      },
    });

    const req = createMockReq({ status: EXPERIENCE_STATUS.SUBMITTED });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isComplete: true,
          status: EXPERIENCE_STATUS.SUBMITTED,
        },
        include: expect.objectContaining({
          users: expect.any(Object),
        }),
      }),
    );

    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toEqual([
      expect.objectContaining({
        id: "experience-1",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        user: {
          id: "student-1",
          email: "manual.student@ucy.ac.cy",
          name: "Manual Student",
        },
        publicImpactPreview: expect.objectContaining({
          slug: "barcelona-spain",
        }),
        publicImpactPreviewUnavailableReason: null,
      }),
    ]);
  });

  it("normalizes legacy canonical status filters at the API boundary", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });
    mockFindMany.mockResolvedValue([]);

    const req = createMockReq({ status: "PENDING" });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: EXPERIENCE_STATUS.SUBMITTED,
        }),
      }),
    );
  });

  it("rejects unknown canonical status filters", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });

    const req = createMockReq({ status: "ARCHIVED" });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toEqual({ error: "Invalid canonical status filter" });
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});
