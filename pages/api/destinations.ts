import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get all published destinations from the Destination table
    const destinations = await prisma.destination.findMany({
      where: {
        featured: true, // Only show featured/published destinations
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform to match the expected format for the destinations page
    const transformedDestinations = destinations.map((dest) => {
      // Parse highlights if they exist
      const highlights = dest.highlights ? dest.highlights.split(", ") : [];

      // Parse cost of living data
      const costOfLiving = dest.costOfLiving as any;
      const averageTotal = costOfLiving?.averageTotal || 0;

      return {
        id: dest.id,
        city: dest.name.split(",")[0].trim(), // Extract city from "City, Country" format
        country: dest.country,
        image: dest.imageUrl || "/placeholder.svg",
        description: dest.description || "",
        costLevel: getCostLevel(averageTotal),
        rating: 4.5, // Default rating until we implement rating calculation
        studentCount: 0, // Will be calculated from form submissions later
        popularUniversities: [], // We can populate this later from form submissions
        highlights: highlights.slice(0, 3), // Take first 3 highlights
        avgCostPerMonth: averageTotal,
        region: getRegionFromCountry(dest.country),
        // Additional data for detailed view
        costOfLiving: costOfLiving,
        featured: dest.featured,
      };
    });

    res.status(200).json({ destinations: transformedDestinations });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
}

// Helper function to determine cost level based on total monthly cost
function getCostLevel(totalCost: number): string {
  if (totalCost < 800) return "low";
  if (totalCost < 1200) return "medium";
  return "high";
}

// Helper function to get region from country
function getRegionFromCountry(country: string): string {
  const europeanCountries = {
    Germany: "Central Europe",
    France: "Western Europe",
    Spain: "Southern Europe",
    Italy: "Southern Europe",
    Netherlands: "Western Europe",
    Belgium: "Western Europe",
    Austria: "Central Europe",
    Portugal: "Southern Europe",
    Greece: "Southern Europe",
    Poland: "Central Europe",
    "Czech Republic": "Central Europe",
    Hungary: "Central Europe",
    Sweden: "Northern Europe",
    Denmark: "Northern Europe",
    Finland: "Northern Europe",
    Norway: "Northern Europe",
    Ireland: "Western Europe",
    Switzerland: "Central Europe",
    Luxembourg: "Western Europe",
    Slovenia: "Central Europe",
    Slovakia: "Central Europe",
    Croatia: "Southern Europe",
    Romania: "Eastern Europe",
    Bulgaria: "Eastern Europe",
    Lithuania: "Northern Europe",
    Latvia: "Northern Europe",
    Estonia: "Northern Europe",
    Malta: "Southern Europe",
    Cyprus: "Southern Europe",
  };

  return europeanCountries[country] || "Europe";
}
