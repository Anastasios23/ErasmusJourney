import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PublicImpactPreview from "../../src/components/admin/PublicImpactPreview";

describe("PublicImpactPreview", () => {
  it("renders safely when accommodation aggregates are partially unavailable", () => {
    render(
      <PublicImpactPreview
        preview={
          {
            slug: "barcelona-spain",
            city: "Barcelona",
            country: "Spain",
            destination: {
              isNewDestination: true,
              before: null,
              after: {
                submissionCount: 1,
                averageRent: 650,
                averageMonthlyCost: 1200,
                costSummary: { currency: "EUR" },
              },
            },
            accommodation: {
              before: null,
              after: null,
              contribution: null,
            },
            courses: {
              before: null,
              after: {
                totalMappings: 0,
                homeUniversityCount: 0,
                groups: [],
              },
              contributionCount: 0,
              contributionExamples: [],
            },
          } as any
        }
      />,
    );

    expect(
      screen.getByText(/Public routes after approval:/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Preview includes current submission"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("/destinations/barcelona-spain/accommodation"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
  });
});
