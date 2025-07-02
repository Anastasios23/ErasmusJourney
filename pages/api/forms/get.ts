import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession, isAdmin } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { FormType, SubmissionStatus } from "@prisma/client";

const typeMapping: Record<string, FormType> = {
  "basic-info": "BASIC_INFO",
  "course-matching": "COURSE_MATCHING",
  accommodation: "ACCOMMODATION",
  story: "STORY",
  experience: "EXPERIENCE",
};

const statusMapping: Record<string, SubmissionStatus> = {
  draft: "DRAFT",
  submitted: "SUBMITTED",
  published: "PUBLISHED",
  rejected: "REJECTED",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerAuthSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { type, status, userId } = req.query;

    // Build query conditions
    const whereClause: any = {};

    // Filter by user
    if (userId && userId !== "all") {
      // Only admins can view other users' submissions
      if (!isAdmin(session)) {
        whereClause.userId = session.user.id;
      } else {
        whereClause.userId = userId as string;
      }
    } else {
      // Default to current user's submissions unless admin viewing all
      if (!isAdmin(session) || !userId) {
        whereClause.userId = session.user.id;
      }
    }

    // Filter by type
    if (type && type !== "all" && typeMapping[type as string]) {
      whereClause.type = typeMapping[type as string];
    }

    // Filter by status
    if (status && status !== "all" && statusMapping[status as string]) {
      whereClause.status = statusMapping[status as string];
    }

    // Fetch submissions from database
    const submissions = await prisma.formSubmission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform to match expected format
    const transformedSubmissions = submissions.map((submission) => ({
      id: submission.id,
      userId: submission.user.email,
      type: submission.type.toLowerCase().replace("_", "-"),
      title: submission.title,
      data: submission.data,
      status: submission.status.toLowerCase(),
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      user: submission.user,
    }));

    res.status(200).json({ submissions: transformedSubmissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
