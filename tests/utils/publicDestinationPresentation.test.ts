import { describe, expect, it } from "vitest";

import {
  formatPublicDestinationListAmount,
  formatPublicDestinationMoney,
  getPublicDestinationCurrencyMeta,
  normalizePublicDestinationText,
} from "../../src/lib/publicDestinationPresentation";

describe("public destination presentation helpers", () => {
  it("formats list amounts without misleading currency symbols", () => {
    expect(formatPublicDestinationListAmount(1234.4)).toBe("1,234");
    expect(formatPublicDestinationListAmount(null)).toBe("N/A");
  });

  it("formats single-currency and mixed-currency amounts distinctly", () => {
    expect(formatPublicDestinationMoney(987.6, "EUR")).toBe("988 EUR");
    expect(formatPublicDestinationMoney(987.6, "EUR (mixed)")).toBe(
      "988 (mixed currencies)",
    );
  });

  it("derives mixed currency metadata for detail copy", () => {
    expect(getPublicDestinationCurrencyMeta(" EUR (mixed) ")).toEqual({
      amountSuffix: "mixed currencies",
      baseCurrency: "EUR",
      isMixed: true,
      label: "EUR (mixed currencies)",
    });
  });

  it("normalizes whitespace and rejects opaque identifier text", () => {
    expect(
      normalizePublicDestinationText("  Bring  cash for the first week.  "),
    ).toBe("Bring cash for the first week.");

    expect(
      normalizePublicDestinationText(
        "38b6bde65b3abd18a5c2c1ae218ae428cdeb6166",
      ),
    ).toBeNull();
  });
});
