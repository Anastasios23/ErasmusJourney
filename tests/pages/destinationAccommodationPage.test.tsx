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
  getServerSideProps,
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
  });

  it("returns notFound for an invalid accommodation slug", async () => {
    mockGetAccommodationInsights.mockResolvedValue(null);
    mockGetDestinationList.mockResolvedValue([]);

    const result = await getServerSideProps({
      params: { slug: "missing-destination" },
    } as any);

    expect(result).toEqual({ notFound: true });
  });
});
