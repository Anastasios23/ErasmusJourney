import type { NextApiRequest, NextApiResponse } from "next";
import { getCourseMatchingExperiences } from "../../../src/utils/courseMatchingData";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { experiences, stats } = await getCourseMatchingExperiences();

    res.status(200).json({
      success: true,
      experiences: experiences || [],
      stats: stats || {
        totalExperiences: 0,
        avgDifficulty: 0,
        successRate: 0,
        avgCoursesMatched: 0,
        topDestinations: [],
        topDepartments: [],
        difficultyBreakdown: {},
        recommendationRate: 0,
      },
    });
  } catch (error) {
    console.error("Error in course matching experiences API:", error);

    // Return empty data with 200 status so the page can still render
    res.status(200).json({
      success: false,
      experiences: [],
      stats: {
        totalExperiences: 0,
        avgDifficulty: 0,
        successRate: 0,
        avgCoursesMatched: 0,
        topDestinations: [],
        topDepartments: [],
        difficultyBreakdown: {},
        recommendationRate: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
