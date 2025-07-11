import { NextApiRequest, NextApiResponse } from "next";
import { ERASMUS_DESTINATIONS } from "../../../src/data/destinations";

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
    // Find base destination data
    const baseDestination = ERASMUS_DESTINATIONS.find((dest) => dest.id === id);

    if (!baseDestination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    // TODO: Fetch user-generated content related to this destination
    // This would include stories, accommodation tips, course matches, etc.
    // For now, we'll add empty arrays that can be populated later

    const enrichedDestination = {
      ...baseDestination,
      userStories: [],
      userAccommodationTips: [],
      userCourseMatches: [],
      userReviews: [],
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
