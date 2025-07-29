import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

interface StoryAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  readingTime: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  keywords: string[];
  recommendedFor: string[];
}

interface ContentSuggestion {
  type: "improvement" | "missing_info" | "enhancement";
  message: string;
  priority: "low" | "medium" | "high";
}

interface AnalysisResult {
  id: string;
  analysis: StoryAnalysis;
  suggestions: ContentSuggestion[];
  score: number;
  generatedAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { storyId } = req.body;

  if (!storyId) {
    return res.status(400).json({ message: "Story ID is required" });
  }

  try {
    // Fetch the story from database
    const submission = await prisma.formSubmission.findFirst({
      where: {
        id: storyId,
        type: "EXPERIENCE",
      },
      include: {
        user: {
          select: {
            firstName: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Get basic info for context
    const basicInfo = await prisma.formSubmission.findFirst({
      where: {
        userId: submission.userId,
        type: "BASIC_INFO",
        status: "SUBMITTED",
      },
    });

    const storyData = submission.data as any;
    const basicData = basicInfo?.data as any;

    const storyText = storyData.experienceDescription || storyData.story || "";
    const tips = Array.isArray(storyData.tips)
      ? storyData.tips.join(" ")
      : storyData.tips || "";
    const fullContent = `${storyText} ${tips}`.trim();

    // Perform AI analysis (simulated - in production you'd use actual AI services)
    const analysis = await analyzeStoryContent(fullContent, {
      university: basicData?.hostUniversity || "",
      city: basicData?.hostCity || "",
      country: basicData?.hostCountry || "",
      department: basicData?.department || "",
      levelOfStudy: basicData?.levelOfStudy || "",
    });

    const result: AnalysisResult = {
      id: storyId,
      analysis,
      suggestions: generateContentSuggestions(fullContent, analysis),
      score: calculateOverallScore(analysis, fullContent),
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error analyzing story:", error);
    res.status(500).json({
      error: "Failed to analyze story",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function analyzeStoryContent(
  content: string,
  context: any,
): Promise<StoryAnalysis> {
  // Simulated AI analysis - in production, integrate with OpenAI, Azure Cognitive Services, etc.

  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  // Sentiment analysis simulation
  const positiveWords = [
    "amazing",
    "great",
    "wonderful",
    "fantastic",
    "love",
    "enjoy",
    "incredible",
    "beautiful",
  ];
  const negativeWords = [
    "difficult",
    "challenging",
    "problem",
    "issue",
    "hard",
    "struggle",
    "disappointed",
  ];

  const positiveCount = positiveWords.reduce(
    (count, word) => count + (content.toLowerCase().includes(word) ? 1 : 0),
    0,
  );
  const negativeCount = negativeWords.reduce(
    (count, word) => count + (content.toLowerCase().includes(word) ? 1 : 0),
    0,
  );

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (positiveCount > negativeCount + 1) sentiment = "positive";
  else if (negativeCount > positiveCount + 1) sentiment = "negative";

  // Topic extraction simulation
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
  };

  const topics = Object.entries(topicKeywords)
    .filter(([topic, keywords]) =>
      keywords.some((keyword) => content.toLowerCase().includes(keyword)),
    )
    .map(([topic]) => topic)
    .slice(0, 3);

  // Difficulty assessment
  const complexWords = content
    .split(/\s+/)
    .filter((word) => word.length > 8).length;
  const complexity = complexWords / wordCount;

  let difficulty: "beginner" | "intermediate" | "advanced" = "beginner";
  if (complexity > 0.15) difficulty = "advanced";
  else if (complexity > 0.1) difficulty = "intermediate";

  // Extract keywords
  const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const wordFreq: Record<string, number> = {};
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const keywords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([word]) => word);

  // Generate recommendations
  const recommendedFor = [];
  if (topics.includes("accommodation"))
    recommendedFor.push("students looking for housing");
  if (topics.includes("academics"))
    recommendedFor.push("academic-focused students");
  if (topics.includes("culture")) recommendedFor.push("culture enthusiasts");
  if (sentiment === "positive")
    recommendedFor.push("first-time exchange students");

  return {
    sentiment,
    topics,
    readingTime,
    difficulty,
    keywords,
    recommendedFor: recommendedFor.slice(0, 3),
  };
}

function generateContentSuggestions(
  content: string,
  analysis: StoryAnalysis,
): ContentSuggestion[] {
  const suggestions: ContentSuggestion[] = [];

  const wordCount = content.split(/\s+/).length;

  // Content length suggestions
  if (wordCount < 100) {
    suggestions.push({
      type: "improvement",
      message:
        "Consider adding more details to make your story more engaging and helpful",
      priority: "high",
    });
  } else if (wordCount > 1000) {
    suggestions.push({
      type: "improvement",
      message:
        "Your story is quite long. Consider breaking it into sections or summarizing key points",
      priority: "medium",
    });
  }

  // Topic coverage suggestions
  if (analysis.topics.length < 2) {
    suggestions.push({
      type: "missing_info",
      message:
        "Consider adding information about accommodation, academics, or cultural experiences",
      priority: "medium",
    });
  }

  // Practical information suggestions
  if (
    !content.toLowerCase().includes("tip") &&
    !content.toLowerCase().includes("advice")
  ) {
    suggestions.push({
      type: "enhancement",
      message:
        "Adding practical tips or advice would make your story more valuable to future students",
      priority: "medium",
    });
  }

  // Contact information suggestion
  if (
    !content.toLowerCase().includes("contact") &&
    !content.toLowerCase().includes("reach")
  ) {
    suggestions.push({
      type: "enhancement",
      message:
        "Consider adding how future students can contact you for questions",
      priority: "low",
    });
  }

  return suggestions;
}

function calculateOverallScore(
  analysis: StoryAnalysis,
  content: string,
): number {
  let score = 0;

  // Base score for having content
  score += Math.min(content.split(/\s+/).length / 10, 30); // Max 30 points for length

  // Topic diversity bonus
  score += analysis.topics.length * 10; // 10 points per topic

  // Sentiment bonus
  if (analysis.sentiment === "positive") score += 15;
  else if (analysis.sentiment === "neutral") score += 5;

  // Readability bonus
  if (analysis.difficulty === "intermediate") score += 10;
  else if (analysis.difficulty === "beginner") score += 5;

  // Keywords richness
  score += Math.min(analysis.keywords.length, 15);

  return Math.min(Math.round(score), 100);
}
