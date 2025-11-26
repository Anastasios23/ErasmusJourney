import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

interface RecommendationRequest {
  userId?: string;
  preferences?: {
    countries?: string[];
    universities?: string[];
    topics?: string[];
    studyLevel?: string;
  };
  currentStoryId?: string;
}

interface StoryRecommendation {
  id: string;
  title: string;
  excerpt: string;
  studentName: string;
  university: string;
  city: string;
  country: string;
  topics: string[];
  matchScore: number;
  matchReasons: string[];
  readingTime: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId, preferences, currentStoryId }: RecommendationRequest =
      req.body;

    // Fetch all published stories
    const stories = await prisma.form_submissions.findMany({
      where: {
        type: "EXPERIENCE",
        status: { in: ["PUBLISHED", "SUBMITTED"] },
        ...(currentStoryId && { id: { not: currentStoryId } }),
      },
      include: {
        user: {
          select: {
            firstName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get basic info for all users
    const basicInfoData = await prisma.form_submissions.findMany({
      where: {
        type: "BASIC_INFO",
        status: "SUBMITTED",
      },
    });

    const basicInfoMap = new Map();
    basicInfoData.forEach((info) => {
      basicInfoMap.set(info.userId, info.data);
    });

    // Get user preferences if userId provided
    let userPreferences = preferences;
    if (userId && !userPreferences) {
      const userBasicInfo = await prisma.form_submissions.findFirst({
        where: {
          userId: userId,
          type: "BASIC_INFO",
          status: "SUBMITTED",
        },
      });

      if (userBasicInfo) {
        const data = userBasicInfo.data as any;
        userPreferences = {
          countries: [data.hostCountry].filter(Boolean),
          universities: [data.hostUniversity].filter(Boolean),
          topics: data.interests || [],
          studyLevel: data.levelOfStudy,
        };
      }
    }

    // Transform stories and calculate recommendations
    const recommendations: StoryRecommendation[] = [];

    for (const story of stories) {
      const storyData = story.data as any;
      const basicInfo = basicInfoMap.get(story.userId) as any;

      if (!basicInfo) continue;

      const recommendation = await generateRecommendation(
        story,
        storyData,
        basicInfo,
        userPreferences,
      );

      if (recommendation.matchScore > 0) {
        recommendations.push(recommendation);
      }
    }

    // Sort by match score and return top recommendations
    const sortedRecommendations = recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.status(200).json({
      recommendations: sortedRecommendations,
      totalFound: recommendations.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({
      error: "Failed to generate recommendations",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function generateRecommendation(
  story: any,
  storyData: any,
  basicInfo: any,
  userPreferences?: any,
): Promise<StoryRecommendation> {
  const studentName =
    storyData.nickname || story.user?.firstName || "Anonymous";
  const university = basicInfo?.hostUniversity || "Unknown University";
  const city = basicInfo?.hostCity || "Unknown City";
  const country = basicInfo?.hostCountry || "Unknown Country";

  const storyText = storyData.experienceDescription || storyData.story || "";
  const tips = Array.isArray(storyData.tips)
    ? storyData.tips.join(" ")
    : storyData.tips || "";
  const fullContent = `${storyText} ${tips}`.trim();

  // Extract topics from content
  const topicKeywords = {
    accommodation: ["room", "apartment", "housing", "dorm", "rent", "living"],
    academics: [
      "class",
      "course",
      "professor",
      "study",
      "exam",
      "university",
      "lecture",
    ],
    culture: [
      "culture",
      "tradition",
      "local",
      "people",
      "food",
      "language",
      "customs",
    ],
    travel: [
      "travel",
      "trip",
      "visit",
      "explore",
      "journey",
      "adventure",
      "sightseeing",
    ],
    social: ["friend", "meet", "social", "party", "event", "club", "people"],
    practical: [
      "money",
      "budget",
      "transport",
      "visa",
      "document",
      "practical",
    ],
    food: ["food", "eat", "restaurant", "cuisine", "cook", "meal", "taste"],
    language: [
      "language",
      "speak",
      "learn",
      "communicate",
      "translate",
      "understand",
    ],
  };

  const topics = Object.entries(topicKeywords)
    .filter(([topic, keywords]) =>
      keywords.some((keyword) => fullContent.toLowerCase().includes(keyword)),
    )
    .map(([topic]) => topic);

  // Calculate match score
  let matchScore = 0;
  const matchReasons: string[] = [];

  // Base score for having content
  const wordCount = fullContent.split(/\s+/).length;
  matchScore += Math.min(wordCount / 50, 20); // Max 20 points for content length

  if (userPreferences) {
    // Country match
    if (userPreferences.countries?.includes(country)) {
      matchScore += 30;
      matchReasons.push(`Same destination: ${country}`);
    }

    // University match
    if (userPreferences.universities?.includes(university)) {
      matchScore += 25;
      matchReasons.push(`Same university: ${university}`);
    }

    // Topic overlap
    const topicOverlap = topics.filter((topic) =>
      userPreferences.topics?.includes(topic),
    );
    if (topicOverlap.length > 0) {
      matchScore += topicOverlap.length * 10;
      matchReasons.push(`Similar interests: ${topicOverlap.join(", ")}`);
    }

    // Study level match
    if (userPreferences.studyLevel === basicInfo?.levelOfStudy) {
      matchScore += 15;
      matchReasons.push(`Same study level: ${userPreferences.studyLevel}`);
    }
  }

  // Quality indicators
  if (storyData.tips && storyData.tips.length > 0) {
    matchScore += 10;
    matchReasons.push("Contains practical tips");
  }

  if (storyData.contactInfo || storyData.contactPreference) {
    matchScore += 5;
    matchReasons.push("Student available for contact");
  }

  // Recency bonus (more recent stories get slight boost)
  const daysOld =
    (Date.now() - new Date(story.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld < 30) {
    matchScore += 5;
  } else if (daysOld < 90) {
    matchScore += 2;
  }

  // If no specific preferences, use general quality indicators
  if (!userPreferences) {
    matchScore += topics.length * 5; // Points for topic diversity
    if (wordCount > 200) matchScore += 10; // Substantial content
  }

  const readingTime = Math.ceil(wordCount / 200);

  return {
    id: story.id,
    title: `${studentName}'s Experience in ${city}`,
    excerpt:
      storyText.substring(0, 200) + (storyText.length > 200 ? "..." : ""),
    studentName,
    university,
    city,
    country,
    topics,
    matchScore: Math.round(matchScore),
    matchReasons,
    readingTime,
  };
}
