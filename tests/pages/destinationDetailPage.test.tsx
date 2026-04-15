import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetDestinationReadModel = vi.fn();
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
  getPublicDestinationReadModelBySlug: mockGetDestinationReadModel,
  getPublicDestinationList: mockGetDestinationList,
}));

import DestinationDetailPage, {
  getStaticProps,
} from "../../pages/destinations/[slug]";

describe("destination detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the public destination read model with sparse-data trust signals", () => {
    render(
      <DestinationDetailPage
        destination={{
          slug: "amsterdam-netherlands",
          city: "Amsterdam",
          country: "Netherlands",
          hostUniversityCount: 2,
          submissionCount: 2,
          latestReportSubmittedAt: "2026-02-18T00:00:00.000Z",
          averageRent: null,
          averageMonthlyCost: null,
          detail: {
            slug: "amsterdam-netherlands",
            city: "Amsterdam",
            country: "Netherlands",
            hostUniversityCount: 2,
            submissionCount: 2,
            latestReportSubmittedAt: "2026-02-18T00:00:00.000Z",
            isLimitedData: true,
            averageRent: null,
            averageMonthlyCost: null,
            accommodationSummary: {
              sampleSize: 2,
              isLimitedData: true,
              averageRent: null,
              types: [],
              difficulty: [],
            },
            costSummary: {
              currency: "EUR",
              sampleSize: 2,
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
          },
          accommodation: {
            slug: "amsterdam-netherlands",
            city: "Amsterdam",
            country: "Netherlands",
            hostUniversityCount: 2,
            submissionCount: 2,
            latestReportSubmittedAt: "2026-02-18T00:00:00.000Z",
            isLimitedData: true,
            currency: "EUR",
            sampleSize: 2,
            rentSampleSize: 2,
            averageRent: null,
            recommendationRate: null,
            recommendationSampleSize: 2,
            recommendationYesCount: 1,
            types: [{ type: "Shared flat", count: 2, averageRent: null }],
            difficulty: [],
            commonAreas: [{ name: "Centrum", count: 2 }],
            reviewSnippets: [],
          },
          courseEquivalences: {
            slug: "amsterdam-netherlands",
            city: "Amsterdam",
            country: "Netherlands",
            hostUniversityCount: 2,
            submissionCount: 2,
            latestReportSubmittedAt: "2026-02-18T00:00:00.000Z",
            isLimitedData: true,
            homeUniversityCount: 1,
            totalMappings: 1,
            groups: [
              {
                homeUniversity: "University of Cyprus",
                mappingCount: 1,
                hostUniversities: ["University of Amsterdam"],
                examples: [
                  {
                    homeCourseName: "Algorithms",
                    hostCourseName: "Algorithms and Complexity",
                    credits: 6,
                    recognitionType: "Full equivalence",
                  },
                ],
              },
            ],
          },
        }}
      />,
    );

    expect(
      screen.getByText(
        "Based on 2 student reports · Last updated February 2026",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Limited data — fewer than 3 reports available for this city/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Not enough data").length).toBeGreaterThan(0);
    expect(screen.getByText("Shared flat")).toBeInTheDocument();
    expect(screen.getByText("Centrum (n=2)")).toBeInTheDocument();
    expect(
      screen.getByText(/These are peer examples shared by previous students/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Algorithms")).toBeInTheDocument();
    expect(screen.getByText("Algorithms and Complexity")).toBeInTheDocument();
  });

  it("returns notFound for an invalid destination slug", async () => {
    mockGetDestinationReadModel.mockResolvedValue(null);
    mockGetDestinationList.mockResolvedValue([]);

    const result = await getStaticProps({
      params: { slug: "missing-destination" },
    } as any);

    expect(result).toEqual({ notFound: true });
  });
});
