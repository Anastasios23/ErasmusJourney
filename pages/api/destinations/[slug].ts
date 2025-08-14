import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Destination slug is required" });
    }

    // Get the destination with aggregated data
    const destination = await prisma.generatedDestination.findUnique({
      where: { slug },
      include: {
        accommodations: {
          where: { visible: true },
          orderBy: { createdAt: "desc" },
        },
        courseExchanges: {
          where: { visible: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    if (destination.status !== "PUBLISHED") {
      return res.status(404).json({ error: "Destination not available" });
    }

    // Transform data for the destination page (aggregated view)
    const destinationPageData = {
      id: destination.id,
      slug: destination.slug,
      city: destination.city,
      country: destination.country,
      title:
        destination.adminTitle || `${destination.city}, ${destination.country}`,
      description:
        destination.adminDescription ||
        `Study abroad in ${destination.city}, ${destination.country}`,
      imageUrl: destination.adminImageUrl,

      // Aggregated statistics
      stats: {
        totalSubmissions: destination.totalSubmissions,
        averageRating: destination.averageRating,
        averageMonthlyCost: destination.averageMonthlyCost,
        averageAccommodationCost: destination.averageAccommodationCost,
      },

      // Calculated insights
      insights: {
        topNeighborhoods: destination.topNeighborhoods,
        commonPros: destination.commonPros,
        commonCons: destination.commonCons,
        budgetBreakdown: destination.budgetBreakdown,
      },

      // Admin content
      highlights: destination.adminHighlights,
      generalInfo: destination.adminGeneralInfo,

      // Summary data from experiences
      accommodationSummary: {
        total: destination.accommodations.length,
        types: getAccommodationTypes(destination.accommodations),
        averageRent: destination.averageAccommodationCost,
      },

      academicSummary: {
        total: destination.courseExchanges.length,
        universities: getUniqueUniversities(destination.courseExchanges),
        averageRating: destination.averageRating,
      },

      featured: destination.featured,
      lastUpdated: destination.lastCalculated,
    };

    return res.status(200).json(destinationPageData);
  } catch (error) {
    console.error("Error fetching destination:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function getAccommodationTypes(accommodations: any[]) {
  const types = accommodations.reduce(
    (acc, accommodation) => {
      const type = accommodation.accommodationType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(types).map(([type, count]) => ({ type, count }));
}

function getUniqueUniversities(courseExchanges: any[]) {
  const universities = new Set(
    courseExchanges.map((course) => course.hostUniversity),
  );
  return Array.from(universities);
}
