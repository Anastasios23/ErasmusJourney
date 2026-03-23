import { describe, expect, it } from "vitest";

import {
  getCyprusUniversityByEmail,
  getEnforcedHomeUniversityFields,
} from "../../lib/authUtils";

describe("getCyprusUniversityByEmail", () => {
  it("recognizes MVP university domains", () => {
    expect(getCyprusUniversityByEmail("student@ucy.ac.cy")?.code).toBe("UCY");
    expect(getCyprusUniversityByEmail("student@unic.ac.cy")?.code).toBe("UNIC");
    expect(getCyprusUniversityByEmail("student@euc.ac.cy")?.code).toBe("EUC");
    expect(getCyprusUniversityByEmail("student@frederick.ac.cy")?.code).toBe(
      "Frederick",
    );
    expect(getCyprusUniversityByEmail("student@uclancyprus.ac.cy")?.code).toBe(
      "UCLan",
    );
  });

  it("does not recognize out-of-scope domains", () => {
    expect(getCyprusUniversityByEmail("student@cut.ac.cy")).toBeNull();
    expect(getCyprusUniversityByEmail("student@ouc.ac.cy")).toBeNull();
    expect(getCyprusUniversityByEmail("student@nup.ac.cy")).toBeNull();
    expect(
      getCyprusUniversityByEmail("student@philipsuniversity.ac.cy"),
    ).toBeNull();
  });
});

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
