import { describe, expect, it } from "vitest";

import { getCyprusUniversityByEmail } from "../../lib/authUtils";

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
