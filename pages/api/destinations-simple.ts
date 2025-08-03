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
    console.log("Starting simple destinations API...");

    // Test basic database queries one by one
    console.log("1. Testing basic info submissions...");
    const basicInfoSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: "SUBMITTED",
        type: "BASIC_INFO",
      },
      take: 5, // Limit to 5 for testing
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
    console.log(`Found ${basicInfoSubmissions.length} basic info submissions`);

    console.log("2. Testing published destinations...");
    const publishedDestinations = await prisma.destination.findMany({
      where: {
        featured: true,
      },
      take: 5, // Limit to 5 for testing
    });
    console.log(`Found ${publishedDestinations.length} published destinations`);

    console.log("3. Testing custom destinations...");
    const customDestinations = await prisma.customDestination.findMany({
      take: 5, // Limit to 5 for testing
    });
    console.log(`Found ${customDestinations.length} custom destinations`);

    // Create a simple response
    const simpleDestinations = [
      {
        id: "prague-cz",
        city: "Prague",
        country: "Czech Republic",
        image: "/images/destinations/prague.svg",
        description: "Historic city with affordable living",
        costLevel: "low",
        rating: 4.2,
        studentCount: basicInfoSubmissions.length,
        popularUniversities: ["Charles University"],
        highlights: ["Affordable Living", "Beautiful Architecture"],
        avgCostPerMonth: 800,
        universities: ["Charles University"],
        experiences: [],
        accommodationCount: 0,
        avgRent: 400,
        avgLivingExpenses: 400,
        cityInfo: {
          population: "1.3 million",
          language: "Czech",
          currency: "CZK",
          climate: "Continental",
        },
      },
    ];

    console.log("4. Sending response...");
    res.status(200).json({
      destinations: simpleDestinations,
      meta: {
        basicInfoCount: basicInfoSubmissions.length,
        publishedCount: publishedDestinations.length,
        customCount: customDestinations.length,
      },
    });
  } catch (error) {
    console.error("Simple destinations API error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
