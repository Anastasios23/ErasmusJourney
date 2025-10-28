import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { enforceApprovedOnly } from "../../../lib/middleware/statusFilter";

/**
 * Multi-City Comparison API
 *
 * GET /api/stats/compare?cities=Paris,Berlin,Madrid
 *
 * Returns comparative statistics for multiple cities
 */

interface CityComparison {
  city: string;
  country: string;
  sampleSize: number;
  avgRentCents: number;
  medianRentCents: number;
  rentRange: {
    min: number;
    max: number;
    p5: number;
    p95: number;
  };
  totalCourses: number;
  avgCourseQuality: number;
  avgECTS: number;
  costOfLivingIndex: number; // Relative to cheapest city (1.0 = cheapest)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { cities } = req.query;

  if (!cities || typeof cities !== "string") {
    return res.status(400).json({
      error: "cities parameter is required",
      example: "/api/stats/compare?cities=Paris,Berlin,Madrid",
    });
  }

  const cityList = cities
    .split(",")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (cityList.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one city must be provided" });
  }

  if (cityList.length > 10) {
    return res
      .status(400)
      .json({ error: "Maximum 10 cities can be compared at once" });
  }

  try {
    const comparisons: CityComparison[] = [];

    for (const city of cityList) {
      // Fetch accommodations
      const accommodations = await prisma.accommodation_views.findMany(
        enforceApprovedOnly({
          where: { city },
          select: {
            pricePerMonth: true,
            currency: true,
            country: true,
          },
        }),
      );

      // Fetch courses
      const courses = await prisma.course_exchange_views.findMany(
        enforceApprovedOnly({
          where: { city },
          select: {
            ects: true,
            courseQuality: true,
            country: true,
          },
        }),
      );

      // Calculate stats
      const rentsCents = accommodations
        .map((acc) => {
          if (!acc.pricePerMonth) return null;
          const price = parseFloat(acc.pricePerMonth.toString());
          return price < 10000 ? Math.round(price * 100) : Math.round(price);
        })
        .filter((rent): rent is number => rent !== null && rent > 0)
        .sort((a, b) => a - b);

      let rentStats = {
        avg: 0,
        median: 0,
        min: 0,
        max: 0,
        p5: 0,
        p95: 0,
      };

      if (rentsCents.length > 0) {
        const p5Index = Math.floor(rentsCents.length * 0.05);
        const p95Index = Math.floor(rentsCents.length * 0.95);
        const medianIndex = Math.floor(rentsCents.length / 2);

        const p5 = rentsCents[p5Index] || rentsCents[0];
        const p95 = rentsCents[p95Index] || rentsCents[rentsCents.length - 1];
        const filteredRents = rentsCents.filter((r) => r >= p5 && r <= p95);

        rentStats = {
          avg:
            filteredRents.length > 0
              ? Math.round(
                  filteredRents.reduce((sum, r) => sum + r, 0) /
                    filteredRents.length,
                )
              : 0,
          median: rentsCents[medianIndex] || 0,
          min: rentsCents[0] || 0,
          max: rentsCents[rentsCents.length - 1] || 0,
          p5,
          p95,
        };
      }

      const validECTS = courses
        .map((c) => c.ects)
        .filter((ects): ects is number => typeof ects === "number" && ects > 0);

      const validQuality = courses
        .map((c) => c.courseQuality)
        .filter((q): q is number => typeof q === "number" && q > 0);

      const avgECTS =
        validECTS.length > 0
          ? validECTS.reduce((sum, e) => sum + e, 0) / validECTS.length
          : 0;

      const avgQuality =
        validQuality.length > 0
          ? validQuality.reduce((sum, q) => sum + q, 0) / validQuality.length
          : 0;

      const country =
        accommodations[0]?.country || courses[0]?.country || "Unknown";

      comparisons.push({
        city,
        country,
        sampleSize: accommodations.length + courses.length,
        avgRentCents: rentStats.avg,
        medianRentCents: rentStats.median,
        rentRange: {
          min: rentStats.min,
          max: rentStats.max,
          p5: rentStats.p5,
          p95: rentStats.p95,
        },
        totalCourses: courses.length,
        avgCourseQuality: Math.round(avgQuality * 10) / 10,
        avgECTS: Math.round(avgECTS * 10) / 10,
        costOfLivingIndex: 0, // Will be calculated below
      });
    }

    // Calculate cost of living index (relative to cheapest)
    const validRents = comparisons
      .filter((c) => c.avgRentCents > 0)
      .map((c) => c.avgRentCents);

    const minRent = validRents.length > 0 ? Math.min(...validRents) : 1;

    comparisons.forEach((comp) => {
      if (comp.avgRentCents > 0) {
        comp.costOfLivingIndex =
          Math.round((comp.avgRentCents / minRent) * 100) / 100;
      } else {
        comp.costOfLivingIndex = 0;
      }
    });

    // Sort by cost of living (cheapest first)
    comparisons.sort((a, b) => {
      if (a.avgRentCents === 0) return 1;
      if (b.avgRentCents === 0) return -1;
      return a.avgRentCents - b.avgRentCents;
    });

    // Cache for 1 hour
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200",
    );

    return res.status(200).json({
      comparisons,
      summary: {
        totalCities: comparisons.length,
        cheapestCity: comparisons[0]?.city,
        mostExpensiveCity: comparisons[comparisons.length - 1]?.city,
        avgCostDifference:
          comparisons.length >= 2
            ? Math.round(
                ((comparisons[comparisons.length - 1].avgRentCents -
                  comparisons[0].avgRentCents) /
                  comparisons[0].avgRentCents) *
                  100,
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("City Comparison API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
