import type { NextApiRequest, NextApiResponse } from "next";
import { getCourseMatchingExperiences } from "../../../src/utils/courseMatchingData";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { experiences, stats } = await getCourseMatchingExperiences();
    
    res.status(200).json({
      success: true,
      experiences,
      stats,
    });
  } catch (error) {
    console.error("Error in course matching experiences API:", error);
    res.status(500).json({
      error: "Failed to fetch course matching experiences",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
