import { beforeEach, describe, expect, it, vi } from "vitest";

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

  it("returns 403 for non-admin sessions", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "student-1", role: "USER" },
    });

    const req = createMockReq({ status: "SUBMITTED" });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(403);
    expect(res.jsonPayload).toEqual({ error: "Admin access required" });
  });

  it("maps the Prisma users relation into the admin page user contract", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    });
    mockFindMany.mockResolvedValue([
      {
        id: "experience-1",
        status: "SUBMITTED",
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

    const req = createMockReq({ status: "SUBMITTED" });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isComplete: true,
          status: "SUBMITTED",
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
});
