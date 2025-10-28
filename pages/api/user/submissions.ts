import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

/**
 * User Submissions API
 *
 * Enhanced API for fetching user's own submissions with:
 * - Advanced filtering (status, type, date range)
 * - Sorting options
 * - Statistics and counts
 * - Status distribution
 *
 * GET /api/user/submissions
 */

type SubmissionType =
  | "FULL_EXPERIENCE"
  | "ACCOMMODATION"
  | "COURSE_EXCHANGE"
  | "QUICK_TIP"
  | "DESTINATION_INFO";

type SubmissionStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REVISION_NEEDED"
  | "ARCHIVED";

interface SubmissionStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  recentCount: number;
  avgResponseTime: number | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only GET method allowed
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get user
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parse query parameters
    const {
      status,
      type,
      fromDate,
      toDate,
      search,
      sortBy = "updatedAt",
      order = "desc",
      page = "1",
      limit = "20",
      includeStats = "false",
    } = req.query;

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    // Filter by status
    if (status && typeof status === "string") {
      if (status === "ACTIVE") {
        // Active = DRAFT, PENDING, REVISION_NEEDED
        where.status = { in: ["DRAFT", "PENDING", "REVISION_NEEDED"] };
      } else if (status === "COMPLETED") {
        // Completed = APPROVED
        where.status = "APPROVED";
      } else {
        where.status = status as SubmissionStatus;
      }
    }

    // Filter by type
    if (type && typeof type === "string") {
      where.submissionType = type as SubmissionType;
    }

    // Filter by date range
    if (fromDate && typeof fromDate === "string") {
      where.createdAt = { ...where.createdAt, gte: new Date(fromDate) };
    }
    if (toDate && typeof toDate === "string") {
      where.createdAt = { ...where.createdAt, lte: new Date(toDate) };
    }

    // Search in title, city, country, university
    if (search && typeof search === "string") {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { hostCity: { contains: search, mode: "insensitive" } },
        { hostCountry: { contains: search, mode: "insensitive" } },
        { hostUniversity: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50); // Max 50 per page
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    const orderBy: any = {};
    if (
      sortBy === "updatedAt" ||
      sortBy === "createdAt" ||
      sortBy === "submittedAt"
    ) {
      orderBy[sortBy] = order === "asc" ? "asc" : "desc";
    } else if (sortBy === "status") {
      orderBy.status = order === "asc" ? "asc" : "desc";
    } else if (sortBy === "type") {
      orderBy.submissionType = order === "asc" ? "asc" : "desc";
    } else {
      orderBy.updatedAt = "desc"; // Default
    }

    // Fetch submissions
    const [submissions, total] = await Promise.all([
      prisma.student_submissions.findMany({
        where,
        orderBy,
        take: limitNum,
        skip,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.student_submissions.count({ where }),
    ]);

    // Calculate statistics if requested
    let stats: SubmissionStats | null = null;
    if (includeStats === "true") {
      stats = await calculateSubmissionStats(user.id);
    }

    // Format response
    const response: any = {
      submissions: submissions.map((sub) => ({
        id: sub.id,
        submissionType: sub.submissionType,
        status: sub.status,
        title: sub.title,
        hostCity: sub.hostCity,
        hostCountry: sub.hostCountry,
        hostUniversity: sub.hostUniversity,
        semester: sub.semester,
        academicYear: sub.academicYear,
        formStep: sub.formStep,
        reviewFeedback: sub.reviewFeedback,
        reviewedBy: sub.reviewer
          ? {
              id: sub.reviewer.id,
              name: `${sub.reviewer.firstName} ${sub.reviewer.lastName}`,
            }
          : null,
        reviewedAt: sub.reviewedAt,
        submittedAt: sub.submittedAt,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        isPublic: sub.isPublic,
        isFeatured: sub.isFeatured,
        qualityScore: sub.qualityScore,
        tags: sub.tags,
        version: sub.version,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + submissions.length < total,
      },
    };

    if (stats) {
      response.stats = stats;
    }

    // Cache for 30 seconds (submissions change frequently for users)
    res.setHeader(
      "Cache-Control",
      "private, s-maxage=30, stale-while-revalidate=60",
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("User Submissions API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Calculate submission statistics for a user
 */
async function calculateSubmissionStats(
  userId: string,
): Promise<SubmissionStats> {
  // Get all submissions for the user
  const allSubmissions = await prisma.student_submissions.findMany({
    where: { userId },
    select: {
      status: true,
      submissionType: true,
      createdAt: true,
      submittedAt: true,
      reviewedAt: true,
    },
  });

  // Count by status
  const byStatus: Record<string, number> = {};
  allSubmissions.forEach((sub) => {
    byStatus[sub.status] = (byStatus[sub.status] || 0) + 1;
  });

  // Count by type
  const byType: Record<string, number> = {};
  allSubmissions.forEach((sub) => {
    byType[sub.submissionType] = (byType[sub.submissionType] || 0) + 1;
  });

  // Count recent submissions (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = allSubmissions.filter(
    (sub) => sub.createdAt >= thirtyDaysAgo,
  ).length;

  // Calculate average response time (submitted to reviewed)
  const reviewedSubmissions = allSubmissions.filter(
    (sub) => sub.submittedAt && sub.reviewedAt,
  );

  let avgResponseTime: number | null = null;
  if (reviewedSubmissions.length > 0) {
    const totalResponseTime = reviewedSubmissions.reduce((sum, sub) => {
      const responseTime =
        new Date(sub.reviewedAt!).getTime() -
        new Date(sub.submittedAt!).getTime();
      return sum + responseTime;
    }, 0);
    avgResponseTime = Math.round(
      totalResponseTime / reviewedSubmissions.length / (1000 * 60 * 60 * 24),
    ); // Convert to days
  }

  return {
    total: allSubmissions.length,
    byStatus,
    byType,
    recentCount,
    avgResponseTime,
  };
}
