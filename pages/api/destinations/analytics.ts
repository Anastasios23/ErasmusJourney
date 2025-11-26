import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

/**
 * Destination Analytics API
 * Provides statistics and insights for destinations
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    // Check admin authentication for detailed analytics
    const isAdmin = session?.user?.role === "ADMIN";

    const { type = "overview", destinationId } = req.query;

    switch (type) {
      case "overview":
        return handleOverview(req, res, isAdmin);
      case "destination":
        return handleDestinationAnalytics(
          req,
          res,
          destinationId as string,
          isAdmin,
        );
      case "trends":
        return handleTrends(req, res, isAdmin);
      default:
        return res.status(400).json({ error: "Invalid analytics type" });
    }
  } catch (error) {
    console.error("Analytics API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleOverview(
  req: NextApiRequest,
  res: NextApiResponse,
  isAdmin: boolean,
) {
  const [
    totalDestinations,
    featuredDestinations,
    totalSubmissions,
    recentDestinations,
  ] = await Promise.all([
    prisma.destination.count(),
    prisma.destination.count({ where: { featured: true } }),
    prisma.form_submissions.count(),
    prisma.destination.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        country: true,
        featured: true,
        createdAt: true,
      },
    }),
  ]);

  const overview = {
    totalDestinations,
    featuredDestinations,
    totalSubmissions,
    recentDestinations,
  };

  if (isAdmin) {
    // Add admin-specific analytics
    const [countryStats, monthlyGrowth] = await Promise.all([
      getCountryStatistics(),
      getMonthlyGrowth(),
    ]);

    Object.assign(overview, {
      countryStats,
      monthlyGrowth,
    });
  }

  return res.status(200).json(overview);
}

async function handleDestinationAnalytics(
  req: NextApiRequest,
  res: NextApiResponse,
  destinationId: string,
  isAdmin: boolean,
) {
  if (!destinationId) {
    return res.status(400).json({ error: "Destination ID is required" });
  }

  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
  });

  if (!destination) {
    return res.status(404).json({ error: "Destination not found" });
  }

  // Get related form submissions (simplified for SQLite compatibility)
  const relatedSubmissions = await prisma.form_submissions.count({
    where: {
      OR: [
        { data: { string_contains: destination.country } },
        { data: { string_contains: destination.name } },
      ],
    },
  });

  const analytics = {
    destination,
    relatedSubmissions,
    views: Math.floor(Math.random() * 1000) + 100, // Placeholder for future implementation
    lastUpdated: destination.updatedAt,
  };

  if (isAdmin) {
    // Add admin-specific destination analytics
    Object.assign(analytics, {
      createdBy: "Admin", // Placeholder for future user tracking
      status: destination.featured ? "Featured" : "Active",
    });
  }

  return res.status(200).json(analytics);
}

async function handleTrends(
  req: NextApiRequest,
  res: NextApiResponse,
  isAdmin: boolean,
) {
  if (!isAdmin) {
    return res
      .status(403)
      .json({ error: "Admin access required for trends data" });
  }

  const [popularCountries, recentActivity] = await Promise.all([
    getPopularCountries(),
    getRecentActivity(),
  ]);

  return res.status(200).json({
    popularCountries,
    recentActivity,
  });
}

// Helper functions
async function getCountryStatistics() {
  const destinations = await prisma.destination.groupBy({
    by: ["country"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });

  return destinations.map((item) => ({
    country: item.country,
    count: item._count.id,
  }));
}

async function getMonthlyGrowth() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const destinations = await prisma.destination.findMany({
    where: {
      createdAt: {
        gte: sixMonthsAgo,
      },
    },
    select: {
      createdAt: true,
    },
  });

  // Group by month
  const monthlyData: Record<string, number> = {};
  destinations.forEach((dest) => {
    const monthKey = dest.createdAt.toISOString().slice(0, 7); // YYYY-MM
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
  });

  return Object.entries(monthlyData)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

async function getPopularCountries() {
  return await prisma.destination.groupBy({
    by: ["country"],
    _count: {
      id: true,
    },
    where: {
      featured: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 5,
  });
}

async function getRecentActivity() {
  return await prisma.destination.findMany({
    take: 10,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      country: true,
      updatedAt: true,
      featured: true,
    },
  });
}
