import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockExperienceFindMany,
  mockExperienceFindUnique,
  mockReadModelFindMany,
  mockReadModelDeleteMany,
  mockReadModelUpsert,
  mockTransaction,
} = vi.hoisted(() => ({
  mockExperienceFindMany: vi.fn(),
  mockExperienceFindUnique: vi.fn(),
  mockReadModelFindMany: vi.fn(),
  mockReadModelDeleteMany: vi.fn(),
  mockReadModelUpsert: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    erasmusExperience: {
      findMany: mockExperienceFindMany,
      findUnique: mockExperienceFindUnique,
    },
    publicDestinationReadModel: {
      findMany: mockReadModelFindMany,
      deleteMany: mockReadModelDeleteMany,
      upsert: mockReadModelUpsert,
    },
    $transaction: mockTransaction,
  },
}));

import {
  getAdminPublicImpactPreviewByExperienceId,
  getAdminPublicImpactPreviewUnavailableReasonByExperienceId,
  getPublicAccommodationInsightsByDestinationSlug,
  getPublicCourseEquivalencesByDestinationSlug,
  getPublicDestinationDetailBySlug,
  getPublicDestinationList,
  invalidatePublicDestinationReadModel,
  refreshPublicDestinationReadModel,
} from "../../src/server/publicDestinations";

function createExperienceRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "experience-base",
    status: "APPROVED",
    hostCity: "Amsterdam",
    hostCountry: "Netherlands",
    hostUniversityId: "uva",
    submittedAt: new Date("2026-01-12T00:00:00.000Z"),
    updatedAt: new Date("2026-01-12T00:00:00.000Z"),
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
      accommodationRating: 4,
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
    adminNotes: null,
    publicWordingOverrides: null,
    ...overrides,
  };
}

describe("public destination preview-to-approval proof", () => {
  let experiences: Array<Record<string, unknown>>;
  let persistedRows: Array<Record<string, unknown>>;

  beforeEach(() => {
    vi.clearAllMocks();
    invalidatePublicDestinationReadModel();

    persistedRows = [];
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
          accommodationRating: 3,
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

    mockExperienceFindMany.mockImplementation(async () =>
      experiences.filter(
        (experience) =>
          experience.status === "APPROVED" &&
          typeof experience.hostCity === "string" &&
          typeof experience.hostCountry === "string",
      ),
    );

    mockExperienceFindUnique.mockImplementation(
      async ({ where }: { where: { id: string } }) =>
        experiences.find((experience) => experience.id === where.id) ?? null,
    );

    mockReadModelFindMany.mockImplementation(async () => persistedRows);
    mockReadModelDeleteMany.mockImplementation(
      async (args?: { where?: { slug?: { notIn?: string[] } } }) => {
        const notIn = args?.where?.slug?.notIn;

        if (!notIn) {
          persistedRows = [];
          return { count: 0 };
        }

        persistedRows = persistedRows.filter((row) => notIn.includes(row.slug as string));
        return { count: 0 };
      },
    );
    mockReadModelUpsert.mockImplementation(
      async (args: {
        where: { slug: string };
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        const slug = args.where.slug;
        const existingIndex = persistedRows.findIndex((row) => row.slug === slug);
        const nextRow =
          existingIndex === -1
            ? { ...args.create }
            : { ...persistedRows[existingIndex], ...args.update, slug };

        if (existingIndex === -1) {
          persistedRows.push(nextRow);
        } else {
          persistedRows[existingIndex] = nextRow;
        }

        return nextRow;
      },
    );
    mockTransaction.mockImplementation(async (callback: any) =>
      callback({
        publicDestinationReadModel: {
          deleteMany: mockReadModelDeleteMany,
          upsert: mockReadModelUpsert,
        },
      }),
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

    await refreshPublicDestinationReadModel();
    invalidatePublicDestinationReadModel();

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
      code: "INCOMPLETE_MINIMUM_PUBLIC_CONTRACT",
      message:
        "Cannot preview or publish this submission until the MVP minimum public contract is complete: host city, host country, host university, home university, accommodation type, monthly rent, and at least one complete course-equivalence example.",
      missingFields: ["hostCity"],
    });
  });

  it("blocks preview when the MVP minimum public contract is incomplete", async () => {
    experiences = [
      createExperienceRecord({
        id: "submitted-incomplete-contract",
        status: "SUBMITTED",
        accommodation: {
          currency: "EUR",
        },
        livingExpenses: {
          currency: "EUR",
          food: null,
          transport: null,
          social: null,
          travel: null,
          other: null,
        },
        courses: [],
      }),
    ];

    const preview = await getAdminPublicImpactPreviewByExperienceId(
      "submitted-incomplete-contract",
    );
    const unavailableReason =
      await getAdminPublicImpactPreviewUnavailableReasonByExperienceId(
        "submitted-incomplete-contract",
      );

    expect(preview).toBeNull();
    expect(unavailableReason).toEqual({
      code: "INCOMPLETE_MINIMUM_PUBLIC_CONTRACT",
      message:
        "Cannot preview or publish this submission until the MVP minimum public contract is complete: host city, host country, host university, home university, accommodation type, monthly rent, and at least one complete course-equivalence example.",
      missingFields: [
        "accommodationType",
        "monthlyRent",
        "courseMappings",
      ],
    });
  });

  it("allows preview when only enrichment fields are missing", async () => {
    experiences = [
      createExperienceRecord({
        id: "submitted-minimum-only",
        status: "SUBMITTED",
        basicInfo: {
          homeUniversity: "University of Cyprus",
          hostUniversity: "University of Amsterdam",
          hostCity: "Amsterdam",
          hostCountry: "Netherlands",
        },
        accommodation: {
          accommodationType: "shared_apartment",
          monthlyRent: 500,
          currency: "EUR",
        },
        livingExpenses: {
          currency: "EUR",
          food: null,
          transport: null,
          social: null,
          travel: null,
          other: null,
        },
        courses: [
          {
            id: "course-minimum",
            homeCourseName: "Algorithms",
            homeECTS: 6,
            hostCourseName: "Advanced Algorithms",
            hostECTS: 6,
            recognitionType: "full_equivalence",
          },
        ],
      }),
    ];

    const preview = await getAdminPublicImpactPreviewByExperienceId(
      "submitted-minimum-only",
    );
    const unavailableReason =
      await getAdminPublicImpactPreviewUnavailableReasonByExperienceId(
        "submitted-minimum-only",
      );

    expect(preview).not.toBeNull();
    expect(preview?.slug).toBe("amsterdam-netherlands");
    expect(unavailableReason).toBeNull();
  });

  it("omits undefined optional course fields from public destination payloads", async () => {
    experiences = [
      createExperienceRecord({
        id: "approved-serialization",
        basicInfo: {
          homeUniversity: "University of Cyprus",
          hostCity: "Amsterdam",
          hostCountry: "Netherlands",
        },
        hostUniversity: null,
        courses: [
          {
            id: "course-serialization",
            homeCourseName: "Operating Systems",
            hostCourseName: "Distributed Operating Systems",
            homeECTS: 6,
            hostECTS: 6,
            recognitionType: "full_equivalence",
            notes: undefined,
          },
        ],
      }),
    ];

    await refreshPublicDestinationReadModel();
    invalidatePublicDestinationReadModel();

    const [detail, courses] = await Promise.all([
      getPublicDestinationDetailBySlug("amsterdam-netherlands"),
      getPublicCourseEquivalencesByDestinationSlug("amsterdam-netherlands"),
    ]);

    expect(detail).not.toBeNull();
    expect(courses).not.toBeNull();
    expect(detail?.courseEquivalenceExamples[0]).not.toHaveProperty("notes");
    expect(courses?.groups[0]).not.toHaveProperty("homeDepartment");
    expect(courses?.groups[0]?.examples[0]).not.toHaveProperty("hostUniversity");
    expect(courses?.groups[0]?.examples[0]).not.toHaveProperty("notes");
    expect(JSON.parse(JSON.stringify(detail))).toEqual(detail);
    expect(JSON.parse(JSON.stringify(courses))).toEqual(courses);
  });

  it("applies audited wording overrides to public destination output", async () => {
    experiences = [
      createExperienceRecord({
        id: "approved-moderated-wording",
        publicWordingOverrides: {
          accommodationReview: "Edited public housing note.",
          generalTips: "Edited public general tip.",
          courseNotes: {
            "course-1": "Edited public course note.",
          },
        },
      }),
    ];

    await refreshPublicDestinationReadModel();
    invalidatePublicDestinationReadModel();

    const [detail, accommodation, courses] = await Promise.all([
      getPublicDestinationDetailBySlug("amsterdam-netherlands"),
      getPublicAccommodationInsightsByDestinationSlug("amsterdam-netherlands"),
      getPublicCourseEquivalencesByDestinationSlug("amsterdam-netherlands"),
    ]);

    expect(detail?.practicalTips).toContain("Edited public general tip.");
    expect(detail?.practicalTips).not.toContain("Start house hunting early.");
    expect(accommodation?.reviewSnippets).toContain(
      "Edited public housing note.",
    );
    expect(courses?.groups[0]?.examples[0]?.notes).toBe(
      "Edited public course note.",
    );
  });

  it("ignores adminNotes JSON when no canonical public wording overrides exist", async () => {
    experiences = [
      createExperienceRecord({
        id: "approved-legacy-admin-notes",
        adminNotes: JSON.stringify({
          publicWordingEdits: {
            generalTips: "Legacy JSON should not leak to public output.",
          },
        }),
        publicWordingOverrides: null,
      }),
    ];

    await refreshPublicDestinationReadModel();
    invalidatePublicDestinationReadModel();

    const detail = await getPublicDestinationDetailBySlug("amsterdam-netherlands");

    expect(detail?.practicalTips).toContain("Start house hunting early.");
    expect(detail?.practicalTips).not.toContain(
      "Legacy JSON should not leak to public output.",
    );
  });

  it("serves the persisted read model across list and detail lookups until invalidated", async () => {
    await refreshPublicDestinationReadModel();
    invalidatePublicDestinationReadModel();

    await Promise.all([
      getPublicDestinationList(),
      getPublicDestinationDetailBySlug("amsterdam-netherlands"),
      getPublicAccommodationInsightsByDestinationSlug("amsterdam-netherlands"),
      getPublicCourseEquivalencesByDestinationSlug("amsterdam-netherlands"),
    ]);

    expect(mockReadModelFindMany).toHaveBeenCalledTimes(1);
    expect(mockExperienceFindMany).toHaveBeenCalledTimes(1);

    experiences = [];

    invalidatePublicDestinationReadModel();

    const destinations = await getPublicDestinationList();

    expect(destinations).toHaveLength(1);
    expect(mockReadModelFindMany).toHaveBeenCalledTimes(2);
    expect(mockExperienceFindMany).toHaveBeenCalledTimes(1);
  });

  it("propagates freshness metadata from the latest approved report into list and detail payloads", async () => {
    experiences = [
      createExperienceRecord({
        id: "approved-older",
        submittedAt: new Date("2026-01-05T00:00:00.000Z"),
        updatedAt: new Date("2026-01-05T00:00:00.000Z"),
      }),
      createExperienceRecord({
        id: "approved-newer",
        submittedAt: new Date("2026-02-18T00:00:00.000Z"),
        updatedAt: new Date("2026-02-18T00:00:00.000Z"),
      }),
    ];

    await refreshPublicDestinationReadModel();
    invalidatePublicDestinationReadModel();

    const [destinations, detail] = await Promise.all([
      getPublicDestinationList(),
      getPublicDestinationDetailBySlug("amsterdam-netherlands"),
    ]);

    expect(destinations[0]?.latestReportSubmittedAt).toBe(
      "2026-02-18T00:00:00.000Z",
    );
    expect(detail?.latestReportSubmittedAt).toBe("2026-02-18T00:00:00.000Z");
  });

  it("does not lazily rebuild the persisted read model on production reads when rows are missing", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    process.env.NODE_ENV = "production";
    persistedRows = [];
    invalidatePublicDestinationReadModel();

    try {
      const destinations = await getPublicDestinationList();

      expect(destinations).toEqual([]);
      expect(mockReadModelFindMany).toHaveBeenCalledTimes(1);
      expect(mockExperienceFindMany).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Persisted public destination read model is empty.",
        ),
      );
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
      warnSpy.mockRestore();
    }
  });
});
