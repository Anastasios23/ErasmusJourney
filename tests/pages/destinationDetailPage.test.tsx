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
  getStaticProps,
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
          latestReportSubmittedAt: "2026-02-18T00:00:00.000Z",
          isLimitedData: true,
          averageRent: null,
          averageMonthlyCost: null,
          accommodationSummary: {
            sampleSize: 3,
            isLimitedData: true,
            averageRent: null,
            types: [],
            difficulty: [],
          },
          costSummary: {
            currency: "EUR",
            sampleSize: 4,
            isLimitedData: true,
            averageRent: null,
            averageFood: null,
            averageTransport: null,
            averageSocial: null,
            averageTravel: null,
            averageOther: null,
            averageMonthlyCost: null,
          },
          courseSampleSize: 2,
          courseIsLimitedData: true,
          courseEquivalenceExamples: [],
          practicalTips: [],
        }}
      />,
    );

    expect(screen.getAllByText("Limited data").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Based on 4 approved submissions across 2 host universities.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /city-level averages and summary claims stay hidden until at least 5 approved submissions are available/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View housing insights" }),
    ).toHaveAttribute("href", "/destinations/amsterdam-netherlands/accommodation");
    expect(
      screen.getByRole("link", { name: "View course equivalences" }),
    ).toHaveAttribute("href", "/destinations/amsterdam-netherlands/courses");
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
  });

  it("returns notFound for an invalid destination slug", async () => {
    mockGetDestinationDetail.mockResolvedValue(null);
    mockGetDestinationList.mockResolvedValue([]);

    const result = await getStaticProps({
      params: { slug: "missing-destination" },
    } as any);

    expect(result).toEqual({ notFound: true });
  });
});
