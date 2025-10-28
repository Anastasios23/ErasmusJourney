import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Neighborhood/Area Statistics API
 *
 * GET /api/accommodations/areas
 *
 * Get accommodation statistics grouped by neighborhood/area
 *
 * Query params:
 * - city: string - Filter by city (required)
 * - country: string - Filter by country (optional)
 */

interface NeighborhoodStats {
  name: string;
  city: string;
  country: string;

  // Pricing
  stats: {
    count: number;
    averageRent: number; // in cents
    medianRent: number; // in cents
    minRent: number; // in cents
    maxRent: number; // in cents
  };

  // Ratings
  ratings: {
    averageOverall: number | null;
    averageLocation: number | null;
    averageCleanliness: number | null;
    averageValue: number | null;
  };

  // Popularity
  popularity: {
    listingsCount: number;
    studentReviews: number;
    recommendationRate: number; // 0-100%
  };

  // Highlights
  highlights: string[];
  topAmenities: string[];
}

interface AreasResponse {
  city: string;
  country: string;
  neighborhoods: NeighborhoodStats[];
  cityWide: {
    totalListings: number;
    averageRent: number;
    medianRent: number;
    topNeighborhoods: string[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { city, country } = req.query;

    if (!city || typeof city !== "string") {
      return res.status(400).json({ error: "City parameter is required" });
    }

    // Build where clause
    const whereClause: any = {
      status: "APPROVED",
      isPublic: true,
      city: {
        equals: city,
        mode: "insensitive",
      },
    };

    if (country) {
      whereClause.country = {
        equals: country as string,
        mode: "insensitive",
      };
    }

    // Fetch all accommodations for the city
    const accommodations = await prisma.accommodation_views.findMany({
      where: whereClause,
    });

    if (accommodations.length === 0) {
      return res
        .status(404)
        .json({ error: "No accommodations found for this city" });
    }

    const convertToCents = (price: number | null): number => {
      if (price === null) return 0;
      return price > 1000 ? price : Math.round(price * 100);
    };

    // Group by neighborhood
    const neighborhoodGroups: Record<string, any[]> = {};

    accommodations.forEach((acc) => {
      const neighborhood = acc.neighborhood || "Unknown Area";
      if (!neighborhoodGroups[neighborhood]) {
        neighborhoodGroups[neighborhood] = [];
      }
      neighborhoodGroups[neighborhood].push(acc);
    });

    // Calculate stats for each neighborhood
    const neighborhoods: NeighborhoodStats[] = Object.entries(
      neighborhoodGroups,
    ).map(([name, accs]) => {
      // Calculate pricing stats
      const rents = accs
        .map((acc) => convertToCents(acc.pricePerMonth))
        .filter((r) => r > 0)
        .sort((a, b) => a - b);

      const averageRent =
        rents.length > 0
          ? Math.round(rents.reduce((sum, r) => sum + r, 0) / rents.length)
          : 0;

      const medianRent =
        rents.length > 0 ? rents[Math.floor(rents.length / 2)] : 0;

      const minRent = rents.length > 0 ? rents[0] : 0;
      const maxRent = rents.length > 0 ? rents[rents.length - 1] : 0;

      // Calculate ratings
      const overallRatings = accs
        .map((acc) => acc.overallRating)
        .filter((r): r is number => r !== null);
      const locationRatings = accs
        .map((acc) => acc.locationRating)
        .filter((r): r is number => r !== null);
      const cleanlinessRatings = accs
        .map((acc) => acc.cleanlinessRating)
        .filter((r): r is number => r !== null);
      const valueRatings = accs
        .map((acc) => acc.valueForMoneyRating)
        .filter((r): r is number => r !== null);

      const averageOverall =
        overallRatings.length > 0
          ? Math.round(
              (overallRatings.reduce((sum, r) => sum + r, 0) /
                overallRatings.length) *
                10,
            ) / 10
          : null;
      const averageLocation =
        locationRatings.length > 0
          ? Math.round(
              (locationRatings.reduce((sum, r) => sum + r, 0) /
                locationRatings.length) *
                10,
            ) / 10
          : null;
      const averageCleanliness =
        cleanlinessRatings.length > 0
          ? Math.round(
              (cleanlinessRatings.reduce((sum, r) => sum + r, 0) /
                cleanlinessRatings.length) *
                10,
            ) / 10
          : null;
      const averageValue =
        valueRatings.length > 0
          ? Math.round(
              (valueRatings.reduce((sum, r) => sum + r, 0) /
                valueRatings.length) *
                10,
            ) / 10
          : null;

      // Calculate recommendation rate
      const highlyRated = accs.filter(
        (acc) => acc.overallRating && acc.overallRating >= 4.0,
      ).length;
      const recommendationRate =
        accs.length > 0 ? Math.round((highlyRated / accs.length) * 100) : 0;

      // Extract common amenities
      const amenityCounts: Record<string, number> = {};
      accs.forEach((acc) => {
        const amenitiesStr = (
          acc.amenities ||
          acc.description ||
          ""
        ).toLowerCase();

        const amenities = [
          "wifi",
          "parking",
          "kitchen",
          "laundry",
          "furnished",
          "aircon",
          "heating",
          "elevator",
          "balcony",
          "gym",
        ];
        amenities.forEach((amenity) => {
          if (amenitiesStr.includes(amenity)) {
            amenityCounts[amenity] = (amenityCounts[amenity] || 0) + 1;
          }
        });
      });

      const topAmenities = Object.entries(amenityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([amenity]) => amenity);

      // Generate highlights
      const highlights: string[] = [];
      if (averageRent < 50000) highlights.push("💰 Affordable neighborhood");
      if (averageRent > 80000) highlights.push("💎 Premium area");
      if (averageOverall && averageOverall >= 4.5)
        highlights.push("⭐ Highly rated");
      if (averageLocation && averageLocation >= 4.5)
        highlights.push("📍 Excellent location");
      if (recommendationRate >= 80)
        highlights.push(`👍 ${recommendationRate}% recommend`);
      if (accs.length >= 10) highlights.push("🏘️ Many options available");

      return {
        name,
        city: accs[0].city || city,
        country: accs[0].country || country || "",

        stats: {
          count: accs.length,
          averageRent,
          medianRent,
          minRent,
          maxRent,
        },

        ratings: {
          averageOverall,
          averageLocation,
          averageCleanliness,
          averageValue,
        },

        popularity: {
          listingsCount: accs.length,
          studentReviews: overallRatings.length,
          recommendationRate,
        },

        highlights,
        topAmenities,
      };
    });

    // Sort neighborhoods by listing count (most popular first)
    neighborhoods.sort((a, b) => b.stats.count - a.stats.count);

    // Calculate city-wide stats
    const allRents = accommodations
      .map((acc) => convertToCents(acc.pricePerMonth))
      .filter((r) => r > 0)
      .sort((a, b) => a - b);

    const cityWideAverageRent =
      allRents.length > 0
        ? Math.round(allRents.reduce((sum, r) => sum + r, 0) / allRents.length)
        : 0;

    const cityWideMedianRent =
      allRents.length > 0 ? allRents[Math.floor(allRents.length / 2)] : 0;

    const topNeighborhoods = neighborhoods.slice(0, 5).map((n) => n.name);

    const response: AreasResponse = {
      city,
      country: (country as string) || accommodations[0].country || "",
      neighborhoods,
      cityWide: {
        totalListings: accommodations.length,
        averageRent: cityWideAverageRent,
        medianRent: cityWideMedianRent,
        topNeighborhoods,
      },
    };

    // Cache for 1 hour
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200",
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching area statistics:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
