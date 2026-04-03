import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetServerSession,
  mockCreateDraft,
  mockGetExperienceByIdForUser,
  mockListExperiencesForUser,
  mockSaveDraft,
  mockSubmitExperience,
  mockIsErasmusExperienceHttpError,
  mockSerializeErasmusExperienceForClient,
  mockEnsureRequestId,
  mockWithRequestId,
  mockIsDatabaseConnectionError,
  mockGetClientSafeDatabaseUnavailableCause,
  mockGetClientSafeDatabaseUnavailableDetails,
  mockGetClientSafeErrorMessage,
  mockGetDatabaseUnavailableCause,
  mockGetErrorMessage,
} = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockCreateDraft: vi.fn(),
  mockGetExperienceByIdForUser: vi.fn(),
  mockListExperiencesForUser: vi.fn(),
  mockSaveDraft: vi.fn(),
  mockSubmitExperience: vi.fn(),
  mockIsErasmusExperienceHttpError: vi.fn(),
  mockSerializeErasmusExperienceForClient: vi.fn(),
  mockEnsureRequestId: vi.fn(),
  mockWithRequestId: vi.fn(),
  mockIsDatabaseConnectionError: vi.fn(),
  mockGetClientSafeDatabaseUnavailableCause: vi.fn(),
  mockGetClientSafeDatabaseUnavailableDetails: vi.fn(),
  mockGetClientSafeErrorMessage: vi.fn(),
  mockGetDatabaseUnavailableCause: vi.fn(),
  mockGetErrorMessage: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock("../../pages/api/auth/[...nextauth]", () => ({
  authOptions: {},
}));

vi.mock("../../src/server/erasmusExperience", () => ({
  createDraft: mockCreateDraft,
  getExperienceByIdForUser: mockGetExperienceByIdForUser,
  isErasmusExperienceHttpError: mockIsErasmusExperienceHttpError,
  listExperiencesForUser: mockListExperiencesForUser,
  saveDraft: mockSaveDraft,
  submitExperience: mockSubmitExperience,
}));

vi.mock("../../src/server/serializeErasmusExperience", () => ({
  serializeErasmusExperienceForClient: mockSerializeErasmusExperienceForClient,
}));

vi.mock("../../lib/apiRequestContext", () => ({
  ensureRequestId: mockEnsureRequestId,
  withRequestId: mockWithRequestId,
}));

vi.mock("../../lib/databaseErrors", () => ({
  getClientSafeDatabaseUnavailableCause:
    mockGetClientSafeDatabaseUnavailableCause,
  getClientSafeDatabaseUnavailableDetails:
    mockGetClientSafeDatabaseUnavailableDetails,
  getClientSafeErrorMessage: mockGetClientSafeErrorMessage,
  getDatabaseUnavailableCause: mockGetDatabaseUnavailableCause,
  getErrorMessage: mockGetErrorMessage,
  isDatabaseConnectionError: mockIsDatabaseConnectionError,
}));

import handler from "../../pages/api/erasmus-experiences";

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

describe("erasmus experiences route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnsureRequestId.mockReturnValue("request-1");
    mockWithRequestId.mockImplementation((_req, _res, payload) => payload);
    mockIsDatabaseConnectionError.mockReturnValue(false);
    mockIsErasmusExperienceHttpError.mockReturnValue(false);
    mockSerializeErasmusExperienceForClient.mockImplementation((value) => ({
      ...value,
      serialized: true,
    }));
    mockGetClientSafeErrorMessage.mockReturnValue("Safe error");
    mockGetClientSafeDatabaseUnavailableDetails.mockReturnValue(
      "Database details",
    );
    mockGetErrorMessage.mockReturnValue("Boom");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("returns 401 for unauthenticated GET requests", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = createMockReq({ method: "GET" });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(401);
    expect(res.jsonPayload).toEqual({ error: "Authentication required" });
  });

  it("creates a draft through the application service and serializes the response", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "student@example.com",
        name: "Student Example",
        image: null,
      },
    });
    mockCreateDraft.mockResolvedValue({
      created: true,
      experience: { id: "exp-1", status: "DRAFT" },
    });

    const req = createMockReq({
      method: "POST",
      body: { action: "create" },
    });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(mockCreateDraft).toHaveBeenCalledWith({
      id: "user-1",
      email: "student@example.com",
      name: "Student Example",
      image: null,
    });
    expect(res.statusCode).toBe(201);
    expect(res.jsonPayload).toEqual({
      id: "exp-1",
      status: "DRAFT",
      serialized: true,
    });
  });

  it("routes submit updates through submitExperience with the stripped update payload", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "student@example.com",
        name: "Student Example",
        image: null,
      },
    });
    mockSubmitExperience.mockResolvedValue({
      id: "exp-1",
      status: "SUBMITTED",
    });

    const req = createMockReq({
      method: "PUT",
      body: {
        id: "exp-1",
        action: "submit",
        currentStep: 5,
        basicInfo: { hostCity: "Amsterdam" },
      },
    });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(mockSubmitExperience).toHaveBeenCalledWith(
      "exp-1",
      {
        id: "user-1",
        email: "student@example.com",
        name: "Student Example",
        image: null,
      },
      {
        currentStep: 5,
        basicInfo: { hostCity: "Amsterdam" },
      },
      expect.any(Function),
    );
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toEqual({
      id: "exp-1",
      status: "SUBMITTED",
      serialized: true,
    });
  });

  it("surfaces service-level HTTP errors without rewriting them", async () => {
    const httpError = {
      statusCode: 422,
      body: {
        error: "Invalid living expenses payload",
      },
    };

    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        email: "student@example.com",
        name: "Student Example",
        image: null,
      },
    });
    mockSaveDraft.mockRejectedValue(httpError);
    mockIsErasmusExperienceHttpError.mockImplementation(
      (error) => error === httpError,
    );

    const req = createMockReq({
      method: "PUT",
      body: {
        id: "exp-1",
        currentStep: 3,
      },
    });
    const res = createMockRes();

    await handler(req as any, res as any);

    expect(res.statusCode).toBe(422);
    expect(res.jsonPayload).toEqual({
      error: "Invalid living expenses payload",
    });
  });
});
