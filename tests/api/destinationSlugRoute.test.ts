import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFindUnique, mockGetEnhancedCityData } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockGetEnhancedCityData: vi.fn(),
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    destinations: {
      findUnique: mockFindUnique,
    },
  },
}));

vi.mock("../../src/services/cityAggregationService", () => ({
  getEnhancedCityData: mockGetEnhancedCityData,
}));

import handler from "../../pages/api/destinations/[slug]";

function createMockReq(options: {
  method: string;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
}) {
  return {
    method: options.method,
    query: options.query || {},
    headers: options.headers || {},
    url: `/api/destinations/${options.query?.slug ?? ""}`,
  };
}

function createMockRes() {
  const headers = new Map<string, string>();
  const res = {
    statusCode: 200,
    jsonPayload: undefined as unknown,
    setHeader(name: string, value: string) {
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

  return res;
}

describe("destination slug route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("does not leak Prisma schema details when destination lookup fails", async () => {
    mockFindUnique.mockRejectedValue(
      Object.assign(
        new Error(
          "Invalid `prisma.destinations.findUnique()` invocation. Unknown field `adminOverrides` for include statement on model `destinations`. Available options include aggregatedData, generalInfo, photos, source, status, destination_submissions.",
        ),
        {
          name: "PrismaClientValidationError",
        },
      ),
    );

    const req = createMockReq({
      method: "GET",
      query: { slug: "berlin-germany" },
    });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(500);
    expect(res.jsonPayload).toEqual({
      error: "Failed to fetch destination details",
      message: "Unable to load destination details right now.",
      requestId: expect.any(String),
    });
    expect(res.getHeader("x-request-id")).toBe(
      (res.jsonPayload as { requestId: string }).requestId,
    );
    expect(JSON.stringify(res.jsonPayload)).not.toContain("Prisma");
    expect(JSON.stringify(res.jsonPayload)).not.toContain("adminOverrides");
    expect(JSON.stringify(res.jsonPayload)).not.toContain(
      "destination_submissions",
    );
  });
});
