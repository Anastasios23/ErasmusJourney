import { NextApiRequest, NextApiResponse } from "next";
import { ContentIntegrationService } from "../../../src/services/contentIntegrationService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      featured,
      country,
      orderBy = "students",
      order = "desc",
      limit = 100,
    } = req.query;

    const options: any = {
      orderBy: orderBy as string,
      order: order as string,
      limit: parseInt(limit as string),
    };

    if (featured === "true") {
      options.featured = true;
    }

    if (country && country !== "all") {
      options.country = country as string;
    }

    const destinations = await ContentIntegrationService.getPublishedDestinations(options);

    res.status(200).json(destinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ 
      message: "Failed to fetch destinations",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
