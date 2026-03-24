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
  getServerSideProps,
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
  });

  it("returns notFound for an invalid courses slug", async () => {
    mockGetCourseEquivalences.mockResolvedValue(null);
    mockGetDestinationList.mockResolvedValue([]);

    const result = await getServerSideProps({
      params: { slug: "missing-destination" },
    } as any);

    expect(result).toEqual({ notFound: true });
  });
});
