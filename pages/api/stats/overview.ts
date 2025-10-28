import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { enforceApprovedOnly } from "../../../lib/middleware/statusFilter";

/**
 * Global Statistics Overview API
 *
 * GET /api/stats/overview
 *
 * Returns platform-wide statistics with outlier-filtered averages
 */

interface GlobalStats {
  platform: {
    totalCities: number;
    totalCountries: number;
    totalSubmissions: number;
    totalApproved: number;
    totalFeatured: number;
  };
  accommodation: {
    totalListings: number;
    globalAvgRentCents: number;
    globalMedianRentCents: number;
    priceRange: {
      min: number;
      max: number;
      p5: number;
      p95: number;
    };
    byType: Record<
      string,
      {
        count: number;
        avgRentCents: number;
      }
    >;
    topCities: Array<{
      city: string;
      country: string;
      count: number;
      avgRentCents: number;
    }>;
  };
  courses: {
    totalCourses: number;
    globalAvgECTS: number;
    globalAvgQuality: number;
    topUniversities: Array<{
      university: string;
      city: string;
      courseCount: number;
      avgQuality: number;
    }>;
  };
  trends: {
    mostPopularCities: Array<{
      city: string;
      country: string;
      totalSubmissions: number;
    }>;
    costEffectiveCities: Array<{
      city: string;
      country: string;
      avgRentCents: number;
      sampleSize: number;
    }>;
    highQualityCities: Array<{
      city: string;
      country: string;
      avgQualityScore: number;
      submissionCount: number;
    }>;
  };
  lastUpdated: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Fetch all approved data
    const [accommodations, courses, submissions] = await Promise.all([
      prisma.accommodation_views.findMany(
        enforceApprovedOnly({
          select: {
            city: true,
            country: true,
            type: true,
            pricePerMonth: true,
            currency: true,
          },
        }),
      ),
      prisma.course_exchange_views.findMany(
        enforceApprovedOnly({
          select: {
            city: true,
            country: true,
            hostUniversity: true,
            ects: true,
            courseQuality: true,
          },
        }),
      ),
      prisma.student_submissions.findMany({
        where: {
          status: "APPROVED",
          isPublic: true,
        },
        select: {
          id: true,
          hostCity: true,
          hostCountry: true,
          submissionType: true,
          qualityScore: true,
          isFeatured: true,
        },
      }),
    ]);

    // Calculate platform stats
    const uniqueCities = new Set<string>();
    const uniqueCountries = new Set<string>();

    [...accommodations, ...courses, ...submissions].forEach((item) => {
      if (item.city || item.hostCity) {
        uniqueCities.add(item.city || item.hostCity || "");
      }
      if (item.country || item.hostCountry) {
        uniqueCountries.add(item.country || item.hostCountry || "");
      }
    });

    const featuredCount = submissions.filter((s) => s.isFeatured).length;

    // Calculate accommodation stats
    const rentsCents = accommodations
      .map((acc) => {
        if (!acc.pricePerMonth) return null;
        const price = parseFloat(acc.pricePerMonth.toString());
        return price < 10000 ? Math.round(price * 100) : Math.round(price);
      })
      .filter((rent): rent is number => rent !== null && rent > 0)
      .sort((a, b) => a - b);

    let accommodationStats = {
      globalAvgRentCents: 0,
      globalMedianRentCents: 0,
      priceRange: { min: 0, max: 0, p5: 0, p95: 0 },
    };

    if (rentsCents.length > 0) {
      const p5Index = Math.floor(rentsCents.length * 0.05);
      const p95Index = Math.floor(rentsCents.length * 0.95);
      const medianIndex = Math.floor(rentsCents.length / 2);

      const p5 = rentsCents[p5Index] || rentsCents[0];
      const p95 = rentsCents[p95Index] || rentsCents[rentsCents.length - 1];
      const filteredRents = rentsCents.filter((r) => r >= p5 && r <= p95);

      accommodationStats = {
        globalAvgRentCents:
          filteredRents.length > 0
            ? Math.round(
                filteredRents.reduce((sum, r) => sum + r, 0) /
                  filteredRents.length,
              )
            : 0,
        globalMedianRentCents: rentsCents[medianIndex] || 0,
        priceRange: {
          min: rentsCents[0] || 0,
          max: rentsCents[rentsCents.length - 1] || 0,
          p5,
          p95,
        },
      };
    }

    // Group by type
    const byType: Record<string, number[]> = {};
    accommodations.forEach((acc) => {
      const type = acc.type || "OTHER";
      if (!byType[type]) byType[type] = [];

      if (acc.pricePerMonth) {
        const price = parseFloat(acc.pricePerMonth.toString());
        const rentCents =
          price < 10000 ? Math.round(price * 100) : Math.round(price);
        if (rentCents > 0) byType[type].push(rentCents);
      }
    });

    const byTypeStats: Record<string, any> = {};
    Object.entries(byType).forEach(([type, rents]) => {
      byTypeStats[type] = {
        count: rents.length,
        avgRentCents:
          rents.length > 0
            ? Math.round(rents.reduce((sum, r) => sum + r, 0) / rents.length)
            : 0,
      };
    });

    // Top cities by accommodation count
    const cityAccommodationCounts: Record<
      string,
      { country: string; rents: number[] }
    > = {};
    accommodations.forEach((acc) => {
      const key = acc.city || "Unknown";
      if (!cityAccommodationCounts[key]) {
        cityAccommodationCounts[key] = {
          country: acc.country || "Unknown",
          rents: [],
        };
      }
      if (acc.pricePerMonth) {
        const price = parseFloat(acc.pricePerMonth.toString());
        const rentCents =
          price < 10000 ? Math.round(price * 100) : Math.round(price);
        if (rentCents > 0) cityAccommodationCounts[key].rents.push(rentCents);
      }
    });

    const topCities = Object.entries(cityAccommodationCounts)
      .map(([city, data]) => ({
        city,
        country: data.country,
        count: data.rents.length,
        avgRentCents:
          data.rents.length > 0
            ? Math.round(
                data.rents.reduce((sum, r) => sum + r, 0) / data.rents.length,
              )
            : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Course stats
    const validECTS = courses
      .map((c) => c.ects)
      .filter((ects): ects is number => typeof ects === "number" && ects > 0);

    const validQuality = courses
      .map((c) => c.courseQuality)
      .filter((q): q is number => typeof q === "number" && q > 0);

    const globalAvgECTS =
      validECTS.length > 0
        ? validECTS.reduce((sum, e) => sum + e, 0) / validECTS.length
        : 0;

    const globalAvgQuality =
      validQuality.length > 0
        ? validQuality.reduce((sum, q) => sum + q, 0) / validQuality.length
        : 0;

    // Top universities by course count
    const universityCounts: Record<
      string,
      { city: string; qualities: number[] }
    > = {};
    courses.forEach((course) => {
      const uni = course.hostUniversity || "Unknown";
      if (!universityCounts[uni]) {
        universityCounts[uni] = {
          city: course.city || "Unknown",
          qualities: [],
        };
      }
      if (course.courseQuality) {
        universityCounts[uni].qualities.push(course.courseQuality);
      }
    });

    const topUniversities = Object.entries(universityCounts)
      .map(([university, data]) => ({
        university,
        city: data.city,
        courseCount: data.qualities.length,
        avgQuality:
          data.qualities.length > 0
            ? Math.round(
                (data.qualities.reduce((sum, q) => sum + q, 0) /
                  data.qualities.length) *
                  10,
              ) / 10
            : 0,
      }))
      .sort((a, b) => b.courseCount - a.courseCount)
      .slice(0, 10);

    // Trends: Most popular cities
    const citySubmissionCounts: Record<
      string,
      { country: string; count: number }
    > = {};
    submissions.forEach((sub) => {
      const city = sub.hostCity || "Unknown";
      if (!citySubmissionCounts[city]) {
        citySubmissionCounts[city] = {
          country: sub.hostCountry || "Unknown",
          count: 0,
        };
      }
      citySubmissionCounts[city].count++;
    });

    const mostPopularCities = Object.entries(citySubmissionCounts)
      .map(([city, data]) => ({
        city,
        country: data.country,
        totalSubmissions: data.count,
      }))
      .sort((a, b) => b.totalSubmissions - a.totalSubmissions)
      .slice(0, 10);

    // Cost-effective cities (low rent, good sample size)
    const costEffectiveCities = Object.entries(cityAccommodationCounts)
      .map(([city, data]) => ({
        city,
        country: data.country,
        avgRentCents:
          data.rents.length > 0
            ? Math.round(
                data.rents.reduce((sum, r) => sum + r, 0) / data.rents.length,
              )
            : 0,
        sampleSize: data.rents.length,
      }))
      .filter((c) => c.sampleSize >= 3 && c.avgRentCents > 0)
      .sort((a, b) => a.avgRentCents - b.avgRentCents)
      .slice(0, 10);

    // High-quality cities (by quality score)
    const cityQualityScores: Record<
      string,
      { country: string; scores: number[] }
    > = {};
    submissions.forEach((sub) => {
      if (sub.qualityScore && sub.hostCity) {
        const city = sub.hostCity;
        if (!cityQualityScores[city]) {
          cityQualityScores[city] = {
            country: sub.hostCountry || "Unknown",
            scores: [],
          };
        }
        cityQualityScores[city].scores.push(sub.qualityScore);
      }
    });

    const highQualityCities = Object.entries(cityQualityScores)
      .map(([city, data]) => ({
        city,
        country: data.country,
        avgQualityScore:
          data.scores.length > 0
            ? Math.round(
                (data.scores.reduce((sum, s) => sum + s, 0) /
                  data.scores.length) *
                  10,
              ) / 10
            : 0,
        submissionCount: data.scores.length,
      }))
      .filter((c) => c.submissionCount >= 3)
      .sort((a, b) => b.avgQualityScore - a.avgQualityScore)
      .slice(0, 10);

    const stats: GlobalStats = {
      platform: {
        totalCities: uniqueCities.size,
        totalCountries: uniqueCountries.size,
        totalSubmissions: submissions.length,
        totalApproved: submissions.length,
        totalFeatured: featuredCount,
      },
      accommodation: {
        totalListings: accommodations.length,
        ...accommodationStats,
        byType: byTypeStats,
        topCities,
      },
      courses: {
        totalCourses: courses.length,
        globalAvgECTS: Math.round(globalAvgECTS * 10) / 10,
        globalAvgQuality: Math.round(globalAvgQuality * 10) / 10,
        topUniversities,
      },
      trends: {
        mostPopularCities,
        costEffectiveCities,
        highQualityCities,
      },
      lastUpdated: new Date().toISOString(),
    };

    // Cache for 1 hour
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200",
    );

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Global Stats API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
