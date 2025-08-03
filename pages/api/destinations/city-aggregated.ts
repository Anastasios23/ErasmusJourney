import { NextApiRequest, NextApiResponse } from "next";
import {
  aggregateCityData,
  getAllCitiesAggregatedData,
} from "../../../src/services/cityAggregationService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { city, country, all } = req.query;

    // If requesting all cities
    if (all === "true") {
      console.log("Fetching aggregated data for all cities");
      const allCitiesData = await getAllCitiesAggregatedData();

      return res.status(200).json({
        success: true,
        cities: allCitiesData,
        totalCities: allCitiesData.length,
        timestamp: new Date().toISOString(),
      });
    }

    // If requesting specific city
    if (!city || !country) {
      return res.status(400).json({
        error: "Missing parameters",
        message:
          "Both 'city' and 'country' parameters are required, or use 'all=true' for all cities",
      });
    }

    console.log(`Fetching aggregated data for ${city}, ${country}`);

    try {
      const cityData = await aggregateCityData(
        city as string,
        country as string,
      );

      console.log(`Successfully aggregated data for ${city}, ${country}:`, {
        totalSubmissions: cityData.totalSubmissions,
        costSubmissions: cityData.livingCosts.costSubmissions,
        ratingSubmissions: cityData.ratings.ratingSubmissions,
      });

      // Check if city has any data
      if (cityData.totalSubmissions === 0) {
        return res.status(404).json({
          error: "No data found",
          message: `No published submissions found for ${city}, ${country}`,
          city: city as string,
          country: country as string,
        });
      }

      res.status(200).json({
        success: true,
        data: cityData,
        timestamp: new Date().toISOString(),
      });
    } catch (aggregationError) {
      console.error(
        `Error in aggregateCityData for ${city}, ${country}:`,
        aggregationError,
      );

      // Check if it's a database connection issue
      if (aggregationError instanceof Error) {
        if (
          aggregationError.message.includes("Prisma") ||
          aggregationError.message.includes("database")
        ) {
          return res.status(500).json({
            error: "Database connection error",
            message: "Unable to connect to the database",
            details: aggregationError.message,
          });
        }
      }

      throw aggregationError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("Error aggregating city data:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to aggregate city data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
