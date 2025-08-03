import { NextApiRequest, NextApiResponse } from "next";
import DestinationDataService from "../../src/services/destinationDataService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { featured, search, withStudentData } = req.query;

    let destinations;

    if (search && typeof search === "string") {
      // Search destinations
      destinations = await DestinationDataService.searchDestinations(search);
    } else {
      // Get all destinations with optional filters
      const options = {
        featured: featured === "true" ? true : undefined,
        withStudentData: withStudentData !== "false", // Default to true
      };

      destinations = await DestinationDataService.getAllDestinations(options);
    }

    return res.status(200).json({
      destinations,
      totalCount: destinations.length,
    });
  } catch (error) {
    console.error("Error fetching enhanced destinations:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
