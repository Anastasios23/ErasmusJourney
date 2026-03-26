import { describe, expect, it } from "vitest";

import { generateLinkedFormUrl } from "../../src/utils/formLinking";

describe("generateLinkedFormUrl", () => {
  it("routes experience links through the active share-experience flow", () => {
    expect(generateLinkedFormUrl("experience")).toBe("/share-experience");
    expect(generateLinkedFormUrl("story", "abc123")).toBe(
      "/share-experience?basicInfoId=abc123",
    );
  });

  it("routes accommodation links through canonical destination discovery", () => {
    expect(generateLinkedFormUrl("accommodation")).toBe(
      "/destinations?focus=accommodation",
    );
  });
});
