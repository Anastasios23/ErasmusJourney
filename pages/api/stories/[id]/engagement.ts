import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id: storyId } = req.query;

  if (!storyId || typeof storyId !== "string") {
    return res.status(400).json({ error: "Story ID is required" });
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  try {
    switch (req.method) {
      case "GET":
        // Check if the story (form submission) exists
        const story = await prisma.form_submissions.findUnique({
          where: { id: storyId },
        });

        if (!story) {
          return res.status(404).json({ error: "Story not found" });
        }

        // Get user's engagement with this story
        const userEngagement = await prisma.engagement.findFirst({
          where: {
            storyId: storyId,
            userId: userId || undefined,
          },
        });

        // Get aggregate engagement stats for this story
        const aggregateStats = await prisma.engagement.aggregate({
          where: { storyId },
          _count: {
            id: true,
          },
          _sum: {
            views: true,
          },
        });

        // Get total likes and bookmarks for this story
        const likeCount = await prisma.engagement.count({
          where: { storyId, liked: true },
        });

        const bookmarkCount = await prisma.engagement.count({
          where: { storyId, bookmarked: true },
        });

        // Get average rating
        const ratingStats = await prisma.engagement.aggregate({
          where: { storyId, rating: { gt: 0 } },
          _avg: {
            rating: true,
          },
        });

        const responseData = {
          storyId,
          likes: likeCount,
          views: aggregateStats._sum.views || 0,
          comments: 0, // Comments not implemented yet
          rating: ratingStats._avg.rating || 0,
          isLiked: userEngagement?.liked || false,
          isBookmarked: userEngagement?.bookmarked || false,
          lastViewed: userEngagement?.lastViewed,
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
