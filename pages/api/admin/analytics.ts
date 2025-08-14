import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      // For now, return mock data since the GeneratedDestination models are not yet in use
      // In a real implementation, these would query the actual generated destination tables

      const analytics = {
        overview: {
          totalDestinations: 0,
          publishedDestinations: 0,
          draftDestinations: 0,
          featuredDestinations: 0,
          totalAccommodations: 0,
          totalCourseExchanges: 0,
          totalSubmissions: await prisma.erasmusExperience.count({
            where: { status: "COMPLETED" },
          }),
        },
        averages: {
          averageRating: null,
          averageMonthlyCost: null,
          averageSubmissionsPerDestination: null,
        },
        topDestinations: [],
        recentDestinations: [],
        statusDistribution: [
          { status: "DRAFT", count: 0 },
          { status: "PUBLISHED", count: 0 },
          { status: "ARCHIVED", count: 0 },
        ],
        monthlyTrends: {},
      };

      res.status(200).json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
