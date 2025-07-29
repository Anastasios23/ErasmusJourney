import { NextApiRequest, NextApiResponse } from "next";

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

  // Simple mock response
  const result = {
    id: storyId,
    analysis: {
      sentiment: "positive" as const,
      topics: ["study abroad", "experience"],
      readingTime: 2,
      difficulty: "beginner" as const,
      keywords: ["university", "experience"],
      recommendedFor: ["new students"],
    },
    suggestions: [
      {
        type: "improvement" as const,
        message: "Consider adding more specific details about your experience",
        priority: "medium" as const,
      },
    ],
    score: 75,
    generatedAt: new Date().toISOString(),
  };

  res.status(200).json(result);
}
