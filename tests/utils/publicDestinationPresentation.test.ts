import { describe, expect, it } from "vitest";

import {
  formatPublicDestinationListAmount,
  formatPublicDestinationMoney,
  getPublicDestinationSignalSummary,
  getPublicDestinationCurrencyMeta,
  normalizePublicDestinationText,
  sanitizePublicDestinationArea,
  sanitizePublicDestinationNarrative,
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

  it("classifies destination signal strength from approved submission counts", () => {
    expect(getPublicDestinationSignalSummary(2, 1)).toEqual({
      label: "Limited data",
      tone: "warning",
      evidenceLine: "Based on 2 approved submissions across 1 host university.",
      description:
        "Fewer than 5 approved submissions are available for this city, so averages and summary claims stay hidden until the sample grows.",
    });

    expect(getPublicDestinationSignalSummary(5, 2)).toEqual({
      label: "Growing sample",
      tone: "info",
      evidenceLine:
        "Based on 5 approved submissions across 2 host universities.",
      description:
        "Enough approved submissions are available to start comparing recurring city-level patterns, while still treating results as directional.",
    });

    expect(getPublicDestinationSignalSummary(7, 3)).toEqual({
      label: "Stronger signal",
      tone: "success",
      evidenceLine:
        "Based on 7 approved submissions across 3 host universities.",
      description:
        "Enough approved reports are available to compare recurring patterns more confidently, while still allowing for personal variation.",
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

  it("drops narrative snippets with direct contact or address details", () => {
    expect(
      sanitizePublicDestinationNarrative(
        "Message me at maria@example.com for the landlord number.",
      ),
    ).toBeNull();

    expect(
      sanitizePublicDestinationNarrative("The flat was at Via Roma 12."),
    ).toBeNull();

    expect(
      sanitizePublicDestinationNarrative(
        "Start searching early because good rooms disappear fast.",
      ),
    ).toBe("Start searching early because good rooms disappear fast.");
  });

  it("keeps area labels but drops exact-address-like values", () => {
    expect(sanitizePublicDestinationArea("Soderhamn, near campus")).toBe(
      "Soderhamn",
    );

    expect(sanitizePublicDestinationArea("Rua de Santa Marta 24")).toBeNull();
  });
});
