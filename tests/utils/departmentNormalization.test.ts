import { describe, expect, it } from "vitest";

import {
  getCanonicalDepartmentLabel,
  getDepartmentMatchKey,
  normalizeDepartmentList,
} from "../../src/lib/departmentNormalization";

describe("department normalization", () => {
  it("normalizes whitespace and casing for matching", () => {
    const left = getDepartmentMatchKey(" Accounting ");
    const right = getDepartmentMatchKey("accounting");

    expect(left).toBe(right);
  });

  it("maps known typo aliases to canonical labels", () => {
    expect(
      getCanonicalDepartmentLabel(
        "Business Adminsitration And Accounting And Finance",
      ),
    ).toBe("Business Administration and Accounting and Finance");

    expect(
      getDepartmentMatchKey(
        "Business Adminsitration And Accounting And Finance",
      ),
    ).toBe(
      getDepartmentMatchKey(
        "Business Administration and Accounting and Finance",
      ),
    );
  });

  it("deduplicates department lists by canonical match key", () => {
    expect(
      normalizeDepartmentList([" Accounting", "accounting", "Accounting "]),
    ).toEqual(["Accounting"]);
  });
});
