import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFindMany, mockFindUnique } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    erasmusExperience: {
      findMany: mockFindMany,
      findUnique: mockFindUnique,
    },
  },
}));

import {
  getAdminPublicImpactPreviewByExperienceId,
  getAdminPublicImpactPreviewUnavailableReasonByExperienceId,
  getPublicAccommodationInsightsByDestinationSlug,
  getPublicCourseEquivalencesByDestinationSlug,
  getPublicDestinationDetailBySlug,
} from "../../src/server/publicDestinations";

function createExperienceRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "experience-base",
    status: "APPROVED",
    hostCity: "Amsterdam",
    hostCountry: "Netherlands",
    hostUniversityId: "uva",
    hostUniversity: {
      name: "University of Amsterdam",
    },
    basicInfo: {
      homeUniversity: "University of Cyprus",
      homeDepartment: "Computer Science",
      hostUniversity: "University of Amsterdam",
      hostCity: "Amsterdam",
      hostCountry: "Netherlands",
    },
    accommodation: {
      accommodationType: "shared_apartment",
      monthlyRent: 480,
      currency: "EUR",
      areaOrNeighborhood: "De Pijp",
      difficultyFindingAccommodation: "moderate",
      wouldRecommend: true,
      accommodationReview: "Good transport links and easy bike commute.",
    },
    livingExpenses: {
      rent: 480,
      food: 220,
      transport: 45,
      social: 180,
      travel: 60,
      other: 40,
      currency: "EUR",
    },
    courses: [
      {
        id: "course-1",
        homeCourseName: "Algorithms",
        hostCourseName: "Advanced Algorithms",
        homeECTS: 6,
        hostECTS: 6,
        recognitionType: "full_equivalence",
        notes: "Project-heavy but well structured.",
      },
    ],
    experience: {
      generalTips: "Start house hunting early.",
      academicAdvice: "Ask for syllabi in advance.",
      socialAdvice: "Join ESN events in the first week.",
      bestExperience: "Weekend trips with other Erasmus students.",
    },
    ...overrides,
  };
}

describe("public destination preview-to-approval proof", () => {
  let experiences: Array<Record<string, unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();

    experiences = [
      createExperienceRecord({
        id: "approved-1",
        status: "APPROVED",
      }),
      createExperienceRecord({
        id: "submitted-1",
        status: "SUBMITTED",
        accommodation: {
          accommodationType: "private_apartment",
          monthlyRent: 620,
          currency: "EUR",
          areaOrNeighborhood: "Oud-West",
          difficultyFindingAccommodation: "difficult",
          wouldRecommend: false,
          accommodationReview:
            "More expensive, but close to lectures and grocery stores.",
        },
        livingExpenses: {
          rent: 620,
          food: 260,
          transport: 55,
          social: 210,
          travel: 40,
          other: 35,
          currency: "EUR",
        },
        courses: [
          {
            id: "course-2",
            homeCourseName: "Databases",
            hostCourseName: "Scalable Data Management",
            homeECTS: 6,
            hostECTS: 6,
            recognitionType: "department_elective",
            notes: "Useful SQL and distributed systems overlap.",
          },
        ],
        experience: {
          generalTips: "Budget extra for housing deposits.",
          academicAdvice: "Balance one heavy course with lighter electives.",
          socialAdvice: "Cycle everywhere.",
          bestExperience: "Small-group seminars with international classmates.",
        },
      }),
      createExperienceRecord({
        id: "submitted-missing-destination",
        status: "SUBMITTED",
        hostCity: null,
        hostCountry: "Netherlands",
      }),
    ];

    mockFindMany.mockImplementation(async () =>
      experiences.filter(
        (experience) =>
          experience.status === "APPROVED" &&
          typeof experience.hostCity === "string" &&
          typeof experience.hostCountry === "string",
      ),
    );

    mockFindUnique.mockImplementation(async ({ where }: { where: { id: string } }) =>
      experiences.find((experience) => experience.id === where.id) ?? null,
    );
  });

  it("preview after matches the actual public result after approval", async () => {
    const preview =
      await getAdminPublicImpactPreviewByExperienceId("submitted-1");

    expect(preview).not.toBeNull();
    expect(preview?.slug).toBe("amsterdam-netherlands");

    experiences = experiences.map((experience) =>
      experience.id === "submitted-1"
        ? { ...experience, status: "APPROVED" }
        : experience,
    );

    const [detail, accommodation, courses] = await Promise.all([
      getPublicDestinationDetailBySlug("amsterdam-netherlands"),
      getPublicAccommodationInsightsByDestinationSlug("amsterdam-netherlands"),
      getPublicCourseEquivalencesByDestinationSlug("amsterdam-netherlands"),
    ]);

    expect(detail).toEqual(preview?.destination.after);
    expect(accommodation).toEqual(preview?.accommodation.after);
    expect(courses).toEqual(preview?.courses.after);
  });

  it("reports an explicit unavailable reason when destination identity is incomplete", async () => {
    const preview = await getAdminPublicImpactPreviewByExperienceId(
      "submitted-missing-destination",
    );
    const unavailableReason =
      await getAdminPublicImpactPreviewUnavailableReasonByExperienceId(
        "submitted-missing-destination",
      );

    expect(preview).toBeNull();
    expect(unavailableReason).toEqual({
      code: "INCOMPLETE_DESTINATION_IDENTITY",
      message:
        "Cannot preview or publish this submission to public destination pages until the destination city and country are complete.",
      missingFields: ["hostCity"],
    });
  });
});
