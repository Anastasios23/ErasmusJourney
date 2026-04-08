import { describe, expect, it } from "vitest";

import adminSubmissionHandler from "../../pages/api/admin/submissions/index";
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
