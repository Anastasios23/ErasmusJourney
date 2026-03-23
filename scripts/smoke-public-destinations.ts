type JsonObject = Record<string, unknown>;

type ListDestination = {
  slug?: unknown;
  city?: unknown;
  country?: unknown;
  submissionCount?: unknown;
};

function assertNonEmptyString(value: unknown, fieldName: string): void {
  assert(
    typeof value === "string" && value.trim().length > 0,
    `${fieldName} must be a non-empty string`,
  );
}

function assertNumber(value: unknown, fieldName: string): void {
  assert(
    typeof value === "number" && Number.isFinite(value),
    `${fieldName} must be a finite number`,
  );
}

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

  const destinations = listPayload.destinations as ListDestination[];

  if (destinations.length > 0) {
    const first = destinations[0];
    assertNonEmptyString(first.slug, "destination.slug");
    assertNonEmptyString(first.city, "destination.city");
    assertNonEmptyString(first.country, "destination.country");
    assertNumber(first.submissionCount, "destination.submissionCount");
  }

  if (destinations.length > 0 && typeof destinations[0]?.slug === "string") {
    const slug = destinations[0].slug;
    const detailResponse = await expectStatus(
      `${baseUrl}/api/public/destinations/${slug}`,
      200,
    );
    const detailPayload = (await detailResponse.json()) as JsonObject;

    assert(
      detailPayload.destination &&
        typeof detailPayload.destination === "object",
      "detail.destination must be an object",
    );

    const destination = detailPayload.destination as JsonObject;
    assertNonEmptyString(destination.slug, "detail.destination.slug");
    assertNonEmptyString(destination.city, "detail.destination.city");
    assertNonEmptyString(destination.country, "detail.destination.country");
    assertNumber(
      destination.submissionCount,
      "detail.destination.submissionCount",
    );

    assert(
      destination.costSummary && typeof destination.costSummary === "object",
      "detail.destination.costSummary must be an object",
    );
    assert(
      destination.accommodationSummary &&
        typeof destination.accommodationSummary === "object",
      "detail.destination.accommodationSummary must be an object",
    );

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
