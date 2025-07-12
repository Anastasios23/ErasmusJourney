import { useQuery } from "@tanstack/react-query";

export interface EnrichedDestination {
  id: string;
  country: string;
  city: string;
  university: string;
  universityShort: string;
  partnerUniversities: string[];
  language: string;
  costOfLiving: "low" | "medium" | "high";
  averageRent: number;
  popularWith: string[];
  imageUrl: string;
  description: string;
  // Enhanced fields from API
  userStories: any[];
  userAccommodationTips: any[];
  userCourseMatches: any[];
  userReviews: any[];
  detailedInfo?: {
    population: number;
    language: string;
    currency: string;
    climate: string;
    timezone: string;
  };
  livingCosts?: {
    accommodation: { min: number; max: number };
    food: { min: number; max: number };
    transport: number;
    entertainment: { min: number; max: number };
  };
  transportation?: {
    publicTransport: string;
    bikeRentals: boolean;
    walkability: number;
    nearestAirport: string;
  };
  attractions?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  studentLife?: {
    nightlife: number;
    culture: number;
    sports: number;
    internationalCommunity: number;
  };
  practicalInfo?: {
    visa: string;
    healthcare: string;
    bankingTips: string;
    simCard: string;
  };
  gallery?: string[];
}

// Hook to fetch all destinations
export function useDestinations() {
  return useQuery<EnrichedDestination[]>({
    queryKey: ["destinations"],
    queryFn: async () => {
      const response = await fetch("/api/destinations");
      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch a specific destination by ID
export function useDestination(id: string) {
  return useQuery<EnrichedDestination>({
    queryKey: ["destination", id],
    queryFn: async () => {
      const response = await fetch(`/api/destinations/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch destination");
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for searching and filtering destinations
export function useDestinationSearch(searchParams: {
  search?: string;
  country?: string;
  costLevel?: string;
  university?: string;
}) {
  return useQuery<EnrichedDestination[]>({
    queryKey: ["destinations", "search", searchParams],
    queryFn: async () => {
      const response = await fetch("/api/destinations");
      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
      }

      let destinations: EnrichedDestination[] = await response.json();

      // Apply client-side filtering
      if (searchParams.search) {
        const search = searchParams.search.toLowerCase();
        destinations = destinations.filter(
          (dest) =>
            dest.city.toLowerCase().includes(search) ||
            dest.country.toLowerCase().includes(search) ||
            dest.university.toLowerCase().includes(search) ||
            dest.description.toLowerCase().includes(search),
        );
      }

      if (searchParams.country && searchParams.country !== "all") {
        destinations = destinations.filter(
          (dest) => dest.country === searchParams.country,
        );
      }

      if (searchParams.costLevel && searchParams.costLevel !== "all") {
        destinations = destinations.filter(
          (dest) => dest.costOfLiving === searchParams.costLevel,
        );
      }

      if (searchParams.university && searchParams.university !== "all") {
        destinations = destinations.filter(
          (dest) =>
            dest.university.includes(searchParams.university!) ||
            dest.partnerUniversities.some((uni) =>
              uni.includes(searchParams.university!),
            ),
        );
      }

      return destinations;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Types for destination averages
export interface DestinationAverages {
  city: string;
  totalSubmissions: number;
  averages: {
    livingCosts: {
      rent: number | null;
      food: number | null;
      transport: number | null;
      entertainment: number | null;
      total: number | null;
    };
    ratings: {
      overall: number | null;
      accommodation: number | null;
      socialLife: number | null;
      academics: number | null;
      costOfLiving: number | null;
    };
    recommendations: {
      wouldRecommend: number;
      totalResponses: number;
    };
  };
  recentSubmissions: Array<{
    id: string;
    type: string;
    title: string;
    excerpt: string;
    author: string;
    createdAt: string;
  }>;
  topTips: string[];
  accommodationTypes: Array<{
    type: string;
    count: number;
    averageRent: number | null;
  }>;
}

// Hook to fetch destination averages based on student submissions
export function useDestinationAverages(destinationId: string) {
  return useQuery<DestinationAverages>({
    queryKey: ["destination-averages", destinationId],
    queryFn: async () => {
      const response = await fetch(
        `/api/destinations/${encodeURIComponent(destinationId)}/averages`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch destination averages");
      }
      return response.json();
    },
    enabled: !!destinationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
