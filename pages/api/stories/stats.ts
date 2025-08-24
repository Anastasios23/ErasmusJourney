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
    // Get total stories count from form submissions
    const totalStories = await prisma.formSubmission.count({
      where: {
        type: { in: ["EXPERIENCE", "STORY"] },
        status: { in: ["SUBMITTED", "PUBLISHED"] }
      },
    });

    // Get total engagement stats
    const engagementStats = await prisma.engagement.aggregate({
      _sum: {
        views: true,
      },
      _count: {
        id: true,
      },
    });

    // Get total likes count
    const totalLikes = await prisma.engagement.count({
      where: { liked: true },
    });

    // Get total bookmarks count
    const totalBookmarks = await prisma.engagement.count({
      where: { bookmarked: true },
    });

    // Get average rating from engagements
    const ratingStats = await prisma.engagement.aggregate({
      where: { rating: { gt: 0 } },
      _avg: {
        rating: true,
      },
    });

    // Get story submissions by type/category for top categories
    const storyTypes = await prisma.formSubmission.groupBy({
      by: ["type"],
      where: {
        type: { in: ["EXPERIENCE", "STORY"] },
        status: { in: ["SUBMITTED", "PUBLISHED"] }
      },
      _count: {
        type: true,
      },
      orderBy: {
        _count: {
          type: "desc",
        },
      },
      take: 5,
    });

    // Get recent activity (last 10 published stories)
    const recentStories = await prisma.formSubmission.findMany({
      where: {
        type: { in: ["EXPERIENCE", "STORY"] },
        status: { in: ["SUBMITTED", "PUBLISHED"] }
      },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate helpfulness rate (stories with engagement)
    const storiesWithEngagement = await prisma.formSubmission.count({
      where: {
        type: { in: ["EXPERIENCE", "STORY"] },
        status: { in: ["SUBMITTED", "PUBLISHED"] },
        engagements: {
          some: {
            OR: [
              { liked: true },
              { bookmarked: true },
              { views: { gt: 0 } }
            ]
          }
        }
      },
    });

    const helpfulnessRate =
      totalStories > 0 ? (storiesWithEngagement / totalStories) * 100 : 0;

    // Format response
    const stats = {
      totalStories,
      totalLikes,
      totalViews: engagementStats._sum.views || 0,
      avgRating: ratingStats._avg.rating || 0,
      helpfulnessRate: Math.round(helpfulnessRate),
      topCategories: storyTypes.map((type) => ({
        name: type.type,
        count: type._count.type,
      })),
      recentActivity: recentStories.map((story) => ({
        type: "story_published",
        storyId: story.id,
        title: story.title,
        category: story.type,
        author: `${story.user.firstName || ''} ${story.user.lastName || ''}`.trim() || 'Anonymous',
        timestamp: story.createdAt,
      })),
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching stories stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
