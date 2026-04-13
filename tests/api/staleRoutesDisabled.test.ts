import { describe, expect, it } from "vitest";

import legacyAdminApproveHandler from "../../pages/api/admin/approve-experience";
import adminSubmissionHandler from "../../pages/api/admin/submissions/index";
import legacyDestinationsHandler from "../../pages/api/destinations";
import legacyExperienceHandler from "../../pages/api/erasmus-experience/submit";
import userSubmissionsHandler from "../../pages/api/user/submissions";

function createMockReq(method = "GET") {
  return { method };
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

describe("stale canonical-conflicting routes", () => {
  it("returns 410 for the stale user submissions route", async () => {
    const res = createMockRes();

    await userSubmissionsHandler(createMockReq() as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale admin submissions route", async () => {
    const res = createMockRes();

    await adminSubmissionHandler(createMockReq() as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale admin approve-experience route", async () => {
    const res = createMockRes();

    await legacyAdminApproveHandler(createMockReq("POST") as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences/[id]/review",
      }),
    );
  });

  it("returns 410 for the stale destinations list route", async () => {
    const res = createMockRes();

    await legacyDestinationsHandler(createMockReq("GET") as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations",
      }),
    );
  });

  it("returns 410 for the legacy erasmus-experience submit route", async () => {
    const res = createMockRes();

    await legacyExperienceHandler(createMockReq("POST") as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/erasmus-experiences",
      }),
    );
  });
});
