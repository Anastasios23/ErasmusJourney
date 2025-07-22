import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession, isAdmin } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

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
    if (type && type !== "all") {
      whereClause.type = (type as string).toUpperCase().replace("-", "_");
    }

    // Filter by status
    if (status && status !== "all") {
      whereClause.status = (status as string).toUpperCase();
    }

    // Fetch submissions from database
    const submissions = await prisma.formSubmission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
