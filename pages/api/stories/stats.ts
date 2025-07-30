import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Get total stories count
    const totalStories = await prisma.story.count({
      where: { isPublic: true },
    });

    // Get total likes and views from stories
    const aggregateStats = await prisma.story.aggregate({
      where: { isPublic: true },
      _sum: {
        likes: true,
        views: true,
      },
      _avg: {
        likes: true,
      },
    });

    // Get story categories with counts
    const categoryCounts = await prisma.story.groupBy({
      by: ["category"],
      where: { isPublic: true },
      _count: {
        category: true,
      },
      orderBy: {
        _count: {
          category: "desc",
        },
      },
      take: 5,
    });

    // Get recent activity (last 10 published stories)
    const recentStories = await prisma.story.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        title: true,
        createdAt: true,
        category: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate helpfulness rate (stories with likes > 0)
    const storiesWithLikes = await prisma.story.count({
      where: {
        isPublic: true,
        likes: { gt: 0 },
      },
    });

    const helpfulnessRate =
      totalStories > 0 ? (storiesWithLikes / totalStories) * 100 : 0;

    // Format response
    const stats = {
      totalStories,
      totalLikes: aggregateStats._sum.likes || 0,
      totalViews: aggregateStats._sum.views || 0,
      avgRating: aggregateStats._avg.likes || 0,
      helpfulnessRate: Math.round(helpfulnessRate),
      topCategories: categoryCounts.map((cat) => ({
        name: cat.category,
        count: cat._count.category,
      })),
      recentActivity: recentStories.map((story) => ({
        type: "story_published",
        storyId: story.id,
        title: story.title,
        category: story.category,
        author: `${story.author.firstName} ${story.author.lastName}`,
        timestamp: story.createdAt,
      })),
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching stories stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
