import type { NextApiRequest, NextApiResponse } from "next";
import { getCourseMatchingInsights } from "../../../../src/utils/courseMatchingData";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, country } = req.query;

  if (!city || typeof city !== "string") {
    return res.status(400).json({ error: "City parameter is required" });
  }

  try {
    const countryParam = country && typeof country === "string" ? country : "";
    const insights = await getCourseMatchingInsights(city, countryParam);
    
    if (!insights) {
      return res.status(404).json({ 
        success: false,
        message: "No course matching data found for this destination" 
      });
    }
    
    res.status(200).json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error("Error in destination course matching insights API:", error);
    res.status(500).json({
      error: "Failed to fetch course matching insights",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
