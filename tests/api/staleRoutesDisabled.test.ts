import { describe, expect, it } from "vitest";

import legacyAccommodationRecommendationsHandler from "../../pages/api/accommodation/recommendations";
import legacyAdminAccommodationDetailHandler from "../../pages/api/admin/accommodations/[id]";
import legacyAdminApproveHandler from "../../pages/api/admin/approve-experience";
import legacyAdminCourseExchangeDetailHandler from "../../pages/api/admin/course-exchanges/[id]";
import legacyAdminDestinationDetailHandler from "../../pages/api/admin/destinations/[id]";
import legacyAdminDestinationDetailNewHandler from "../../pages/api/admin/destinations/[id]-new";
import legacyAdminDestinationsEnhancedHandler from "../../pages/api/admin/destinations/enhanced";
import legacyAdminDestinationsBackupHandler from "../../pages/api/admin/destinations/index-backup";
import legacyAdminDestinationsManageHandler from "../../pages/api/admin/destinations/manage";
import legacyAdminStoriesExportHandler from "../../pages/api/admin/stories/export";
import legacyAdminStoryDetailHandler from "../../pages/api/admin/stories/[id]";
import legacyAdminStudentAccommodationsHandler from "../../pages/api/admin/student-accommodations";
import adminSubmissionHandler from "../../pages/api/admin/submissions/index";
import legacyAdminUniversityExchangesHandler from "../../pages/api/admin/university-exchanges";
import legacyOgStoryDetailHandler from "../../pages/api/og/story/[id]";
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

  it("returns 410 for the stale admin destination detail route", async () => {
    const res = createMockRes();

    await legacyAdminDestinationDetailHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale alternate admin destination detail route", async () => {
    const res = createMockRes();

    await legacyAdminDestinationDetailNewHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale enhanced admin destinations route", async () => {
    const res = createMockRes();

    await legacyAdminDestinationsEnhancedHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale backup admin destinations route", async () => {
    const res = createMockRes();

    await legacyAdminDestinationsBackupHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale admin destination management route", async () => {
    const res = createMockRes();

    await legacyAdminDestinationsManageHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale admin student accommodations route", async () => {
    const res = createMockRes();

    await legacyAdminStudentAccommodationsHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale admin university exchanges route", async () => {
    const res = createMockRes();

    await legacyAdminUniversityExchangesHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale admin accommodation detail route", async () => {
    const res = createMockRes();

    await legacyAdminAccommodationDetailHandler(
      createMockReq("PATCH") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale admin course exchange detail route", async () => {
    const res = createMockRes();

    await legacyAdminCourseExchangeDetailHandler(
      createMockReq("PATCH") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale admin story detail route", async () => {
    const res = createMockRes();

    await legacyAdminStoryDetailHandler(
      createMockReq("PATCH") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale admin stories export route", async () => {
    const res = createMockRes();

    await legacyAdminStoriesExportHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/admin/erasmus-experiences",
      }),
    );
  });

  it.each([
    [
      "stale accommodation recommendations route",
      legacyAccommodationRecommendationsHandler,
      "/api/public/destinations/[slug]",
    ],
    [
      "stale og story detail route",
      legacyOgStoryDetailHandler,
      "/api/public/destinations/[slug]",
    ],
  ])("returns 410 for %s", async (_label, handler, canonicalPath) => {
    const res = createMockRes();

    await (handler as any)(createMockReq("GET") as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath,
      }),
    );
  });
});
