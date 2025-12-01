import { CityAggregatedData } from "../types/cityData";

export const cityAggregationClient = {
  getAllCityStats: async (): Promise<CityAggregatedData[]> => {
    try {
      const response = await fetch("/api/destinations/city-aggregated?all=true");
      if (!response.ok) {
        throw new Error(`Failed to fetch city data: ${response.statusText}`);
      }
      const data = await response.json();
      // The API might return { cities: [...] } or just [...]
      return data.cities || data || [];
    } catch (error) {
      console.error("Error fetching city stats:", error);
      return [];
    }
  },

  getCityStats: async (city: string, country: string): Promise<CityAggregatedData | null> => {
    try {
      const response = await fetch(
        `/api/destinations/city-aggregated?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`
      );
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching stats for ${city}:`, error);
      return null;
    }
  }
};
