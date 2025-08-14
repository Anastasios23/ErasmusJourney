import { useQuery } from "@tanstack/react-query";
import { GeneratedDestinationData } from "./useGeneratedDestinations";

export interface DestinationsListData {
  destinations: GeneratedDestinationData[];
  total: number;
  page: number;
  limit: number;
}

// Hook to fetch list of generated destinations
export function useGeneratedDestinations(filters?: {
  country?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.country) queryParams.append("country", filters.country);
  if (filters?.featured) queryParams.append("featured", "true");
  if (filters?.page) queryParams.append("page", filters.page.toString());
  if (filters?.limit) queryParams.append("limit", filters.limit.toString());

  return useQuery<DestinationsListData>({
    queryKey: ["generated-destinations", filters],
    queryFn: async () => {
      const response = await fetch(
        `/api/destinations?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch destinations");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
