import { expect, test } from "@playwright/test";

test("unauthenticated share experience entry redirects once to a clean login callback", async ({
  page,
}) => {
  await page.context().clearCookies();
  await page.goto("/share-experience?step=1");

  await expect(page).toHaveURL(
    /\/login\?callbackUrl=%2Fshare-experience%3Fstep%3D1$/,
    { timeout: 15_000 },
  );

  const currentUrl = new URL(page.url());

  expect(currentUrl.pathname).toBe("/login");
  expect(currentUrl.searchParams.get("callbackUrl")).toBe(
    "/share-experience?step=1",
  );
  expect(decodeURIComponent(currentUrl.search)).not.toContain(
    "/login?callbackUrl=",
  );
});
