import { describe, expect, it } from "vitest";

import {
  PUBLIC_DESTINATIONS_ACCOMMODATION_FOCUS_ROUTE,
  PUBLIC_DESTINATIONS_COURSES_FOCUS_ROUTE,
  PUBLIC_DESTINATIONS_ROUTE,
  buildPublicDestinationRoute,
} from "../../src/lib/publicRoutes";

describe("public route helpers", () => {
  it("exposes canonical destination-first discovery routes", () => {
    expect(PUBLIC_DESTINATIONS_ROUTE).toBe("/destinations");
    expect(PUBLIC_DESTINATIONS_ACCOMMODATION_FOCUS_ROUTE).toBe(
      "/destinations?focus=accommodation",
    );
    expect(PUBLIC_DESTINATIONS_COURSES_FOCUS_ROUTE).toBe(
      "/destinations?focus=courses",
    );
  });

  it("builds public destination routes from city or city-country data", () => {
    expect(
      buildPublicDestinationRoute({
        city: "Amsterdam",
        country: "Netherlands",
      }),
    ).toBe("/destinations/amsterdam-netherlands");

    expect(
      buildPublicDestinationRoute({
        city: "Sao Paulo",
        subpage: "courses",
      }),
    ).toBe("/destinations/sao-paulo/courses");
  });
});
