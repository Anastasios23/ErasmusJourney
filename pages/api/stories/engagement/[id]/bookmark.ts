import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { id: storyId } = req.query;

  if (!storyId || typeof storyId !== "string") {
    return res.status(400).json({ error: "Story ID is required" });
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // Find or create engagement record
    const existingEngagement = await prisma.engagement.findFirst({
      where: {
        storyId,
        userId,
      },
    });

    if (existingEngagement) {
      // Toggle bookmark status
      const updatedEngagement = await prisma.engagement.update({
        where: { id: existingEngagement.id },
        data: {
          bookmarked: !existingEngagement.bookmarked,
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({
        success: true,
        bookmarked: updatedEngagement.bookmarked,
      });
    } else {
      // Create new engagement with bookmark
      const newEngagement = await prisma.engagement.create({
        data: {
          storyId,
          userId,
          bookmarked: true,
          liked: false,
          likes: 0,
          views: 0,
          comments: 0,
          rating: 0,
        },
      });

      return res.status(200).json({
        success: true,
        bookmarked: true,
      });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
