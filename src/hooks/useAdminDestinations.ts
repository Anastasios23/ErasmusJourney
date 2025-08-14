import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminDestination {
  id: string;
  slug: string;
  city: string;
  country: string;
  totalSubmissions: number;
  averageRating?: number;
  averageMonthlyCost?: number;
  status: string;
  featured: boolean;
  adminTitle?: string;
  adminDescription?: string;
  adminImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  accommodations: any[];
  courseExchanges: any[];
}

interface AdminDestinationsResponse {
  destinations: AdminDestination[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface AdminDestinationsFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export function useAdminDestinations(filters: AdminDestinationsFilters = {}) {
  const query = new URLSearchParams();

  if (filters.status) query.append("status", filters.status);
  if (filters.page) query.append("page", filters.page.toString());
  if (filters.limit) query.append("limit", filters.limit.toString());

  return useQuery<AdminDestinationsResponse>({
    queryKey: ["admin-destinations", filters],
    queryFn: async () => {
      const url = `/api/admin/destinations${query.toString() ? `?${query.toString()}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch admin destinations");
      }

      return response.json();
    },
  });
}

export function useAdminDestination(id: string) {
  return useQuery<AdminDestination>({
    queryKey: ["admin-destination", id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/destinations/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch admin destination");
      }

      return response.json();
    },
    enabled: !!id,
  });
}

export function useUpdateDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<AdminDestination>;
    }) => {
      const response = await fetch(`/api/admin/destinations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update destination");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update the individual destination cache
      queryClient.setQueryData(["admin-destination", variables.id], data);

      // Invalidate the destinations list to refresh it
      queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
    },
  });
}

export function useDeleteDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/destinations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete destination");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the destinations list to refresh it
      queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
    },
  });
}

export function useUpdateAccommodation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { featured?: boolean; visible?: boolean; adminNotes?: string };
    }) => {
      const response = await fetch(`/api/admin/accommodations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update accommodation");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
    },
  });
}

export function useUpdateCourseExchange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { featured?: boolean; visible?: boolean; adminNotes?: string };
    }) => {
      const response = await fetch(`/api/admin/course-exchanges/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update course exchange");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["admin-destinations"] });
    },
  });
}
