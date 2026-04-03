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
          homeUniversityCount: 0,
          totalMappings: 0,
          groups: [],
        }}
      />,
    );

    expect(
      screen.getByText("No approved course mappings yet"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /none of them currently include public course equivalence examples/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Early signal")).toBeInTheDocument();
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
          submissionCount: 4,
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
      screen.getByText("How to read these equivalence examples"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /each card starts from the home university and department/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Home course").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Matched host course").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("3 published mappings")).toBeInTheDocument();
    expect(screen.getByText("2 host universities")).toBeInTheDocument();

    const headings = screen
      .getAllByRole("heading", { level: 3 })
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
