import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetPublicDestinationList,
  mockGetPublicCourseEquivalencesByDestinationSlug,
} = vi.hoisted(() => ({
  mockGetPublicDestinationList: vi.fn(),
  mockGetPublicCourseEquivalencesByDestinationSlug: vi.fn(),
}));

vi.mock("../../src/server/publicDestinations", () => ({
  getPublicDestinationList: mockGetPublicDestinationList,
  getPublicCourseEquivalencesByDestinationSlug:
    mockGetPublicCourseEquivalencesByDestinationSlug,
}));

import { getStaticProps } from "../../pages/course-matching-experiences";

describe("course matching experiences page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds public course examples from destination read-model data", async () => {
    mockGetPublicDestinationList.mockResolvedValue([
      {
        slug: "amsterdam-netherlands",
        city: "Amsterdam",
        country: "Netherlands",
      },
    ]);

    mockGetPublicCourseEquivalencesByDestinationSlug.mockResolvedValue({
      slug: "amsterdam-netherlands",
      city: "Amsterdam",
      country: "Netherlands",
      hostUniversityCount: 1,
      submissionCount: 1,
      latestReportSubmittedAt: null,
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
              hostCourseName: "Algorithms and Data Structures",
              hostUniversity: "University of Amsterdam",
              credits: 6,
              recognitionType: "Full equivalence",
            },
          ],
        },
      ],
    });

    const result = await getStaticProps({} as any);

    expect(result).toEqual({
      props: {
        examples: [
          {
            homeUniversity: "University of Cyprus",
            homeCourseName: "Algorithms",
            hostUniversity: "University of Amsterdam",
            hostCity: "Amsterdam",
            hostCourseName: "Algorithms and Data Structures",
            credits: 6,
            recognitionType: "Full equivalence",
          },
        ],
      },
      revalidate: 3600,
    });
  });
});
