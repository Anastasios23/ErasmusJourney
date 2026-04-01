import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetPublicDestinationList } = vi.hoisted(() => ({
  mockGetPublicDestinationList: vi.fn(),
}));

vi.mock("../../src/server/publicDestinations", () => ({
  getPublicDestinationList: mockGetPublicDestinationList,
}));

import { loadHomePagePublicData } from "../../src/server/homePagePublicData";

describe("homePagePublicData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("derives homepage stats and featured destinations from approved public destination aggregates", async () => {
    mockGetPublicDestinationList.mockResolvedValue([
      {
        slug: "barcelona-spain",
        city: "Barcelona",
        country: "Spain",
        hostUniversityCount: 3,
        submissionCount: 7,
        averageRent: 580,
        averageMonthlyCost: 1080,
      },
      {
        slug: "amsterdam-netherlands",
        city: "Amsterdam",
        country: "Netherlands",
        hostUniversityCount: 2,
        submissionCount: 4,
        averageRent: 720,
        averageMonthlyCost: 1310,
      },
      {
        slug: "prague-czechia",
        city: "Prague",
        country: "Czech Republic",
        hostUniversityCount: 1,
        submissionCount: 2,
        averageRent: 430,
        averageMonthlyCost: 910,
      },
    ]);

    const result = await loadHomePagePublicData();

    expect(result).toMatchObject({
      isAvailable: true,
      stats: {
        totalDestinations: 3,
        totalHostUniversities: 6,
        totalApprovedSubmissions: 13,
        strongerSignalDestinations: 1,
      },
    });
    expect(result.featuredDestinations.map((destination) => destination.slug)).toEqual([
      "barcelona-spain",
      "amsterdam-netherlands",
      "prague-czechia",
    ]);
    expect(result.featuredDestinations[0]).toMatchObject({
      city: "Barcelona",
      signalLabel: "Stronger signal",
      signalTone: "success",
    });
  });

  it("returns an explicit unavailable state when the public destination query fails", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mockGetPublicDestinationList.mockRejectedValue(
      new Error("Environment variable not found: DATABASE_URL"),
    );

    await expect(loadHomePagePublicData()).resolves.toEqual({
      isAvailable: false,
      stats: {
        totalDestinations: null,
        totalHostUniversities: null,
        totalApprovedSubmissions: null,
        strongerSignalDestinations: null,
      },
      featuredDestinations: [],
    });

    consoleError.mockRestore();
  });
});
