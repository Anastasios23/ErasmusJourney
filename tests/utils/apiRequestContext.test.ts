import { describe, expect, it, vi } from "vitest";

import {
  REQUEST_ID_HEADER,
  ensureRequestId,
  logApiError,
  withRequestId,
} from "../../lib/apiRequestContext";

function createMockReq(headers: Record<string, string> = {}) {
  return {
    method: "GET",
    url: "/api/example?x=1",
    headers,
  };
}

function createMockRes() {
  const headers = new Map<string, string>();

  return {
    setHeader(name: string, value: string) {
      headers.set(name.toLowerCase(), value);
      return this;
    },
    getHeader(name: string) {
      return headers.get(name.toLowerCase());
    },
  };
}

describe("api request context helpers", () => {
  it("generates a request id and reuses it across helpers", () => {
    const req = createMockReq();
    const res = createMockRes();

    const requestId = ensureRequestId(req as any, res as any);
    const payload = withRequestId(req as any, res as any, { error: "test" });

    expect(requestId).toMatch(/^[A-Za-z0-9._:-]+$/);
    expect(payload.requestId).toBe(requestId);
    expect(res.getHeader(REQUEST_ID_HEADER)).toBe(requestId);
  });

  it("reuses a valid incoming request id", () => {
    const req = createMockReq({
      [REQUEST_ID_HEADER]: "client-request-123",
    });
    const res = createMockRes();

    expect(ensureRequestId(req as any, res as any)).toBe("client-request-123");
    expect(res.getHeader(REQUEST_ID_HEADER)).toBe("client-request-123");
  });

  it("replaces an invalid incoming request id and logs structured metadata", () => {
    const req = createMockReq({
      [REQUEST_ID_HEADER]: "bad request id with spaces",
    });
    const res = createMockRes();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const requestId = logApiError(
        req as any,
        res as any,
        "Example API failure",
        Object.assign(new Error("Prisma schema details"), { code: "P2002" }),
        { slug: "berlin-germany" },
      );

      expect(requestId).not.toBe("bad request id with spaces");
      expect(requestId).toMatch(/^[A-Za-z0-9._:-]+$/);
      expect(errorSpy).toHaveBeenCalledWith(
        "Example API failure",
        expect.objectContaining({
          requestId,
          method: "GET",
          path: "/api/example",
          context: { slug: "berlin-germany" },
          errorName: "Error",
          errorMessage: "Prisma schema details",
          errorCode: "P2002",
        }),
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
