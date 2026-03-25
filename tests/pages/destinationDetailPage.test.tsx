import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetDestinationDetail = vi.fn();
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
  getPublicDestinationDetailBySlug: mockGetDestinationDetail,
  getPublicDestinationList: mockGetDestinationList,
}));

import DestinationDetailPage, {
  getServerSideProps,
} from "../../pages/destinations/[slug]";

describe("destination detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the public signal notice for approved destination data", () => {
    render(
      <DestinationDetailPage
        destination={{
          slug: "amsterdam-netherlands",
          city: "Amsterdam",
          country: "Netherlands",
          hostUniversityCount: 2,
          submissionCount: 4,
          averageRent: 650,
          averageMonthlyCost: 1150,
          accommodationSummary: {
            sampleSize: 3,
            averageRent: 650,
            types: [],
            difficulty: [],
          },
          costSummary: {
            currency: "EUR",
            sampleSize: 4,
            averageRent: 650,
            averageFood: 180,
            averageTransport: 70,
            averageSocial: 140,
            averageTravel: 50,
            averageOther: 60,
            averageMonthlyCost: 1150,
          },
          courseEquivalenceExamples: [],
          practicalTips: [],
        }}
      />,
    );

    expect(screen.getByText("Growing sample")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Based on 4 approved submissions across 2 host universities.",
      ),
    ).toBeInTheDocument();
  });

  it("returns notFound for an invalid destination slug", async () => {
    mockGetDestinationDetail.mockResolvedValue(null);
    mockGetDestinationList.mockResolvedValue([]);

    const result = await getServerSideProps({
      params: { slug: "missing-destination" },
    } as any);

    expect(result).toEqual({ notFound: true });
  });
});
