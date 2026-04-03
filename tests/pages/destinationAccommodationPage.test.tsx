import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAccommodationInsights = vi.fn();
const mockGetDestinationList = vi.fn();

vi.mock("next/head", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../../components/Header", () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock("../../src/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

vi.mock("../../src/components/PublicDestinationSubnav", () => ({
  default: () => <div data-testid="public-subnav" />,
}));

vi.mock("../../src/server/publicDestinations", () => ({
  getPublicAccommodationInsightsByDestinationSlug: mockGetAccommodationInsights,
  getPublicDestinationList: mockGetDestinationList,
}));

import AccommodationPage, {
  getStaticProps,
} from "../../pages/destinations/[slug]/accommodation";

describe("destination accommodation page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the empty state when approved submissions exist but no public accommodation data is available", () => {
    render(
      <AccommodationPage
        destination={{
          slug: "amsterdam-netherlands",
          city: "Amsterdam",
          country: "Netherlands",
          hostUniversityCount: 1,
          submissionCount: 2,
          currency: "EUR",
          sampleSize: 0,
          rentSampleSize: 0,
          averageRent: null,
          recommendationRate: null,
          recommendationSampleSize: 0,
          recommendationYesCount: 0,
          types: [],
          difficulty: [],
          commonAreas: [],
          reviewSnippets: [],
        }}
      />,
    );

    expect(
      screen.getByText("No approved accommodation insights yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /none of them currently include public accommodation data/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Early signal")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Based on 2 approved submissions across 1 host university.",
      ),
    ).toBeInTheDocument();
  });

  it("renders a clearer housing snapshot when accommodation data is available", () => {
    render(
      <AccommodationPage
        destination={{
          slug: "amsterdam-netherlands",
          city: "Amsterdam",
          country: "Netherlands",
          hostUniversityCount: 2,
          submissionCount: 4,
          currency: "EUR",
          sampleSize: 4,
          rentSampleSize: 3,
          averageRent: 680,
          recommendationRate: 75,
          recommendationSampleSize: 4,
          recommendationYesCount: 3,
          types: [
            { type: "Shared flat", count: 2, averageRent: 640 },
            { type: "Student residence", count: 1, averageRent: 720 },
          ],
          difficulty: [
            { level: "Moderate", count: 2 },
            { level: "Easy", count: 1 },
          ],
          commonAreas: [
            { name: "De Pijp", count: 2 },
            { name: "Oost", count: 1 },
          ],
          reviewSnippets: ["Start your search early because the best rooms go fast."],
        }}
      />,
    );

    expect(screen.getByText("Housing snapshot")).toBeInTheDocument();
    expect(
      screen.getByText(
        /use these signals to compare the typical housing experience/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Average rent is based on 3 reports."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/most reported housing type:/i),
    ).toBeInTheDocument();
    expect(screen.getByText("2 reports | 50%")).toBeInTheDocument();
    expect(
      screen.getByText(/generalized area mentions most often point to de pijp/i),
    ).toBeInTheDocument();
  });

  it("returns notFound for an invalid accommodation slug", async () => {
    mockGetAccommodationInsights.mockResolvedValue(null);
    mockGetDestinationList.mockResolvedValue([]);

    const result = await getStaticProps({
      params: { slug: "missing-destination" },
    } as any);

    expect(result).toEqual({ notFound: true });
  });
});
