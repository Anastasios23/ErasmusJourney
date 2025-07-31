import { NextApiRequest, NextApiResponse } from "next";
import { ERASMUS_DESTINATIONS } from "../../../src/data/destinations";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid destination ID" });
  }

  try {
    // First check if this is a database destination
    let baseDestination = null;
    let isDbDestination = false;

    try {
      const dbDestination = await prisma.destination.findFirst({
        where: {
          OR: [{ id: id }, { name: { contains: id } }],
        },
      });

      if (dbDestination) {
        isDbDestination = true;
        // Parse highlights field which may contain enhanced data
        let parsedHighlights: any = {};
        try {
          if (dbDestination.highlights) {
            // Try to parse as JSON first (new format)
            try {
              parsedHighlights = JSON.parse(dbDestination.highlights);
            } catch {
              // Fallback to old string format
              parsedHighlights = { highlights: dbDestination.highlights };
            }
          }
        } catch (error) {
          console.error("Error parsing highlights:", error);
          parsedHighlights = { highlights: dbDestination.highlights || "" };
        }

        baseDestination = {
          id: dbDestination.id,
          city: dbDestination.name.split(",")[0].trim(),
          country: dbDestination.country,
          university: "Partner University", // Default, will be enriched from submissions
          universityShort: "PU",
          partnerUniversities: [],
          language: "English/Local",
          costOfLiving: "medium" as const,
          averageRent: (dbDestination.costOfLiving as any)?.averageRent || 500,
          popularWith: [],
          imageUrl: dbDestination.imageUrl || "/placeholder.svg",
          description: dbDestination.description || "",
          photos: parsedHighlights.photos || [],
          generalInfo: parsedHighlights.generalInfo || {},
          highlights: parsedHighlights.highlights || "",
        };
      }
    } catch (dbError) {
      console.error("Error checking database destinations:", dbError);
    }

    // Fall back to static data if no database destination found
    if (!baseDestination) {
      baseDestination = ERASMUS_DESTINATIONS.find((dest) => dest.id === id);
      if (!baseDestination) {
        return res.status(404).json({ message: "Destination not found" });
      }
    }

    // Fetch user-generated content related to this destination
    // This includes stories, accommodation tips, course matches, etc.
    let userStories = [];
    let userAccommodationTips = [];
    let userCourseMatches = [];
    let userReviews = [];

    try {
      // Fetch form submissions related to this destination
      const submissions = await prisma.formSubmission.findMany({
        where: {
          status: "PUBLISHED", // Only use published submissions
        },
        orderBy: { createdAt: "desc" },
      });

      // Filter submissions by city
      const citySubmissions = submissions.filter((submission) => {
        const data = submission.data as any;
        return (
          data.hostCity?.toLowerCase() === baseDestination.city.toLowerCase()
        );
      });

      // Process submissions by type
      userStories = citySubmissions
        .filter((sub) => sub.type === "STORY")
        .map((sub) => {
          const data = sub.data as any;
          return {
            id: sub.id,
            title: sub.title,
            excerpt:
              data.personalExperience?.substring(0, 150) + "..." ||
              "Student story",
            author: `${data.firstName || "Anonymous"} ${data.lastName ? data.lastName.charAt(0) + "." : ""}`,
            createdAt: sub.createdAt.toISOString(),
          };
        });

      userAccommodationTips = citySubmissions
        .filter((sub) => sub.type === "ACCOMMODATION")
        .map((sub) => {
          const data = sub.data as any;
          return {
            id: sub.id,
            title: sub.title || `Accommodation in ${baseDestination.city}`,
            type: data.accommodationType || "Unknown",
            monthlyRent: data.monthlyRent,
            rating: data.accommodationRating,
            tips: data.topTips || [],
            createdAt: sub.createdAt.toISOString(),
          };
        });

      userCourseMatches = citySubmissions
        .filter((sub) => sub.type === "COURSE_MATCHING")
        .map((sub) => {
          const data = sub.data as any;
          return {
            id: sub.id,
            title: sub.title || `Course Matching in ${baseDestination.city}`,
            hostUniversity: data.hostUniversity,
            courses: data.courses || [],
            createdAt: sub.createdAt.toISOString(),
          };
        });

      userReviews = citySubmissions
        .filter((sub) =>
          ["BASIC_INFO", "ACCOMMODATION", "COURSE_MATCHING", "STORY"].includes(
            sub.type,
          ),
        )
        .map((sub) => {
          const data = sub.data as any;
          return {
            id: sub.id,
            type: sub.type,
            rating: data.overallRating,
            review: data.personalExperience || data.challenges || "",
            createdAt: sub.createdAt.toISOString(),
          };
        });
    } catch (error) {
      console.error(
        `Error fetching user content for ${baseDestination.city}:`,
        error,
      );
      // Continue with empty arrays if there's an error
    }

    const enrichedDestination = {
      ...baseDestination,
      userStories,
      userAccommodationTips,
      userCourseMatches,
      userReviews,
      // Add detailed information that might come from forms
      detailedInfo: {
        population: getPopulationForCity(baseDestination.city),
        language: baseDestination.language,
        currency: getCurrencyForCountry(baseDestination.country),
        climate: getClimateInfo(baseDestination.city),
        timezone: getTimezoneInfo(baseDestination.city),
      },
      livingCosts: {
        accommodation: {
          min: Math.floor(baseDestination.averageRent * 0.7),
          max: Math.floor(baseDestination.averageRent * 1.3),
        },
        food: { min: 200, max: 400 },
        transport: 50,
        entertainment: { min: 100, max: 200 },
      },
      transportation: {
        publicTransport: "Excellent public transport system",
        bikeRentals: true,
        walkability: 8,
        nearestAirport: `${baseDestination.city} Airport`,
      },
      attractions: [],
      studentLife: {
        nightlife: 8,
        culture: 9,
        sports: 7,
        internationalCommunity: 9,
      },
      practicalInfo: {
        visa: "EU citizens do not need a visa",
        healthcare: "European Health Insurance Card accepted",
        bankingTips: "Major banks available, easy account opening for students",
        simCard: "Prepaid SIM cards available at airports and stores",
      },
      gallery: [baseDestination.imageUrl],
    };

    res.status(200).json(enrichedDestination);
  } catch (error) {
    console.error("Error fetching destination details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Helper functions to generate realistic data
function getPopulationForCity(city: string): number {
  const populations: Record<string, number> = {
    Berlin: 3700000,
    Barcelona: 1620000,
    Prague: 1300000,
    Vienna: 1900000,
    Amsterdam: 870000,
    Stockholm: 980000,
    Budapest: 1750000,
    Warsaw: 1790000,
    Copenhagen: 650000,
    Helsinki: 660000,
  };
  return populations[city] || 1000000;
}

function getCurrencyForCountry(country: string): string {
  const currencies: Record<string, string> = {
    Germany: "EUR",
    Spain: "EUR",
    "Czech Republic": "CZK",
    Austria: "EUR",
    Netherlands: "EUR",
    Sweden: "SEK",
    Hungary: "HUF",
    Poland: "PLN",
    Denmark: "DKK",
    Finland: "EUR",
  };
  return currencies[country] || "EUR";
}

function getClimateInfo(city: string): string {
  return "Temperate continental climate with warm summers and cold winters";
}

function getTimezoneInfo(city: string): string {
  return "Central European Time (CET)";
}
