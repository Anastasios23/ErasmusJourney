import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetServerSession, mockFindMany } = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockFindMany: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    publicDestinationReadModel: {
      findMany: mockFindMany,
    },
  },
}));

import handler from "../../pages/api/admin/destinations/live";

function createMockReq(method: string) {
  return {
    method,
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

describe("admin live destinations route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "admin-1",
        role: "ADMIN",
      },
    });
    mockFindMany.mockResolvedValue([
      {
        slug: "prague-czech-republic",
        city: "Prague",
        country: "Czech Republic",
        submissionCount: 2,
        averageRent: 500,
        updatedAt: new Date("2026-04-14T11:00:00.000Z"),
      },
    ]);
  });

  it("returns live destination read model rows for admins", async () => {
    const req = createMockReq("GET");
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith({
      select: {
        slug: true,
        city: true,
        country: true,
        submissionCount: true,
        averageRent: true,
        updatedAt: true,
      },
      orderBy: [{ submissionCount: "desc" }, { updatedAt: "desc" }],
    });
    expect(res.jsonPayload).toEqual([
      {
        slug: "prague-czech-republic",
        city: "Prague",
        country: "Czech Republic",
        submissionCount: 2,
        averageRent: 500,
        updatedAt: new Date("2026-04-14T11:00:00.000Z"),
      },
    ]);
  });

  it("rejects non-admin access", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "student-1",
        role: "USER",
      },
    });

    const req = createMockReq("GET");
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(403);
    expect(res.jsonPayload).toEqual({ error: "Admin access required" });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns 405 for unsupported methods", async () => {
    const req = createMockReq("POST");
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(405);
    expect(res.jsonPayload).toEqual({ error: "Method not allowed" });
    expect(res.getHeader("allow")).toEqual(["GET"]);
  });
});
