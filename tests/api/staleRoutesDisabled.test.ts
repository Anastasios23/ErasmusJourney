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
import legacyExperienceHandler from "../../pages/api/erasmus-experience/submit";
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

    await legacyDestinationCostsHandler(
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

    await legacyDestinationStatsHandler(
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
