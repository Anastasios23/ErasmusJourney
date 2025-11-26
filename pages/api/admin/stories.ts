import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    return handleGetStories(req, res);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleGetStories(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real app, you'd verify admin authentication here
    // For now, we'll just fetch all stories with admin fields

    const stories = await prisma.form_submissions.findMany({
      where: {
        OR: [{ type: "EXPERIENCE" }, { type: "STORY" }],
      },
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
        createdAt: "desc",
      },
    });

    // Transform the data for admin view
    const adminStories = await Promise.all(
      stories.map(async (submission) => {
        // Get basic info for location data
        const basicInfo = await prisma.form_submissions.findFirst({
          where: {
            userId: submission.userId,
            type: "BASIC_INFO",
            status: "SUBMITTED",
          },
        });

        const data = submission.data as any;
        const basicData = basicInfo?.data as any;

        return {
          id: submission.id,
          studentName:
            data.nickname || submission.user?.firstName || "Anonymous",
          university: basicData?.hostUniversity || "Unknown University",
          city: basicData?.hostCity || "Unknown City",
          country: basicData?.hostCountry || "Unknown Country",
          department: basicData?.department || "Unknown Department",
          story:
            data.experienceDescription || data.story || "No story provided",
          tips: data.tips || [],
          helpTopics: data.helpTopics || [],
          contactMethod: data.contactPreference || null,
          contactInfo: data.contactInfo || null,
          accommodationTips: data.accommodationTips || null,
          budgetTips: data.budgetTips || null,
          status: submission.status || "PENDING",
          isPublic: data.sharePublicly === true,
          createdAt: submission.createdAt.toISOString(),
          updatedAt: submission.updatedAt.toISOString(),
          userId: submission.userId,
          userEmail: submission.user?.email,
          moderatorNotes: data.moderatorNotes || null,
        };
      }),
    );

    res.status(200).json(adminStories);
  } catch (error) {
    console.error("Error fetching admin stories:", error);
    res.status(500).json({
      error: "Failed to fetch stories",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
