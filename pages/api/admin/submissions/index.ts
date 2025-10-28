import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

type SubmissionStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REVISION_NEEDED"
  | "ARCHIVED";
type SubmissionType =
  | "FULL_EXPERIENCE"
  | "ACCOMMODATION"
  | "COURSE_EXCHANGE"
  | "QUICK_TIP"
  | "DESTINATION_INFO";

/**
 * Admin Submissions List API
 *
 * GET /api/admin/submissions - List all submissions (admin only)
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const {
      status,
      type,
      search,
      city,
      country,
      limit = "50",
      offset = "0",
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = req.query;

    // Build where clause
    const where: any = {};

    if (status && typeof status === "string") {
      where.status = status as SubmissionStatus;
    }

    if (type && typeof type === "string") {
      where.submissionType = type as SubmissionType;
    }

    if (city && typeof city === "string") {
      where.hostCity = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (country && typeof country === "string") {
      where.hostCountry = {
        contains: country,
        mode: "insensitive",
      };
    }

    if (search && typeof search === "string") {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          hostCity: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          hostCountry: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          hostUniversity: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === "qualityScore") {
      orderBy.qualityScore = sortOrder;
    } else if (sortBy === "submittedAt") {
      orderBy.submittedAt = sortOrder;
    } else if (sortBy === "createdAt") {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.updatedAt = sortOrder;
    }

    // Fetch submissions
    const submissions = await prisma.student_submissions.findMany({
      where,
      orderBy,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
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
    });

    // Get total count
    const total = await prisma.student_submissions.count({ where });

    // Get status counts
    const statusCounts = await prisma.student_submissions.groupBy({
      by: ["status"],
      _count: true,
    });

    const stats = {
      total,
      byStatus: statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    return res.status(200).json({
      submissions,
      stats,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: total > parseInt(offset as string) + parseInt(limit as string),
      },
    });
  } catch (error) {
    console.error("Admin Submissions API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
