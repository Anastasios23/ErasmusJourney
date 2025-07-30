import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id: storyId } = req.query;

  if (!storyId || typeof storyId !== "string") {
    return res.status(400).json({ error: "Story ID is required" });
  }

  const session = await getSession({ req });
  const userId = session?.user?.id;

  try {
    switch (req.method) {
      case "GET":
        // Get engagement data for a story
        const engagement = await prisma.engagement.findFirst({
          where: {
            storyId: storyId,
            userId: userId || undefined,
          },
        });

        // Get aggregate engagement data
        const aggregateData = await prisma.engagement.aggregate({
          where: { storyId },
          _count: {
            likes: true,
            views: true,
            comments: true,
          },
          _avg: {
            rating: true,
          },
        });

        // Get total counts
        const totalStats = await prisma.engagement.groupBy({
          by: ["storyId"],
          where: { storyId },
          _sum: {
            likes: true,
            views: true,
            comments: true,
          },
          _avg: {
            rating: true,
          },
        });

        const stats = totalStats[0] || {
          _sum: { likes: 0, views: 0, comments: 0 },
          _avg: { rating: 0 },
        };

        const responseData = {
          storyId,
          likes: stats._sum.likes || 0,
          views: stats._sum.views || 0,
          comments: stats._sum.comments || 0,
          rating: stats._avg.rating || 0,
          isLiked: engagement?.liked || false,
          isBookmarked: engagement?.bookmarked || false,
          lastViewed: engagement?.lastViewed,
        };

        return res.status(200).json(responseData);

      case "POST":
        if (!userId) {
          return res.status(401).json({ error: "Authentication required" });
        }

        // Update or create engagement record
        const existingEngagement = await prisma.engagement.findFirst({
          where: {
            storyId,
            userId,
          },
        });

        if (existingEngagement) {
          await prisma.engagement.update({
            where: { id: existingEngagement.id },
            data: {
              lastViewed: new Date(),
              views: { increment: 1 },
            },
          });
        } else {
          await prisma.engagement.create({
            data: {
              storyId,
              userId,
              views: 1,
              likes: 0,
              comments: 0,
              rating: 0,
              liked: false,
              bookmarked: false,
              lastViewed: new Date(),
            },
          });
        }

        return res.status(200).json({ success: true });

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res
          .status(405)
          .json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Error handling story engagement:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
