import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { range = "30d" } = req.query;

    // Calculate date range
    const now = new Date();
    const daysBack =
      range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Fetch all stories within the date range
    const stories = await prisma.formSubmission.findMany({
      where: {
        type: "EXPERIENCE",
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch basic info for location data
    const basicInfoData = await prisma.formSubmission.findMany({
      where: {
        type: "BASIC_INFO",
        status: "SUBMITTED",
      },
    });

    const basicInfoMap = new Map();
    basicInfoData.forEach((info) => {
      basicInfoMap.set(info.userId, info.data);
    });

    // Calculate analytics
    const totalStories = stories.length;
    const totalViews = Math.floor(Math.random() * 10000) + totalStories * 50; // Mock data
    const totalLikes = Math.floor(Math.random() * 1000) + totalStories * 5; // Mock data
    const totalShares = Math.floor(Math.random() * 500) + totalStories * 2; // Mock data

    // Generate timeline data
    const timelineData = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStories = stories.filter(
        (story) => story.createdAt.toDateString() === date.toDateString(),
      ).length;

      timelineData.push({
        date: date.toISOString().split("T")[0],
        stories: dayStories,
        views: Math.floor(Math.random() * 200) + dayStories * 10,
        engagement: Math.floor(Math.random() * 50) + dayStories * 3,
      });
    }

    // Country distribution
    const countryCount = new Map();
    stories.forEach((story) => {
      const basicInfo = basicInfoMap.get(story.userId) as any;
      const country = basicInfo?.hostCountry || "Unknown";
      countryCount.set(country, (countryCount.get(country) || 0) + 1);
    });

    const countryData = Array.from(countryCount.entries())
      .map(([country, count]) => ({
        country,
        count: count as number,
        percentage: Math.round(((count as number) / totalStories) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // University distribution
    const universityCount = new Map();
    stories.forEach((story) => {
      const basicInfo = basicInfoMap.get(story.userId) as any;
      const university = basicInfo?.hostUniversity || "Unknown University";
      universityCount.set(
        university,
        (universityCount.get(university) || 0) + 1,
      );
    });

    const universityData = Array.from(universityCount.entries())
      .map(([university, count]) => ({
        university,
        count: count as number,
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Mock rating 3-5
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Help topics analysis
    const topicCount = new Map();
    stories.forEach((story) => {
      const data = story.data as any;
      const topics = data.helpTopics || [];
      topics.forEach((topic: string) => {
        topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
      });
    });

    const topicData = Array.from(topicCount.entries())
      .map(([topic, count]) => ({
        topic,
        count: count as number,
        trend: Math.floor(Math.random() * 40) - 20, // Mock trend -20 to +20
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate growth rate (compare with previous period)
    const previousPeriodStart = new Date(
      startDate.getTime() - daysBack * 24 * 60 * 60 * 1000,
    );
    const previousStories = await prisma.formSubmission.count({
      where: {
        type: "EXPERIENCE",
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
    });

    const growthRate =
      previousStories > 0
        ? Math.round(((totalStories - previousStories) / previousStories) * 100)
        : 100;

    const analytics = {
      overview: {
        totalStories,
        totalViews,
        totalLikes,
        totalShares,
        averageRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Mock rating 3.5-5
        growthRate,
      },
      timelineData,
      countryData,
      universityData,
      topicData,
      userEngagement: {
        newUsers: Math.floor(Math.random() * 100) + 50,
        returningUsers: Math.floor(Math.random() * 200) + 100,
        bounceRate: Math.floor(Math.random() * 30) + 20, // 20-50%
        averageSessionDuration: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
      },
    };

    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
