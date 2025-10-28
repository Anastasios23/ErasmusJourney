import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { enforceApprovedOnly } from "../../../lib/middleware/statusFilter";

const prisma = new PrismaClient();

/**
 * University Comparison API
 *
 * GET /api/universities/compare
 *
 * Compare multiple partner universities side-by-side
 *
 * Query params:
 * - ids: string - Comma-separated university IDs (e.g., "id1,id2,id3")
 * - homeUniversity: string - Filter courses by home university
 *
 * Returns comparison data including:
 * - Basic info (name, location, website)
 * - Statistics (courses, ratings, exchanges)
 * - Agreements with home universities
 * - Course availability by field
 * - Cost of living estimates
 * - Student satisfaction ratings
 */

interface UniversityComparison {
  id: string;
  name: string;
  shortName: string | null;
  city: string;
  country: string;
  website: string | null;

  // Statistics
  stats: {
    totalCourses: number;
    totalExchanges: number;
    averageRating: number | null;
    activeAgreements: number;
  };

  // Agreements
  agreements: Array<{
    id: string;
    homeUniversity: string;
    department: string;
    agreementType: string;
    isActive: boolean;
  }>;

  // Course availability
  coursesByField: Array<{
    field: string;
    count: number;
    averageQuality: number;
    averageECTS: number;
  }>;

  // Costs (from accommodation data)
  costs: {
    averageMonthlyRent: number | null;
    rentRange: { min: number; max: number } | null;
    sampleSize: number;
  };

  // Student feedback
  feedback: {
    overallSatisfaction: number | null;
    academicQuality: number | null;
    supportServices: number | null;
    totalReviews: number;
  };

  // Highlights
  highlights: string[];
}

interface ComparisonResponse {
  universities: UniversityComparison[];
  summary: {
    totalUniversities: number;
    mostCourses: { university: string; count: number };
    highestRated: { university: string; rating: number };
    mostAffordable: { university: string; rent: number };
    bestAcademic: { university: string; quality: number };
  };
  recommendations: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { ids, homeUniversity } = req.query;

    if (!ids || typeof ids !== "string") {
      return res
        .status(400)
        .json({ error: "University IDs are required (comma-separated)" });
    }

    const universityIds = ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (universityIds.length < 2) {
      return res
        .status(400)
        .json({ error: "At least 2 universities required for comparison" });
    }

    if (universityIds.length > 5) {
      return res
        .status(400)
        .json({ error: "Maximum 5 universities can be compared at once" });
    }

    // Fetch all universities
    const universities = await prisma.universities.findMany({
      where: {
        id: {
          in: universityIds,
        },
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        city: true,
        country: true,
        website: true,
      },
    });

    if (universities.length === 0) {
      return res.status(404).json({ error: "No universities found" });
    }

    // Build comparison data for each university
    const comparisons: UniversityComparison[] = await Promise.all(
      universities.map(async (university) => {
        // Fetch agreements
        const agreementWhere: any = {
          partnerUniversityId: university.id,
          isActive: true,
        };

        const agreements = await prisma.agreements.findMany({
          where: agreementWhere,
          include: {
            universities_agreements_homeUniversityIdTouniversities: {
              select: {
                name: true,
              },
            },
            departments: {
              select: {
                name: true,
              },
            },
          },
        });

        // Fetch courses
        const courseWhere: any = {
          type: "course-exchange",
          hostUniversity: university.name,
        };

        if (homeUniversity) {
          courseWhere.homeUniversity = {
            contains: homeUniversity as string,
            mode: "insensitive",
          };
        }

        const courses = await prisma.submittedData.findMany(
          enforceApprovedOnly({
            where: courseWhere,
            select: {
              id: true,
              fieldOfStudy: true,
              courseQuality: true,
              ectscredits: true,
              overallRating: true,
              academicRating: true,
              supportRating: true,
            },
          }),
        );

        // Fetch accommodation data for costs
        const accommodations = await prisma.submittedData.findMany(
          enforceApprovedOnly({
            where: {
              type: "accommodation",
              hostCity: university.city,
              hostCountry: university.country,
            },
            select: {
              pricePerMonth: true,
              overallRating: true,
            },
          }),
        );

        // Calculate course statistics by field
        const fieldStats: Record<
          string,
          { count: number; totalQuality: number; totalECTS: number }
        > = {};

        courses.forEach((course) => {
          const field = course.fieldOfStudy || "Other";
          if (!fieldStats[field]) {
            fieldStats[field] = { count: 0, totalQuality: 0, totalECTS: 0 };
          }
          fieldStats[field].count++;
          if (course.courseQuality) {
            fieldStats[field].totalQuality += course.courseQuality;
          }
          if (course.ectscredits) {
            fieldStats[field].totalECTS += course.ectscredits;
          }
        });

        const coursesByField = Object.entries(fieldStats)
          .map(([field, data]) => ({
            field,
            count: data.count,
            averageQuality:
              data.count > 0
                ? Math.round((data.totalQuality / data.count) * 10) / 10
                : 0,
            averageECTS:
              data.count > 0
                ? Math.round((data.totalECTS / data.count) * 10) / 10
                : 0,
          }))
          .sort((a, b) => b.count - a.count);

        // Calculate costs from accommodation data
        const convertToCents = (price: number | null): number | null => {
          if (price === null) return null;
          // If price > 1000, assume already in cents
          return price > 1000 ? price : Math.round(price * 100);
        };

        const rentsCents = accommodations
          .map((acc) => convertToCents(acc.pricePerMonth))
          .filter((rent): rent is number => rent !== null && rent > 0);

        let costs: UniversityComparison["costs"] = {
          averageMonthlyRent: null,
          rentRange: null,
          sampleSize: rentsCents.length,
        };

        if (rentsCents.length > 0) {
          rentsCents.sort((a, b) => a - b);
          const average =
            rentsCents.reduce((sum, r) => sum + r, 0) / rentsCents.length;

          costs = {
            averageMonthlyRent: Math.round(average),
            rentRange: {
              min: rentsCents[0],
              max: rentsCents[rentsCents.length - 1],
            },
            sampleSize: rentsCents.length,
          };
        }

        // Calculate feedback ratings
        const overallRatings = courses
          .map((c) => c.overallRating)
          .filter((r): r is number => r !== null);
        const academicRatings = courses
          .map((c) => c.academicRating)
          .filter((r): r is number => r !== null);
        const supportRatings = courses
          .map((c) => c.supportRating)
          .filter((r): r is number => r !== null);

        const feedback = {
          overallSatisfaction:
            overallRatings.length > 0
              ? Math.round(
                  (overallRatings.reduce((sum, r) => sum + r, 0) /
                    overallRatings.length) *
                    10,
                ) / 10
              : null,
          academicQuality:
            academicRatings.length > 0
              ? Math.round(
                  (academicRatings.reduce((sum, r) => sum + r, 0) /
                    academicRatings.length) *
                    10,
                ) / 10
              : null,
          supportServices:
            supportRatings.length > 0
              ? Math.round(
                  (supportRatings.reduce((sum, r) => sum + r, 0) /
                    supportRatings.length) *
                    10,
                ) / 10
              : null,
          totalReviews: courses.length,
        };

        // Calculate average rating (weighted: academic 40%, overall 30%, support 30%)
        let averageRating: number | null = null;
        if (feedback.academicQuality || feedback.overallSatisfaction) {
          const academic = feedback.academicQuality || 0;
          const overall = feedback.overallSatisfaction || 0;
          const support = feedback.supportServices || 0;
          averageRating =
            Math.round((academic * 0.4 + overall * 0.3 + support * 0.3) * 10) /
            10;
        }

        // Generate highlights
        const highlights: string[] = [];
        if (courses.length > 50) {
          highlights.push("🎓 Extensive course catalog");
        }
        if (averageRating && averageRating >= 4.5) {
          highlights.push("⭐ Highly rated by students");
        }
        if (costs.averageMonthlyRent && costs.averageMonthlyRent < 50000) {
          highlights.push("💰 Affordable living costs");
        }
        if (agreements.length > 5) {
          highlights.push("🤝 Multiple partnership agreements");
        }
        if (coursesByField.length >= 5) {
          highlights.push("📚 Diverse academic fields");
        }

        return {
          id: university.id,
          name: university.name,
          shortName: university.shortName,
          city: university.city,
          country: university.country,
          website: university.website,

          stats: {
            totalCourses: courses.length,
            totalExchanges: courses.length + accommodations.length,
            averageRating,
            activeAgreements: agreements.length,
          },

          agreements: agreements.map((agreement) => ({
            id: agreement.id,
            homeUniversity:
              agreement.universities_agreements_homeUniversityIdTouniversities
                .name,
            department: agreement.departments.name,
            agreementType: agreement.agreementType,
            isActive: agreement.isActive,
          })),

          coursesByField,
          costs,
          feedback,
          highlights,
        };
      }),
    );

    // Generate summary
    const mostCourses = comparisons.reduce((max, uni) =>
      uni.stats.totalCourses > max.stats.totalCourses ? uni : max,
    );

    const highestRated = comparisons
      .filter((uni) => uni.stats.averageRating !== null)
      .reduce(
        (max, uni) =>
          (uni.stats.averageRating || 0) > (max.stats.averageRating || 0)
            ? uni
            : max,
        comparisons[0],
      );

    const mostAffordable = comparisons
      .filter((uni) => uni.costs.averageMonthlyRent !== null)
      .reduce(
        (min, uni) =>
          (uni.costs.averageMonthlyRent || Infinity) <
          (min.costs.averageMonthlyRent || Infinity)
            ? uni
            : min,
        comparisons[0],
      );

    const bestAcademic = comparisons
      .filter((uni) => uni.feedback.academicQuality !== null)
      .reduce(
        (max, uni) =>
          (uni.feedback.academicQuality || 0) >
          (max.feedback.academicQuality || 0)
            ? uni
            : max,
        comparisons[0],
      );

    // Generate recommendations
    const recommendations: string[] = [];

    if (mostCourses.stats.totalCourses > 30) {
      recommendations.push(
        `For the widest course selection, consider ${mostCourses.name} with ${mostCourses.stats.totalCourses} available courses.`,
      );
    }

    if (
      highestRated.stats.averageRating &&
      highestRated.stats.averageRating >= 4.0
    ) {
      recommendations.push(
        `${highestRated.name} has the highest student satisfaction rating at ${highestRated.stats.averageRating}/5.0.`,
      );
    }

    if (
      mostAffordable.costs.averageMonthlyRent &&
      mostAffordable.costs.averageMonthlyRent < 60000
    ) {
      const rent = mostAffordable.costs.averageMonthlyRent / 100;
      recommendations.push(
        `${mostAffordable.name} offers the most affordable living costs at approximately €${rent}/month.`,
      );
    }

    const response: ComparisonResponse = {
      universities: comparisons,
      summary: {
        totalUniversities: comparisons.length,
        mostCourses: {
          university: mostCourses.name,
          count: mostCourses.stats.totalCourses,
        },
        highestRated: {
          university: highestRated.name,
          rating: highestRated.stats.averageRating || 0,
        },
        mostAffordable: {
          university: mostAffordable.name,
          rent: mostAffordable.costs.averageMonthlyRent || 0,
        },
        bestAcademic: {
          university: bestAcademic.name,
          quality: bestAcademic.feedback.academicQuality || 0,
        },
      },
      recommendations,
    };

    // Cache for 1 hour
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200",
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error comparing universities:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
