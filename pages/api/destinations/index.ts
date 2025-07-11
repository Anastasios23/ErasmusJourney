import { NextApiRequest, NextApiResponse } from "next";
import { ERASMUS_DESTINATIONS } from "../../../src/data/destinations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // In the future, this will merge with user-generated content
    // For now, return the base destinations data
    const destinations = ERASMUS_DESTINATIONS.map((destination) => ({
      ...destination,
      // Add user-generated content fields that will be populated later
      userStories: [],
      userAccommodationTips: [],
      userCourseMatches: [],
      userReviews: [],
    }));

    res.status(200).json(destinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
