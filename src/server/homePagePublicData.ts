import {
  getPublicDestinationSignalSummary,
  type PublicDestinationSignalTone,
} from "../lib/publicDestinationPresentation";
import type { PublicDestinationListItem } from "../types/publicDestinations";
import { getPublicDestinationList } from "./publicDestinations";

export interface HomePagePublicStats {
  totalDestinations: number | null;
  totalHostUniversities: number | null;
  totalApprovedSubmissions: number | null;
  strongerSignalDestinations: number | null;
}

export interface HomePageFeaturedDestinationData {
  slug: string;
  city: string;
  country: string;
  submissionCount: number;
  hostUniversityCount: number;
  signalLabel: string;
  signalTone: PublicDestinationSignalTone;
}

export interface HomePagePublicData {
  isAvailable: boolean;
  stats: HomePagePublicStats;
  featuredDestinations: HomePageFeaturedDestinationData[];
}

const unavailableStats: HomePagePublicStats = {
  totalDestinations: null,
  totalHostUniversities: null,
  totalApprovedSubmissions: null,
  strongerSignalDestinations: null,
};

export function buildHomePagePublicStats(
  destinations: PublicDestinationListItem[],
): HomePagePublicStats {
  return {
    totalDestinations: destinations.length,
    totalHostUniversities: destinations.reduce(
      (total, destination) => total + destination.hostUniversityCount,
      0,
    ),
    totalApprovedSubmissions: destinations.reduce(
      (total, destination) => total + destination.submissionCount,
      0,
    ),
    strongerSignalDestinations: destinations.filter(
      (destination) =>
        getPublicDestinationSignalSummary(
          destination.submissionCount,
          destination.hostUniversityCount,
        ).label === "Stronger signal",
    ).length,
  };
}

export function buildHomePageFeaturedDestinations(
  destinations: PublicDestinationListItem[],
): HomePageFeaturedDestinationData[] {
  return [...destinations]
    .sort((left, right) => {
      if (right.submissionCount !== left.submissionCount) {
        return right.submissionCount - left.submissionCount;
      }

      return left.city.localeCompare(right.city);
    })
    .slice(0, 4)
    .map((destination) => {
      const signal = getPublicDestinationSignalSummary(
        destination.submissionCount,
        destination.hostUniversityCount,
      );

      return {
        slug: destination.slug,
        city: destination.city,
        country: destination.country,
        submissionCount: destination.submissionCount,
        hostUniversityCount: destination.hostUniversityCount,
        signalLabel: signal.label,
        signalTone: signal.tone,
      };
    });
}

export async function loadHomePagePublicData(): Promise<HomePagePublicData> {
  try {
    const destinations = await getPublicDestinationList();

    return {
      isAvailable: true,
      stats: buildHomePagePublicStats(destinations),
      featuredDestinations: buildHomePageFeaturedDestinations(destinations),
    };
  } catch (error) {
    console.error("Failed to load homepage public destination data:", error);

    return {
      isAvailable: false,
      stats: unavailableStats,
      featuredDestinations: [],
    };
  }
}
