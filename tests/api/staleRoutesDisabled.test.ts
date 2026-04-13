import { describe, expect, it } from "vitest";

import legacyAdminApproveHandler from "../../pages/api/admin/approve-experience";
import adminSubmissionHandler from "../../pages/api/admin/submissions/index";
import legacyDestinationAnalyticsHandler from "../../pages/api/destinations/analytics";
import legacyDestinationAveragesHandler from "../../pages/api/destinations/averages";
import legacyDestinationCityAggregatedHandler from "../../pages/api/destinations/city-aggregated";
import legacyDestinationCityEnhancedHandler from "../../pages/api/destinations/city-enhanced";
import legacyDestinationCostsHandler from "../../pages/api/destinations/costs";
import legacyDestinationDetailHandler from "../../pages/api/destinations/[slug]";
import legacyDestinationGenerateHandler from "../../pages/api/destinations/generate";
import legacyDestinationGeneratedHandler from "../../pages/api/destinations/generated";
import legacyDestinationIntegratedHandler from "../../pages/api/destinations/integrated";
import legacyDestinationIndexBackupHandler from "../../pages/api/destinations/index-backup";
import legacyDestinationIndexNewHandler from "../../pages/api/destinations/index-new";
import legacyDestinationStatsHandler from "../../pages/api/destinations/stats";
import legacyDestinationsHandler from "../../pages/api/destinations";
import legacyEnhancedDestinationsHandler from "../../pages/api/enhanced-destinations";
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

  it("returns 410 for the stale destinations detail route", async () => {
    const res = createMockRes();

    await legacyDestinationDetailHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations/[slug]",
      }),
    );
  });

  it("returns 410 for the stale destination costs route", async () => {
    const res = createMockRes();

    await legacyDestinationCostsHandler(createMockReq("GET") as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations/[slug]",
      }),
    );
  });

  it("returns 410 for the stale destination averages route", async () => {
    const res = createMockRes();

    await legacyDestinationAveragesHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations/[slug]",
      }),
    );
  });

  it("returns 410 for the stale destination stats route", async () => {
    const res = createMockRes();

    await legacyDestinationStatsHandler(createMockReq("GET") as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations",
      }),
    );
  });

  it("returns 410 for the stale destination analytics route", async () => {
    const res = createMockRes();

    await legacyDestinationAnalyticsHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations",
      }),
    );
  });

  it("returns 410 for the stale city aggregated route", async () => {
    const res = createMockRes();

    await legacyDestinationCityAggregatedHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations",
      }),
    );
  });

  it("returns 410 for the stale city enhanced route", async () => {
    const res = createMockRes();

    await legacyDestinationCityEnhancedHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations",
      }),
    );
  });

  it("returns 410 for the stale destination generate route", async () => {
    const res = createMockRes();

    await legacyDestinationGenerateHandler(
      createMockReq("POST") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences/[id]/review",
      }),
    );
  });

  it("returns 410 for the stale generated destinations route", async () => {
    const res = createMockRes();

    await legacyDestinationGeneratedHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations",
      }),
    );
  });

  it("returns 410 for the stale integrated destinations route", async () => {
    const res = createMockRes();

    await legacyDestinationIntegratedHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations",
      }),
    );
  });

  it("returns 410 for the stale backup destinations route", async () => {
    const res = createMockRes();

    await legacyDestinationIndexBackupHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations",
      }),
    );
  });

  it("returns 410 for the stale alternate destinations route", async () => {
    const res = createMockRes();

    await legacyDestinationIndexNewHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/public/destinations",
      }),
    );
  });

  it("returns 410 for the stale enhanced destinations route", async () => {
    const res = createMockRes();

    await legacyEnhancedDestinationsHandler(
      createMockReq("GET") as any,
      res as any,
    );

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
