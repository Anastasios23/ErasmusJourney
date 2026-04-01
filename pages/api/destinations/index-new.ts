import { NextApiRequest, NextApiResponse } from "next";
import DestinationDataService from "../../../src/services/destinationDataService";
import { getClientSafeErrorMessage } from "@/lib/databaseErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { featured, search, withStudentData = "true" } = req.query;

    let destinations;

    if (search && typeof search === "string") {
      // Search functionality
      destinations = await DestinationDataService.searchDestinations(search);
    } else {
      // Get all destinations with optional filters
      destinations = await DestinationDataService.getAllDestinations({
        featured: featured === "true",
        withStudentData: withStudentData === "true",
      });
    }

    return res.status(200).json({
      success: true,
      data: destinations,
      count: destinations.length,
    });
  } catch (error) {
    console.error("Public destinations API error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch destinations",
      error: getClientSafeErrorMessage(
        error,
        "Unable to fetch destinations right now.",
      ),
    });
  }
}
