import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetCourseEquivalences = vi.fn();
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
  getPublicCourseEquivalencesByDestinationSlug: mockGetCourseEquivalences,
  getPublicDestinationList: mockGetDestinationList,
}));

import CoursesPage, {
  getStaticProps,
} from "../../pages/destinations/[slug]/courses";

describe("destination courses page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the empty state when approved submissions exist but no public course mappings are publishable", () => {
    render(
      <CoursesPage
        destination={{
          slug: "amsterdam-netherlands",
          city: "Amsterdam",
          country: "Netherlands",
          hostUniversityCount: 1,
          submissionCount: 2,
          latestReportSubmittedAt: "2026-02-18T00:00:00.000Z",
          isLimitedData: true,
          homeUniversityCount: 0,
          totalMappings: 0,
          groups: [],
        }}
      />,
    );

    expect(
      screen.getByText("No course examples available yet."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /cross-university summary claims stay hidden until this destination has at least 5 approved submissions and 3 approved course examples/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Limited data").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "Based on 2 approved submissions across 1 host university.",
      ),
    ).toBeInTheDocument();
  });

  it("renders grouped mappings with clearer scanning labels and ordering", () => {
    render(
      <CoursesPage
        destination={{
          slug: "amsterdam-netherlands",
          city: "Amsterdam",
          country: "Netherlands",
          hostUniversityCount: 2,
          submissionCount: 5,
          latestReportSubmittedAt: "2026-02-18T00:00:00.000Z",
          isLimitedData: false,
          homeUniversityCount: 2,
          totalMappings: 4,
          groups: [
            {
              homeUniversity: "University of Nicosia",
              homeDepartment: "Computer Science",
              mappingCount: 1,
              hostUniversities: ["UvA"],
              examples: [
                {
                  homeCourseName: "Algorithms",
                  hostCourseName: "Advanced Algorithms",
                  hostUniversity: "UvA",
                  recognitionType: "Full recognition",
                  notes: "Bring the syllabus to the approval meeting.",
                },
              ],
            },
            {
              homeUniversity: "University of Cyprus",
              homeDepartment: "Business",
              mappingCount: 3,
              hostUniversities: ["VU Amsterdam", "HvA"],
              examples: [
                {
                  homeCourseName: "Marketing Strategy",
                  hostCourseName: "International Marketing",
                  hostUniversity: "VU Amsterdam",
                  recognitionType: "Partial recognition",
                  notes: "Previous students said the case-study workload was manageable.",
                },
              ],
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByText("Course examples in Amsterdam"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/grouped by home university and department/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Home course").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Host course").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Published mappings")).toBeInTheDocument();
    expect(screen.getByText("Home universities")).toBeInTheDocument();

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((element) => element.textContent);
    expect(headings.indexOf("University of Cyprus")).toBeLessThan(
      headings.indexOf("University of Nicosia"),
    );
  });

  it("returns notFound for an invalid courses slug", async () => {
    mockGetCourseEquivalences.mockResolvedValue(null);
    mockGetDestinationList.mockResolvedValue([]);

    const result = await getStaticProps({
      params: { slug: "missing-destination" },
    } as any);

    expect(result).toEqual({ notFound: true });
  });
});
