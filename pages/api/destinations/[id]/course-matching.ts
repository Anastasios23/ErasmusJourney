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

  const { id, country } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Destination ID parameter is required" });
  }

  try {
    // Parse the destination ID to extract city and country
    // Format expected: "paris-france" or similar
    const parts = id.split('-');
    const city = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "";
    const countryFromId = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : "";

    // Use query parameter country if provided, otherwise use parsed country
    const countryParam = (country && typeof country === "string") ? country : countryFromId;

    if (!city) {
      return res.status(400).json({ error: "Invalid destination ID format" });
    }

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
