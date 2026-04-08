import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUniversityFindFirst } = vi.hoisted(() => ({
  mockUniversityFindFirst: vi.fn(),
}));

vi.mock("../../lib/prisma", () => ({
  prisma: {
    universities: {
      findFirst: mockUniversityFindFirst,
    },
  },
}));

import { buildBasicInfoPersistenceData } from "../../src/server/erasmusExperience/basicInfoPersistence";

describe("basicInfoPersistence agreements validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUniversityFindFirst.mockImplementation(
      async ({ where }: { where: { OR: Array<Record<string, string>> } }) => {
        const values = where.OR.flatMap((entry) => Object.values(entry));

        if (values.includes("UCY") || values.includes("University of Cyprus")) {
          return {
            id: "ucy-id",
            name: "University of Cyprus",
            city: "Nicosia",
            country: "Cyprus",
          };
        }

        return null;
      },
    );
  });

  it("rejects departments outside the agreements dataset scope", async () => {
    await expect(
      buildBasicInfoPersistenceData(
        {
          homeUniversityCode: "UCY",
          homeUniversity: "University of Cyprus",
          homeDepartment: "Imaginary Department",
          levelOfStudy: "Bachelor",
        },
        null,
      ),
    ).rejects.toMatchObject({
      statusCode: 422,
      body: expect.objectContaining({
        code: "INVALID_HOME_DEPARTMENT",
      }),
    });
  });

  it("rejects host selections outside the agreements dataset scope", async () => {
    await expect(
      buildBasicInfoPersistenceData(
        {
          homeUniversityCode: "UCY",
          homeUniversity: "University of Cyprus",
          homeDepartment: "Classics And Philosophy",
          levelOfStudy: "Bachelor",
          hostUniversity: "Fake University",
          hostCity: "Amsterdam",
          hostCountry: "Netherlands",
        },
        null,
      ),
    ).rejects.toMatchObject({
      statusCode: 422,
      body: expect.objectContaining({
        code: "INELIGIBLE_EXCHANGE_PATH",
      }),
    });
  });

  it("accepts an eligible agreement-backed exchange path", async () => {
    const result = await buildBasicInfoPersistenceData(
      {
        homeUniversityCode: "UCY",
        homeUniversity: "University of Cyprus",
        homeDepartment: "Classics And Philosophy",
        levelOfStudy: "Bachelor",
        hostUniversity: "University Of Amsterdam",
        hostCity: "Amsterdam",
        hostCountry: "Netherlands",
        exchangeAcademicYear: "2026/2027",
        exchangePeriod: "Fall",
      },
      null,
    );

    expect(result).toMatchObject({
      homeUniversityId: "ucy-id",
      hostUniversityId: null,
      hostCity: "Amsterdam",
      hostCountry: "Netherlands",
      semester: "2026/2027 Fall",
      basicInfo: expect.objectContaining({
        homeDepartment: "Classics And Philosophy",
        hostUniversity: "University Of Amsterdam",
      }),
    });
  });
});
