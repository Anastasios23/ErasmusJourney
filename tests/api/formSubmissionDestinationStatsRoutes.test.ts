import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFormSubmissionsFindMany } = vi.hoisted(() => ({
  mockFormSubmissionsFindMany: vi.fn(),
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    form_submissions: {
      findMany: mockFormSubmissionsFindMany,
    },
  },
}));

import costsHandler from "../../pages/api/destinations/costs";
import statsHandler from "../../pages/api/destinations/stats";

function createMockReq(options: {
  method: string;
  query?: Record<string, unknown>;
}) {
  return {
    method: options.method,
    query: options.query || {},
  };
}

function createMockRes() {
  const headers = new Map<string, string | string[]>();
  const res = {
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

  return res;
}

describe("legacy destination living-expenses routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  it("calculates destination costs from canonical living-expenses submissions", async () => {
    mockFormSubmissionsFindMany.mockResolvedValue([
      {
        data: {
          destination: { city: "Lisbon", country: "Portugal" },
          currency: "EUR",
          rent: 450,
          food: 180,
          transport: 40,
          social: 120,
          travel: 60,
          other: 50,
        },
        createdAt: new Date("2026-04-01T10:00:00.000Z"),
      },
      {
        data: {
          destination: { city: "Lisbon", country: "Portugal" },
          currency: "EUR",
          rent: 550,
          food: 200,
          transport: 60,
          social: 140,
          travel: 40,
          other: 10,
        },
        createdAt: new Date("2026-04-02T10:00:00.000Z"),
      },
    ]);

    const req = createMockReq({
      method: "GET",
      query: { city: "Lisbon", country: "Portugal" },
    });
    const res = createMockRes();

    await costsHandler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(mockFormSubmissionsFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: {
            in: ["LIVING_EXPENSES", "living-expenses"],
          },
        }),
      }),
    );
    expect(res.jsonPayload).toEqual({
      city: "Lisbon",
      country: "Portugal",
      avgAccommodation: 500,
      avgFood: 190,
      avgTransport: 50,
      avgEntertainment: 130,
      totalMonthly: 950,
      currency: "EUR",
      sampleSize: 2,
      lastUpdated: new Date("2026-04-02T10:00:00.000Z"),
    });
  });

  it("builds destination stats from canonical totals and host-city fallbacks", async () => {
    mockFormSubmissionsFindMany.mockResolvedValue([
      {
        data: {
          destination: { city: "Lisbon", country: "Portugal" },
          currency: "EUR",
          rent: 450,
          food: 180,
          transport: 40,
          social: 120,
          travel: 60,
          other: 50,
        },
        createdAt: new Date("2026-04-01T10:00:00.000Z"),
        hostCity: null,
        hostCountry: null,
      },
      {
        data: {
          currency: "EUR",
          rent: 600,
          food: 210,
          transport: 70,
          social: 160,
          travel: 30,
          other: 30,
        },
        createdAt: new Date("2026-04-02T10:00:00.000Z"),
        hostCity: "Lisbon",
        hostCountry: "Portugal",
      },
      {
        data: {
          destination: { city: "Madrid", country: "Spain" },
          currency: "EUR",
          rent: 400,
          food: 150,
          transport: 50,
          social: 100,
          travel: 20,
          other: 30,
        },
        createdAt: new Date("2026-04-03T10:00:00.000Z"),
        hostCity: null,
        hostCountry: null,
      },
    ]);

    const req = createMockReq({ method: "GET" });
    const res = createMockRes();

    await statsHandler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toEqual({
      totalDestinations: 2,
      totalSubmissions: 3,
      avgCostRange: {
        min: 750,
        max: 1000,
      },
      popularDestinations: [
        {
          city: "Lisbon",
          country: "Portugal",
          studentCount: 2,
          avgCost: 1000,
        },
        {
          city: "Madrid",
          country: "Spain",
          studentCount: 1,
          avgCost: 750,
        },
      ],
      costEffectiveDestinations: [],
    });
  });
});
