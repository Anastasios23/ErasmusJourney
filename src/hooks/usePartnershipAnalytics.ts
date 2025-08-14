import { useQuery } from "@tanstack/react-query";

export interface PartnershipAnalytics {
  homeCountry: string;
  hostUniversity: string;
  hostCountry: string;
  hostCity: string;
  submissions: number;
  averageRating?: number;
  averageCost?: number;
  averageAccommodationRating?: number;
  averageAcademicRating?: number;
  lastSubmission?: Date;
  growthTrend: "growing" | "declining" | "stable" | "insufficient_data";
}

export interface UniversityAnalytics {
  university: string;
  country: string;
  city: string;
  submissions: number;
  averageRating?: number;
  averageCost?: number;
}

export interface CountryAnalytics {
  country: string;
  submissions: number;
  universities: number;
  cities: number;
  avgRating?: number;
}

export interface PartnershipAnalyticsResponse {
  overview: {
    totalSubmissions: number;
    uniquePartnerships: number;
    uniqueUniversities: number;
    uniqueCountries: number;
    globalAverageRating?: number;
    timeRange: string;
  };
  partnerships: {
    all: PartnershipAnalytics[];
    top: PartnershipAnalytics[];
  };
  universities: {
    all: UniversityAnalytics[];
    top: UniversityAnalytics[];
  };
  countries: {
    all: CountryAnalytics[];
    top: CountryAnalytics[];
  };
  trends: {
    monthly: Array<{ month: string; submissions: number }>;
  };
}

interface PartnershipAnalyticsFilters {
  timeRange?: "6m" | "12m" | "24m";
  university?: string;
  country?: string;
}

export function usePartnershipAnalytics(
  filters: PartnershipAnalyticsFilters = {},
) {
  const query = new URLSearchParams();

  if (filters.timeRange) query.append("timeRange", filters.timeRange);
  if (filters.university) query.append("university", filters.university);
  if (filters.country) query.append("country", filters.country);

  return useQuery<PartnershipAnalyticsResponse>({
    queryKey: ["partnership-analytics", filters],
    queryFn: async () => {
      const url = `/api/admin/partnerships/analytics${query.toString() ? `?${query.toString()}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch partnership analytics");
      }

      return response.json();
    },
  });
}

export function usePartnershipDetails(partnershipId: string) {
  return useQuery<PartnershipAnalytics>({
    queryKey: ["partnership-details", partnershipId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/partnerships/${partnershipId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch partnership details");
      }

      return response.json();
    },
    enabled: !!partnershipId,
  });
}
