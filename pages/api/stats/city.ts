import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { enforceApprovedOnly } from "../../../lib/middleware/statusFilter";

/**
 * City Statistics API
 *
 * GET /api/stats/city?city=Paris&country=France
 *
 * Returns server-side aggregated statistics with outlier detection
 */

interface CityStats {
  city: string;
  country: string;
  sampleSize: number;
  accommodation: {
    avgMonthlyRentCents: number;
    medianMonthlyRentCents: number;
    minMonthlyRentCents: number;
    maxMonthlyRentCents: number;
    p5MonthlyRentCents: number; // 5th percentile (outlier filter)
    p95MonthlyRentCents: number; // 95th percentile (outlier filter)
    byType: Record<
      string,
      {
        count: number;
        avgRentCents: number;
        medianRentCents: number;
      }
    >;
  };
  courses: {
    totalCourses: number;
    avgECTS: number;
    avgQuality: number;
    byLevel: Record<
      string,
      {
        count: number;
        avgECTS: number;
        avgQuality: number;
      }
    >;
  };
  experiences: {
    totalFullExperiences: number;
    avgQualityScore: number;
    featuredCount: number;
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

  const { city, country } = req.query;

  if (!city || typeof city !== "string") {
    return res.status(400).json({ error: "city parameter is required" });
  }

  try {
    // Fetch all approved accommodations for this city
    const accommodations = await prisma.accommodation_views.findMany(
      enforceApprovedOnly({
        where: {
          city: city,
          ...(country && typeof country === "string" ? { country } : {}),
        },
        select: {
          id: true,
          type: true,
          pricePerMonth: true,
          currency: true,
          sourceSubmissionId: true,
        },
      }),
    );

    // Fetch all approved course exchanges for this city
    const courses = await prisma.course_exchange_views.findMany(
      enforceApprovedOnly({
        where: {
          city: city,
          ...(country && typeof country === "string" ? { country } : {}),
        },
        select: {
          id: true,
          ects: true,
          courseQuality: true,
          studyLevel: true,
        },
      }),
    );

    // Fetch full experiences
    const experiences = await prisma.student_submissions.findMany({
      where: {
        status: "APPROVED",
        isPublic: true,
        submissionType: "FULL_EXPERIENCE",
        hostCity: city,
        ...(country && typeof country === "string"
          ? { hostCountry: country }
          : {}),
      },
      select: {
        id: true,
        qualityScore: true,
        isFeatured: true,
      },
    });

    // Calculate accommodation statistics
    const accommodationStats = calculateAccommodationStats(accommodations);

    // Calculate course statistics
    const courseStats = calculateCourseStats(courses);

    // Calculate experience statistics
    const experienceStats = {
      totalFullExperiences: experiences.length,
      avgQualityScore:
        experiences.length > 0
          ? experiences.reduce((sum, exp) => sum + (exp.qualityScore || 0), 0) /
            experiences.length
          : 0,
      featuredCount: experiences.filter((exp) => exp.isFeatured).length,
    };

    const stats: CityStats = {
      city,
      country: (country as string) || "Unknown",
      sampleSize: accommodations.length + courses.length + experiences.length,
      accommodation: accommodationStats,
      courses: courseStats,
      experiences: experienceStats,
      lastUpdated: new Date().toISOString(),
    };

    // Cache for 1 hour
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200",
    );

    return res.status(200).json(stats);
  } catch (error) {
    console.error("City Stats API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function calculateAccommodationStats(accommodations: any[]) {
  if (accommodations.length === 0) {
    return {
      avgMonthlyRentCents: 0,
      medianMonthlyRentCents: 0,
      minMonthlyRentCents: 0,
      maxMonthlyRentCents: 0,
      p5MonthlyRentCents: 0,
      p95MonthlyRentCents: 0,
      byType: {},
    };
  }

  // Convert all prices to cents (handle both EUR decimals and cents)
  const rentsCents = accommodations
    .map((acc) => {
      if (!acc.pricePerMonth) return null;

      // If price is < 10000, assume it's in euros (decimal), convert to cents
      // If price is >= 10000, assume it's already in cents
      const price = parseFloat(acc.pricePerMonth.toString());
      return price < 10000 ? Math.round(price * 100) : Math.round(price);
    })
    .filter((rent): rent is number => rent !== null && rent > 0)
    .sort((a, b) => a - b);

  if (rentsCents.length === 0) {
    return {
      avgMonthlyRentCents: 0,
      medianMonthlyRentCents: 0,
      minMonthlyRentCents: 0,
      maxMonthlyRentCents: 0,
      p5MonthlyRentCents: 0,
      p95MonthlyRentCents: 0,
      byType: {},
    };
  }

  // Calculate percentiles for outlier detection
  const p5Index = Math.floor(rentsCents.length * 0.05);
  const p95Index = Math.floor(rentsCents.length * 0.95);
  const medianIndex = Math.floor(rentsCents.length / 2);

  const p5 = rentsCents[p5Index] || rentsCents[0];
  const p95 = rentsCents[p95Index] || rentsCents[rentsCents.length - 1];

  // Filter out outliers for average calculation (using p5-p95 range)
  const filteredRents = rentsCents.filter((rent) => rent >= p5 && rent <= p95);

  const avgMonthlyRentCents =
    filteredRents.length > 0
      ? Math.round(
          filteredRents.reduce((sum, rent) => sum + rent, 0) /
            filteredRents.length,
        )
      : 0;

  // Group by type
  const byType: Record<string, { rents: number[]; type: string }> = {};

  accommodations.forEach((acc) => {
    const type = acc.type || "OTHER";
    if (!byType[type]) {
      byType[type] = { rents: [], type };
    }

    if (acc.pricePerMonth) {
      const price = parseFloat(acc.pricePerMonth.toString());
      const rentCents =
        price < 10000 ? Math.round(price * 100) : Math.round(price);
      if (rentCents > 0) {
        byType[type].rents.push(rentCents);
      }
    }
  });

  const byTypeStats: Record<string, any> = {};

  Object.entries(byType).forEach(([type, data]) => {
    const sortedRents = data.rents.sort((a, b) => a - b);
    const medianIdx = Math.floor(sortedRents.length / 2);

    byTypeStats[type] = {
      count: sortedRents.length,
      avgRentCents:
        sortedRents.length > 0
          ? Math.round(
              sortedRents.reduce((sum, r) => sum + r, 0) / sortedRents.length,
            )
          : 0,
      medianRentCents: sortedRents[medianIdx] || 0,
    };
  });

  return {
    avgMonthlyRentCents,
    medianMonthlyRentCents: rentsCents[medianIndex] || 0,
    minMonthlyRentCents: rentsCents[0] || 0,
    maxMonthlyRentCents: rentsCents[rentsCents.length - 1] || 0,
    p5MonthlyRentCents: p5,
    p95MonthlyRentCents: p95,
    byType: byTypeStats,
  };
}

function calculateCourseStats(courses: any[]) {
  if (courses.length === 0) {
    return {
      totalCourses: 0,
      avgECTS: 0,
      avgQuality: 0,
      byLevel: {},
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
      ? validECTS.reduce((sum, ects) => sum + ects, 0) / validECTS.length
      : 0;

  const avgQuality =
    validQuality.length > 0
      ? validQuality.reduce((sum, q) => sum + q, 0) / validQuality.length
      : 0;

  // Group by level
  const byLevel: Record<string, { ects: number[]; qualities: number[] }> = {};

  courses.forEach((course) => {
    const level = course.studyLevel || "UNKNOWN";
    if (!byLevel[level]) {
      byLevel[level] = { ects: [], qualities: [] };
    }

    if (course.ects) byLevel[level].ects.push(course.ects);
    if (course.courseQuality)
      byLevel[level].qualities.push(course.courseQuality);
  });

  const byLevelStats: Record<string, any> = {};

  Object.entries(byLevel).forEach(([level, data]) => {
    byLevelStats[level] = {
      count: Math.max(data.ects.length, data.qualities.length),
      avgECTS:
        data.ects.length > 0
          ? data.ects.reduce((sum, e) => sum + e, 0) / data.ects.length
          : 0,
      avgQuality:
        data.qualities.length > 0
          ? data.qualities.reduce((sum, q) => sum + q, 0) /
            data.qualities.length
          : 0,
    };
  });

  return {
    totalCourses: courses.length,
    avgECTS: Math.round(avgECTS * 10) / 10, // Round to 1 decimal
    avgQuality: Math.round(avgQuality * 10) / 10,
    byLevel: byLevelStats,
  };
}
