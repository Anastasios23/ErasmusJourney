import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { enforceApprovedOnly } from "../../../../lib/middleware/statusFilter";

const prisma = new PrismaClient();

/**
 * University Courses API
 *
 * GET /api/universities/[id]/courses
 *
 * Returns approved course exchanges for a university with filtering and grouping
 *
 * Query params:
 * - studyLevel: string - Filter by study level (bachelor, master, phd)
 * - field: string - Filter by field of study
 * - minQuality: number - Minimum course quality rating (1-5)
 * - minECTS: number - Minimum ECTS credits
 * - maxECTS: number - Maximum ECTS credits
 * - homeUniversity: string - Filter by home (Cyprus) university
 * - groupBy: string - Group results (department, level, field, semester)
 * - page: number - Pagination (default: 1)
 * - limit: number - Results per page (default: 20, max: 100)
 */

interface CourseExchange {
  id: string;
  courseName: string;
  courseCode: string | null;
  ects: number | null;
  studyLevel: string;
  fieldOfStudy: string | null;
  courseQuality: number | null;
  difficultyLevel: string | null;

  // Host (Partner) University
  hostUniversity: string;
  hostCity: string;
  hostCountry: string;

  // Home (Cyprus) University
  homeUniversity: string | null;
  homeCourseName: string | null;
  homeCourseCode: string | null;
  homeECTS: number | null;

  // Exam details
  examTypes: string[];
  workload: string | null;

  // Matching info
  isDirectMatch: boolean;
  matchingNotes: string | null;

  // Student feedback
  recommendation: string | null;
  studentYear: string | null;
  semester: string | null;
}

interface GroupedCourses {
  groupName: string;
  courses: CourseExchange[];
  stats: {
    count: number;
    averageQuality: number | null;
    averageECTS: number | null;
    totalECTS: number;
  };
}

interface CourseResponse {
  university: {
    id: string;
    name: string;
    city: string;
    country: string;
  };
  courses: CourseExchange[];
  grouped?: GroupedCourses[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    studyLevels: string[];
    fields: string[];
    qualityRange: { min: number; max: number };
    ectsRange: { min: number; max: number };
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
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "University ID is required" });
    }

    // Extract query parameters
    const {
      studyLevel,
      field,
      minQuality,
      minECTS,
      maxECTS,
      homeUniversity,
      groupBy,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    // Fetch university
    const university = await prisma.universities.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
      },
    });

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    // Build where clause
    const whereClause: any = {
      type: "course-exchange",
      hostUniversity: university.name,
    };

    if (studyLevel) {
      whereClause.studyLevel = studyLevel;
    }

    if (field) {
      whereClause.fieldOfStudy = {
        contains: field as string,
        mode: "insensitive",
      };
    }

    if (minQuality) {
      whereClause.courseQuality = {
        gte: parseInt(minQuality as string),
      };
    }

    if (minECTS || maxECTS) {
      whereClause.ectscredits = {};
      if (minECTS) {
        whereClause.ectscredits.gte = parseInt(minECTS as string);
      }
      if (maxECTS) {
        whereClause.ectscredits.lte = parseInt(maxECTS as string);
      }
    }

    if (homeUniversity) {
      whereClause.homeUniversity = {
        contains: homeUniversity as string,
        mode: "insensitive",
      };
    }

    // Get total count
    const total = await prisma.submittedData.count(
      enforceApprovedOnly({ where: whereClause }),
    );

    // Fetch courses with pagination
    const courses = await prisma.submittedData.findMany(
      enforceApprovedOnly({
        where: whereClause,
        select: {
          id: true,
          courseName: true,
          courseCode: true,
          ectscredits: true,
          studyLevel: true,
          fieldOfStudy: true,
          courseQuality: true,
          difficultyLevel: true,
          hostUniversity: true,
          hostCity: true,
          hostCountry: true,
          homeUniversity: true,
          homeCourseName: true,
          homeCourseCode: true,
          homeECTS: true,
          examType: true,
          workload: true,
          courseRecommendation: true,
          studentYear: true,
          semester: true,
          matchingDifficulty: true,
          matchingNotes: true,
        },
        orderBy: [
          { courseQuality: "desc" },
          { ectscredits: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limitNum,
      }),
    );

    // Transform to CourseExchange format
    const courseExchanges: CourseExchange[] = courses.map((course) => {
      // Parse exam types
      const examTypes: string[] = [];
      if (course.examType) {
        const types = course.examType.toLowerCase();
        if (types.includes("final")) examTypes.push("Final Exam");
        if (types.includes("oral")) examTypes.push("Oral");
        if (types.includes("written")) examTypes.push("Written");
        if (types.includes("project")) examTypes.push("Project");
        if (types.includes("continuous") || types.includes("assessment"))
          examTypes.push("Continuous Assessment");
      }

      // Determine if direct match
      const isDirectMatch = !!(
        course.homeCourseName &&
        course.homeCourseCode &&
        course.homeECTS === course.ectscredits
      );

      return {
        id: course.id,
        courseName: course.courseName || "Unknown Course",
        courseCode: course.courseCode,
        ects: course.ectscredits,
        studyLevel: course.studyLevel || "Unknown",
        fieldOfStudy: course.fieldOfStudy,
        courseQuality: course.courseQuality,
        difficultyLevel: course.difficultyLevel,

        hostUniversity: course.hostUniversity || "",
        hostCity: course.hostCity || "",
        hostCountry: course.hostCountry || "",

        homeUniversity: course.homeUniversity,
        homeCourseName: course.homeCourseName,
        homeCourseCode: course.homeCourseCode,
        homeECTS: course.homeECTS,

        examTypes,
        workload: course.workload,

        isDirectMatch,
        matchingNotes: course.matchingNotes,

        recommendation: course.courseRecommendation,
        studentYear: course.studentYear,
        semester: course.semester,
      };
    });

    // Get available filters
    const allCourses = await prisma.submittedData.findMany(
      enforceApprovedOnly({
        where: {
          type: "course-exchange",
          hostUniversity: university.name,
        },
        select: {
          studyLevel: true,
          fieldOfStudy: true,
          courseQuality: true,
          ectscredits: true,
        },
      }),
    );

    const studyLevels = [
      ...new Set(allCourses.map((c) => c.studyLevel).filter(Boolean)),
    ] as string[];
    const fields = [
      ...new Set(allCourses.map((c) => c.fieldOfStudy).filter(Boolean)),
    ] as string[];

    const qualities = allCourses
      .map((c) => c.courseQuality)
      .filter((q): q is number => q !== null);
    const qualityRange =
      qualities.length > 0
        ? { min: Math.min(...qualities), max: Math.max(...qualities) }
        : { min: 1, max: 5 };

    const ectsList = allCourses
      .map((c) => c.ectscredits)
      .filter((e): e is number => e !== null);
    const ectsRange =
      ectsList.length > 0
        ? { min: Math.min(...ectsList), max: Math.max(...ectsList) }
        : { min: 0, max: 30 };

    // Group courses if requested
    let grouped: GroupedCourses[] | undefined;
    if (groupBy) {
      const groups: Record<string, CourseExchange[]> = {};

      courseExchanges.forEach((course) => {
        let groupKey = "Other";

        switch (groupBy) {
          case "department":
          case "field":
            groupKey = course.fieldOfStudy || "Other";
            break;
          case "level":
            groupKey = course.studyLevel;
            break;
          case "semester":
            groupKey = course.semester || "Unknown";
            break;
          default:
            groupKey = "All Courses";
        }

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(course);
      });

      grouped = Object.entries(groups).map(([groupName, groupCourses]) => {
        const qualities = groupCourses
          .map((c) => c.courseQuality)
          .filter((q): q is number => q !== null);
        const ects = groupCourses
          .map((c) => c.ects)
          .filter((e): e is number => e !== null);

        return {
          groupName,
          courses: groupCourses,
          stats: {
            count: groupCourses.length,
            averageQuality:
              qualities.length > 0
                ? Math.round(
                    (qualities.reduce((sum, q) => sum + q, 0) /
                      qualities.length) *
                      10,
                  ) / 10
                : null,
            averageECTS:
              ects.length > 0
                ? Math.round(
                    (ects.reduce((sum, e) => sum + e, 0) / ects.length) * 10,
                  ) / 10
                : null,
            totalECTS: ects.reduce((sum, e) => sum + e, 0),
          },
        };
      });

      // Sort groups by count (descending)
      grouped.sort((a, b) => b.stats.count - a.stats.count);
    }

    const response: CourseResponse = {
      university,
      courses: courseExchanges,
      ...(grouped && { grouped }),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      filters: {
        studyLevels,
        fields,
        qualityRange,
        ectsRange,
      },
    };

    // Cache for 30 minutes (courses change less frequently than stats)
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=3600",
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching university courses:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
