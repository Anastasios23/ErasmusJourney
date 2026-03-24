import { describe, expect, it } from "vitest";

import { getPageTransitionKey } from "../../src/lib/pageTransitionKey";

describe("getPageTransitionKey", () => {
  it("drops query parameters so multi-step form query changes do not remount the page", () => {
    expect(getPageTransitionKey("/share-experience?step=1")).toBe(
      "/share-experience",
    );
    expect(getPageTransitionKey("/share-experience?step=2")).toBe(
      "/share-experience",
    );
  });

  it("preserves the actual pathname for normal route transitions", () => {
    expect(getPageTransitionKey("/destinations/copenhagen-denmark")).toBe(
      "/destinations/copenhagen-denmark",
    );
  });
});
