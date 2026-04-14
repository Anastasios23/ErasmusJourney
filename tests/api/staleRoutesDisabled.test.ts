import { describe, expect, it } from "vitest";

import legacyAccommodationRecommendationsHandler from "../../pages/api/accommodation/recommendations";
import legacyAdminAccommodationSubmissionDetailHandler from "../../pages/api/admin/accommodation-submissions/[id]";
import legacyAdminAccommodationSubmissionsHandler from "../../pages/api/admin/accommodation-submissions";
import legacyAdminAccommodationDetailHandler from "../../pages/api/admin/accommodations/[id]";
import legacyAdminApproveHandler from "../../pages/api/admin/approve-experience";
import legacyAdminCourseExchangeDetailHandler from "../../pages/api/admin/course-exchanges/[id]";
import legacyAdminDestinationDetailHandler from "../../pages/api/admin/destinations/[id]";
import legacyAdminDestinationDetailNewHandler from "../../pages/api/admin/destinations/[id]-new";
import legacyAdminDestinationsEnhancedHandler from "../../pages/api/admin/destinations/enhanced";
import legacyAdminDestinationsBackupHandler from "../../pages/api/admin/destinations/index-backup";
import legacyAdminDestinationsHandler from "../../pages/api/admin/destinations";
import legacyAdminDestinationsManageHandler from "../../pages/api/admin/destinations/manage";
import legacyAdminFormSubmissionDetailHandler from "../../pages/api/admin/form-submissions/[id]";
import legacyAdminFormSubmissionsHandler from "../../pages/api/admin/form-submissions";
import legacyAdminStoriesExportHandler from "../../pages/api/admin/stories/export";
import legacyAdminStoryDetailHandler from "../../pages/api/admin/stories/[id]";
import legacyAdminStoriesHandler from "../../pages/api/admin/stories";
import legacyAdminStudentAccommodationsHandler from "../../pages/api/admin/student-accommodations";
import adminSubmissionHandler from "../../pages/api/admin/submissions/index";
import legacyAdminUniversityExchangesHandler from "../../pages/api/admin/university-exchanges";
import legacyAdminUniversitySubmissionDetailHandler from "../../pages/api/admin/university-submissions/[id]";
import legacyAdminUniversitySubmissionsHandler from "../../pages/api/admin/university-submissions";
import legacyFormsGetHandler from "../../pages/api/forms/get";
import legacyFormsSaveDraftHandler from "../../pages/api/forms/saveDraft";
import legacyFormsSubmitHandler from "../../pages/api/forms/submit";
import legacyFormsUserSubmissionsHandler from "../../pages/api/forms/user-submissions";
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

  it("returns 410 for the stale forms submit route", async () => {
    const res = createMockRes();

    await legacyFormsSubmitHandler(createMockReq("POST") as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale forms get route", async () => {
    const res = createMockRes();

    await legacyFormsGetHandler(createMockReq("GET") as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale forms saveDraft route", async () => {
    const res = createMockRes();

    await legacyFormsSaveDraftHandler(createMockReq("POST") as any, res as any);

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/erasmus-experiences",
      }),
    );
  });

  it("returns 410 for the stale forms user-submissions route", async () => {
    const res = createMockRes();

    await legacyFormsUserSubmissionsHandler(
      createMockReq("GET") as any,
      res as any,
    );

    expect(res.statusCode).toBe(410);
    expect(res.jsonPayload).toEqual(
      expect.objectContaining({
        error: "Deprecated route",
        canonicalPath: "/api/erasmus-experiences",
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

  it("returns 410 for the stale admin destinations route", async () => {
    const res = createMockRes();

    await legacyAdminDestinationsHandler(
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

  it("returns 410 for the stale admin stories route", async () => {
    const res = createMockRes();

    await legacyAdminStoriesHandler(createMockReq("GET") as any, res as any);

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

  it("returns 410 for the stale admin form submissions route", async () => {
    const res = createMockRes();

    await legacyAdminFormSubmissionsHandler(
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

  it("returns 410 for the stale admin form submission detail route", async () => {
    const res = createMockRes();

    await legacyAdminFormSubmissionDetailHandler(
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

  it("returns 410 for the stale admin accommodation submissions route", async () => {
    const res = createMockRes();

    await legacyAdminAccommodationSubmissionsHandler(
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

  it("returns 410 for the stale admin accommodation submission detail route", async () => {
    const res = createMockRes();

    await legacyAdminAccommodationSubmissionDetailHandler(
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

  it("returns 410 for the stale admin university submissions route", async () => {
    const res = createMockRes();

    await legacyAdminUniversitySubmissionsHandler(
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

  it("returns 410 for the stale admin university submission detail route", async () => {
    const res = createMockRes();

    await legacyAdminUniversitySubmissionDetailHandler(
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
