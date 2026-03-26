import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AccommodationExperienceCard from "../../src/components/AccommodationExperienceCard";

describe("AccommodationExperienceCard", () => {
  it("routes full details traffic to the canonical destination accommodation page", () => {
    render(
      <AccommodationExperienceCard
        accommodation={{
          id: "acc-1",
          studentName: "Maria K.",
          city: "Amsterdam",
          country: "Netherlands",
          university: "UvA",
          universityInCyprus: "UCY",
          accommodationType: "shared-apartment",
          monthlyRent: 650,
          currency: "EUR",
          rating: 4.5,
          createdAt: "2026-03-26T10:00:00.000Z",
          isReal: true,
        }}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Open Housing Page" }),
    ).toHaveAttribute("href", "/destinations/amsterdam-netherlands/accommodation");
  });
});
