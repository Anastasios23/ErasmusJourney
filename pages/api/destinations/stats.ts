import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    // Get all living expenses submissions
    const submissions = await prisma.form_submissions.findMany({
      where: {
        type: "LIVING_EXPENSES",
      },
      select: {
        data: true,
        createdAt: true,
      },
    });

    // Process submissions by destination
    const destinationMap = new Map<
      string,
      {
        city: string;
        country: string;
        totalCost: number;
        studentCount: number;
        costs: number[];
      }
    >();

    submissions.forEach((submission) => {
      const data = submission.data as any;
      const destination = data.destination;
      const expenses = data.expenses;

      if (destination?.city && destination?.country && expenses) {
        const key = `${destination.city}-${destination.country}`;
        const totalCost =
          parseFloat(expenses.accommodation || 0) +
          parseFloat(expenses.food || 0) +
          parseFloat(expenses.transport || 0) +
          parseFloat(expenses.entertainment || 0);

        if (!destinationMap.has(key)) {
          destinationMap.set(key, {
            city: destination.city,
            country: destination.country,
            totalCost: 0,
            studentCount: 0,
            costs: [],
          });
        }

        const dest = destinationMap.get(key)!;
        dest.totalCost += totalCost;
        dest.studentCount += 1;
        dest.costs.push(totalCost);
      }
    });

    // Calculate statistics
    const destinations = Array.from(destinationMap.values());
    const totalDestinations = destinations.length;
    const totalSubmissions = submissions.length;

    // Calculate average costs for each destination
    const destinationStats = destinations.map((dest) => ({
      city: dest.city,
      country: dest.country,
      studentCount: dest.studentCount,
      avgCost: Math.round(dest.totalCost / dest.studentCount),
    }));

    // Sort by student count for popular destinations
    const popularDestinations = destinationStats
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 10);

    // Sort by cost for cost-effective destinations
    const costEffectiveDestinations = destinationStats
      .filter((dest) => dest.studentCount >= 3) // Only include destinations with enough data
      .sort((a, b) => a.avgCost - b.avgCost)
      .slice(0, 10)
      .map((dest) => ({
        ...dest,
        satisfactionScore: 4.2 + Math.random() * 0.6, // Placeholder until we have real satisfaction data
      }));

    // Calculate cost range
    const allCosts = destinationStats
      .map((d) => d.avgCost)
      .filter((cost) => cost > 0);
    const avgCostRange = {
      min: allCosts.length > 0 ? Math.min(...allCosts) : 0,
      max: allCosts.length > 0 ? Math.max(...allCosts) : 0,
    };

    const response = {
      totalDestinations,
      totalSubmissions,
      avgCostRange,
      popularDestinations,
      costEffectiveDestinations,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching destination stats:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
