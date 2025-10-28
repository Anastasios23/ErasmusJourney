import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { enforceApprovedOnly } from "../../../../lib/middleware/statusFilter";

const prisma = new PrismaClient();

/**
 * University Profile API
 *
 * GET /api/universities/[id]/profile
 *
 * Returns comprehensive university profile including:
 * - Basic university information
 * - Bilateral agreements with partner universities
 * - Statistics (total exchanges, ratings, active agreements)
 * - Course catalog summary
 * - Partner universities
 *
 * Query params:
 * - includeInactive: boolean - Include inactive agreements (default: false)
 */

interface UniversityProfile {
  id: string;
  name: string;
  shortName: string | null;
  code: string | null;
  country: string;
  city: string;
  website: string | null;
  description: string | null;
  imageUrl: string | null;

  // Statistics
  stats: {
    totalAgreements: number;
    activeAgreements: number;
    totalExchanges: number;
    averageRating: number | null;
    totalCourses: number;
    popularFields: Array<{
      field: string;
      count: number;
    }>;
  };

  // Agreements
  agreements: Array<{
    id: string;
    partnerUniversity: {
      id: string;
      name: string;
      shortName: string | null;
      country: string;
      city: string;
    };
    department: {
      id: string;
      name: string;
      faculty: string;
    };
    agreementType: string;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
    exchangeCount: number;
    averageRating: number | null;
  }>;

  // Course catalog summary
  courseStats: {
    totalCourses: number;
    byStudyLevel: Array<{
      level: string;
      count: number;
      averageECTS: number;
    }>;
    byField: Array<{
      field: string;
      count: number;
    }>;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only GET method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    const includeInactive = req.query.includeInactive === "true";

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "University ID is required" });
    }

    // Fetch university basic info
    const university = await prisma.universities.findUnique({
      where: { id },
      include: {
        faculties: {
          include: {
            departments: true,
          },
        },
      },
    });

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    // Build agreement where clause
    const agreementWhere: any = {
      homeUniversityId: id,
    };

    if (!includeInactive) {
      agreementWhere.isActive = true;
    }

    // Fetch agreements with partner universities
    const agreements = await prisma.agreements.findMany({
      where: agreementWhere,
      include: {
        universities_agreements_partnerUniversityIdTouniversities: {
          select: {
            id: true,
            name: true,
            shortName: true,
            country: true,
            city: true,
          },
        },
        departments: {
          select: {
            id: true,
            name: true,
            faculties: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch exchange statistics from approved submissions
    const courseSubmissions = await prisma.submittedData.findMany(
      enforceApprovedOnly({
        where: {
          type: "course-exchange",
          hostUniversity: university.name,
        },
        select: {
          id: true,
          courseQuality: true,
          ectscredits: true,
          studyLevel: true,
          fieldOfStudy: true,
        },
      }),
    );

    const accommodationSubmissions = await prisma.submittedData.findMany(
      enforceApprovedOnly({
        where: {
          type: "accommodation",
          hostCity: university.city,
          hostCountry: university.country,
        },
        select: {
          id: true,
          overallRating: true,
        },
      }),
    );

    // Fetch partnership tracking data
    const partnershipTracking = await prisma.partnership_tracking.findMany({
      where: {
        homeUniversityName: university.name,
        ...(includeInactive ? {} : { isActive: true }),
      },
    });

    // Calculate statistics
    const totalExchanges =
      courseSubmissions.length + accommodationSubmissions.length;

    // Calculate average rating (weighted: 70% course quality, 30% accommodation)
    const courseRatings = courseSubmissions
      .filter((s) => s.courseQuality !== null)
      .map((s) => s.courseQuality!);

    const accommodationRatings = accommodationSubmissions
      .filter((s) => s.overallRating !== null)
      .map((s) => s.overallRating!);

    let averageRating: number | null = null;
    if (courseRatings.length > 0 || accommodationRatings.length > 0) {
      const courseAvg =
        courseRatings.length > 0
          ? courseRatings.reduce((sum, r) => sum + r, 0) / courseRatings.length
          : 0;
      const accommodationAvg =
        accommodationRatings.length > 0
          ? accommodationRatings.reduce((sum, r) => sum + r, 0) /
            accommodationRatings.length
          : 0;

      if (courseRatings.length > 0 && accommodationRatings.length > 0) {
        averageRating = courseAvg * 0.7 + accommodationAvg * 0.3;
      } else if (courseRatings.length > 0) {
        averageRating = courseAvg;
      } else {
        averageRating = accommodationAvg;
      }

      averageRating = Math.round(averageRating * 10) / 10;
    }

    // Count courses by field of study
    const fieldCounts: Record<string, number> = {};
    courseSubmissions.forEach((course) => {
      if (course.fieldOfStudy) {
        fieldCounts[course.fieldOfStudy] =
          (fieldCounts[course.fieldOfStudy] || 0) + 1;
      }
    });

    const popularFields = Object.entries(fieldCounts)
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Course stats by study level
    const studyLevelStats: Record<
      string,
      { count: number; totalECTS: number }
    > = {};
    courseSubmissions.forEach((course) => {
      if (course.studyLevel) {
        if (!studyLevelStats[course.studyLevel]) {
          studyLevelStats[course.studyLevel] = { count: 0, totalECTS: 0 };
        }
        studyLevelStats[course.studyLevel].count++;
        if (course.ectscredits) {
          studyLevelStats[course.studyLevel].totalECTS += course.ectscredits;
        }
      }
    });

    const courseStatsByLevel = Object.entries(studyLevelStats).map(
      ([level, data]) => ({
        level,
        count: data.count,
        averageECTS:
          data.count > 0
            ? Math.round((data.totalECTS / data.count) * 10) / 10
            : 0,
      }),
    );

    // Course stats by field
    const courseStatsByField = Object.entries(fieldCounts)
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count);

    // Enrich agreements with exchange counts
    const agreementsWithStats = await Promise.all(
      agreements.map(async (agreement) => {
        const partnerTracking = partnershipTracking.find(
          (pt) =>
            pt.partnerUniversityName ===
              agreement
                .universities_agreements_partnerUniversityIdTouniversities
                .name &&
            pt.partnerCity ===
              agreement
                .universities_agreements_partnerUniversityIdTouniversities.city,
        );

        return {
          id: agreement.id,
          partnerUniversity: {
            id: agreement
              .universities_agreements_partnerUniversityIdTouniversities.id,
            name: agreement
              .universities_agreements_partnerUniversityIdTouniversities.name,
            shortName:
              agreement
                .universities_agreements_partnerUniversityIdTouniversities
                .shortName,
            country:
              agreement
                .universities_agreements_partnerUniversityIdTouniversities
                .country,
            city: agreement
              .universities_agreements_partnerUniversityIdTouniversities.city,
          },
          department: {
            id: agreement.departments.id,
            name: agreement.departments.name,
            faculty: agreement.departments.faculties.name,
          },
          agreementType: agreement.agreementType,
          isActive: agreement.isActive,
          startDate: agreement.startDate
            ? agreement.startDate.toISOString()
            : null,
          endDate: agreement.endDate ? agreement.endDate.toISOString() : null,
          exchangeCount: partnerTracking?.totalSubmissions || 0,
          averageRating: partnerTracking?.averageRating || null,
        };
      }),
    );

    // Build response
    const profile: UniversityProfile = {
      id: university.id,
      name: university.name,
      shortName: university.shortName,
      code: university.code,
      country: university.country,
      city: university.city,
      website: university.website,
      description: university.description,
      imageUrl: university.imageUrl,

      stats: {
        totalAgreements: agreements.length,
        activeAgreements: agreements.filter((a) => a.isActive).length,
        totalExchanges,
        averageRating,
        totalCourses: courseSubmissions.length,
        popularFields,
      },

      agreements: agreementsWithStats,

      courseStats: {
        totalCourses: courseSubmissions.length,
        byStudyLevel: courseStatsByLevel,
        byField: courseStatsByField,
      },
    };

    // Cache for 1 hour
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200",
    );

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching university profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
