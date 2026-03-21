import { describe, expect, it } from "vitest";

import { getEnforcedHomeUniversityFields } from "../../lib/authUtils";

describe("getEnforcedHomeUniversityFields", () => {
  it("binds the home university to the authenticated email domain", () => {
    expect(
      getEnforcedHomeUniversityFields({
        email: "student@unic.ac.cy",
        fallbackName: "Spoofed University",
        fallbackId: "spoofed-id",
        resolvedUniversity: {
          id: "db-unic-id",
          name: "University of Nicosia",
        },
      }),
    ).toEqual({
      homeUniversity: "University of Nicosia",
      homeUniversityId: "db-unic-id",
      enforcedFromEmail: true,
    });
  });

  it("drops a client-supplied homeUniversityId when the email domain is authoritative but no DB match exists", () => {
    expect(
      getEnforcedHomeUniversityFields({
        email: "student@euc.ac.cy",
        fallbackName: "Spoofed University",
        fallbackId: "spoofed-id",
        resolvedUniversity: null,
      }),
    ).toEqual({
      homeUniversity: "European University Cyprus",
      homeUniversityId: "",
      enforcedFromEmail: true,
    });
  });

  it("falls back to payload values when the session email does not map to a Cyprus university", () => {
    expect(
      getEnforcedHomeUniversityFields({
        email: "admin@erasmusjourney.com",
        fallbackName: "Manual University",
        fallbackId: "manual-id",
        resolvedUniversity: null,
      }),
    ).toEqual({
      homeUniversity: "Manual University",
      homeUniversityId: "manual-id",
      enforcedFromEmail: false,
    });
  });
});
