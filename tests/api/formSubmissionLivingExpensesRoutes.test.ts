import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetServerSession,
  mockGetServerAuthSession,
  mockIsAdmin,
  mockEnsureRequestId,
  mockWithRequestId,
  mockLogApiError,
  mockIsDatabaseConnectionError,
  mockGetClientSafeDatabaseUnavailableCause,
  mockGetClientSafeDatabaseUnavailableDetails,
  mockGetClientSafeErrorMessage,
  mockUserFindUnique,
  mockUserCreate,
  mockFormSubmissionsFindFirst,
  mockFormSubmissionsFindMany,
  mockFormSubmissionsCreate,
  mockFormSubmissionsUpdate,
} = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockGetServerAuthSession: vi.fn(),
  mockIsAdmin: vi.fn(),
  mockEnsureRequestId: vi.fn(),
  mockWithRequestId: vi.fn(),
  mockLogApiError: vi.fn(),
  mockIsDatabaseConnectionError: vi.fn(),
  mockGetClientSafeDatabaseUnavailableCause: vi.fn(),
  mockGetClientSafeDatabaseUnavailableDetails: vi.fn(),
  mockGetClientSafeErrorMessage: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockUserCreate: vi.fn(),
  mockFormSubmissionsFindFirst: vi.fn(),
  mockFormSubmissionsFindMany: vi.fn(),
  mockFormSubmissionsCreate: vi.fn(),
  mockFormSubmissionsUpdate: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

vi.mock("../../lib/auth", () => ({
  getServerAuthSession: mockGetServerAuthSession,
  isAdmin: mockIsAdmin,
}));

vi.mock("../../lib/apiRequestContext", () => ({
  ensureRequestId: mockEnsureRequestId,
  logApiError: mockLogApiError,
  withRequestId: mockWithRequestId,
}));

vi.mock("../../lib/databaseErrors", () => ({
  getClientSafeDatabaseUnavailableCause:
    mockGetClientSafeDatabaseUnavailableCause,
  getClientSafeDatabaseUnavailableDetails:
    mockGetClientSafeDatabaseUnavailableDetails,
  getClientSafeErrorMessage: mockGetClientSafeErrorMessage,
  isDatabaseConnectionError: mockIsDatabaseConnectionError,
}));

vi.mock("@/lib/databaseErrors", () => ({
  getClientSafeDatabaseUnavailableCause:
    mockGetClientSafeDatabaseUnavailableCause,
  getClientSafeDatabaseUnavailableDetails:
    mockGetClientSafeDatabaseUnavailableDetails,
  getClientSafeErrorMessage: mockGetClientSafeErrorMessage,
  isDatabaseConnectionError: mockIsDatabaseConnectionError,
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockUserFindUnique,
      create: mockUserCreate,
    },
    form_submissions: {
      findFirst: mockFormSubmissionsFindFirst,
      findMany: mockFormSubmissionsFindMany,
      create: mockFormSubmissionsCreate,
      update: mockFormSubmissionsUpdate,
    },
  },
}));

import submitHandler from "../../pages/api/forms/submit";
import getHandler from "../../pages/api/forms/get";

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

describe("form_submissions living-expenses routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureRequestId.mockReturnValue("request-1");
    mockWithRequestId.mockImplementation((_req, _res, payload) => payload);
    mockIsDatabaseConnectionError.mockReturnValue(false);
    mockGetClientSafeErrorMessage.mockReturnValue("Safe error");
    mockGetClientSafeDatabaseUnavailableCause.mockReturnValue(undefined);
    mockGetClientSafeDatabaseUnavailableDetails.mockReturnValue(
      "Database details",
    );
    mockIsAdmin.mockReturnValue(false);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  it("stores legacy living-expenses input in canonical persisted fields", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "student@example.com",
        name: "Student Example",
        role: "USER",
      },
    });
    mockUserFindUnique.mockResolvedValue({ id: "user-1" });
    mockFormSubmissionsFindFirst.mockResolvedValueOnce(null);
    mockFormSubmissionsCreate.mockResolvedValue({
      id: "submission-1",
      type: "living-expenses",
      title: "Monthly budget",
      status: "DRAFT",
      createdAt: new Date("2026-04-03T10:00:00.000Z"),
    });

    const req = createMockReq({
      method: "POST",
      body: {
        type: "living-expenses",
        title: "Monthly budget",
        status: "draft",
        data: {
          currency: "EUR",
          monthlyRent: "450",
          monthlyFood: "200",
          monthlyTransport: "50",
          monthlyEntertainment: "100",
          monthlyUtilities: "40",
          monthlyOther: "20",
          monthlyIncomeAmount: "300",
        },
      },
    });
    const res = createMockRes();

    await submitHandler(req as any, res as any);

    expect(res.statusCode).toBe(201);
    expect(mockFormSubmissionsCreate).toHaveBeenCalledTimes(1);

    const createArgs = mockFormSubmissionsCreate.mock.calls[0][0];
    expect(createArgs.data.data).toEqual(
      expect.objectContaining({
        currency: "EUR",
        rent: 450,
        food: 200,
        transport: 50,
        social: 100,
        travel: null,
        other: 60,
        monthlyIncomeAmount: 300,
      }),
    );
    expect(createArgs.data.data).not.toHaveProperty("monthlyRent");
    expect(createArgs.data.data).not.toHaveProperty("monthlyFood");
    expect(createArgs.data.data).not.toHaveProperty("expenses");
  });

  it("returns canonical living-expenses data for mixed-case stored submissions", async () => {
    mockGetServerAuthSession.mockResolvedValue({
      user: { id: "user-1" },
    });
    mockFormSubmissionsFindMany.mockResolvedValue([
      {
        id: "submission-1",
        userId: "user-1",
        type: "LIVING_EXPENSES",
        title: "Monthly budget",
        data: {
          monthlyRent: "500",
          monthlyFood: "180",
          monthlyTransport: "45",
          monthlyEntertainment: "90",
          monthlyUtilities: "35",
          monthlyOther: "20",
          monthlyIncomeAmount: "250",
        },
        status: "DRAFT",
        createdAt: new Date("2026-04-03T09:00:00.000Z"),
        updatedAt: new Date("2026-04-03T10:00:00.000Z"),
        users: {
          id: "user-1",
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
        },
      },
    ]);

    const req = createMockReq({
      method: "GET",
      query: { type: "living-expenses" },
    });
    const res = createMockRes();

    await getHandler(req as any, res as any);

    expect(res.statusCode).toBe(200);
    expect(mockFormSubmissionsFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          type: {
            in: ["living-expenses", "LIVING_EXPENSES"],
          },
        }),
      }),
    );

    const payload = res.jsonPayload as {
      submissions: Array<{
        type: string;
        data: Record<string, unknown>;
      }>;
    };

    expect(payload.submissions[0].type).toBe("living-expenses");
    expect(payload.submissions[0].data).toEqual(
      expect.objectContaining({
        currency: "EUR",
        rent: 500,
        food: 180,
        transport: 45,
        social: 90,
        travel: null,
        other: 55,
        monthlyIncomeAmount: 250,
      }),
    );
    expect(payload.submissions[0].data).not.toHaveProperty("monthlyFood");
    expect(payload.submissions[0].data).not.toHaveProperty("expenses");
  });
});
