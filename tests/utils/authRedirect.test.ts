import { describe, expect, it } from "vitest";

import {
  buildLoginRedirectUrl,
  buildRegisterRedirectUrl,
  normalizeInternalCallbackPath,
} from "../../src/lib/authRedirect";

describe("authRedirect", () => {
  it("preserves a clean internal callback path", () => {
    expect(normalizeInternalCallbackPath("/share-experience?step=1")).toBe(
      "/share-experience?step=1",
    );
  });

  it("unwraps recursive login callback nesting", () => {
    const nestedLoginCallback =
      "/login?callbackUrl=%2Flogin%3FcallbackUrl%3D%252Fshare-experience%253Fstep%253D1";

    expect(normalizeInternalCallbackPath(nestedLoginCallback)).toBe(
      "/share-experience?step=1",
    );
    expect(buildLoginRedirectUrl(nestedLoginCallback)).toBe(
      "/login?callbackUrl=%2Fshare-experience%3Fstep%3D1",
    );
  });

  it("rejects external callback URLs and uses the safe fallback", () => {
    expect(
      normalizeInternalCallbackPath(
        "https://malicious.example/steal-session",
        "/share-experience?step=1",
      ),
    ).toBe("/share-experience?step=1");
  });

  it("does not allow auth entry pages as final callbacks", () => {
    expect(
      normalizeInternalCallbackPath("/register?callbackUrl=%2Flogin"),
    ).toBe("/dashboard");
  });

  it("builds register redirects from the sanitized callback path", () => {
    expect(
      buildRegisterRedirectUrl(
        "/register?callbackUrl=%2Fshare-experience%3Fstep%3D1",
      ),
    ).toBe("/register?callbackUrl=%2Fshare-experience%3Fstep%3D1");
  });
});
