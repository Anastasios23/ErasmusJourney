type JsonObject = Record<string, unknown>;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectStatus(url: string, expected: number): Promise<Response> {
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  assert(
    response.status === expected,
    `Expected ${expected} for ${url}, got ${response.status}`,
  );
  return response;
}

async function main(): Promise<void> {
  const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";
  const notFoundSlug = "__destination-not-found-smoke__";

  console.log(`Running public destination smoke checks against ${baseUrl}`);

  await expectStatus(`${baseUrl}/destinations`, 200);

  const listResponse = await expectStatus(
    `${baseUrl}/api/public/destinations`,
    200,
  );
  const listPayload = (await listResponse.json()) as JsonObject;
  assert(
    Array.isArray(listPayload.destinations),
    "destinations must be an array",
  );

  const destinations = listPayload.destinations as Array<{ slug?: unknown }>;

  if (destinations.length > 0 && typeof destinations[0]?.slug === "string") {
    const slug = destinations[0].slug;
    await expectStatus(`${baseUrl}/api/public/destinations/${slug}`, 200);
    await expectStatus(`${baseUrl}/destinations/${slug}`, 200);
  } else {
    console.log("No destinations returned; skipping existing-slug checks.");
  }

  await expectStatus(`${baseUrl}/api/public/destinations/${notFoundSlug}`, 404);
  await expectStatus(`${baseUrl}/destinations/${notFoundSlug}`, 404);

  console.log("Public destination smoke checks passed.");
}

main().catch((error) => {
  console.error("Public destination smoke checks failed:", error);
  process.exit(1);
});
