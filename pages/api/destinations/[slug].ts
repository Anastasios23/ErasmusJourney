import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getEnhancedCityData } from "../../../src/services/cityAggregationService";

// Interface for destination with aggregated data (matching frontend expectations)
interface DestinationWithDetails {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  imageUrl?: string;
  climate?: string;
  highlights?: string[];
  featured: boolean;
  slug: string;

  // Student data
  totalSubmissions: number;
  averageRating?: number;
  avgCostPerMonth?: number;
  avgMonthlyRent?: number;

  // Related data
  accommodations: any[];
  courseExchanges: any[];
  universities: any[];

  // Living expenses breakdown
  livingExpenses?: {
    rent: number;
    groceries: number;
    transportation: number;
    eatingOut: number;
    bills: number;
    entertainment: number;
    other: number;
    total: number;
  };

  // Admin fields
  adminTitle?: string;
  adminDescription?: string;
  adminImageUrl?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Invalid slug parameter" });
  }

  try {
    // 1. Resolve City and Country from Slug
    let city = "";
    let country = "";
    let destination = await prisma.destinations.findUnique({
      where: { slug },
    });

    if (destination) {
      city = destination.city;
      country = destination.country;
    } else {
      // Try to parse slug "city-country"
      const parts = slug.split("-");
      if (parts.length >= 2) {
        country = parts.pop()!; // Last part is country
        city = parts.join(" "); // Rest is city
        // Capitalize for display
        city = city.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        country = country.charAt(0).toUpperCase() + country.slice(1);
      } else {
        // Fallback for hardcoded demos if not in DB
        if (slug === "berlin-germany") { city = "Berlin"; country = "Germany"; }
        else if (slug === "barcelona-spain") { city = "Barcelona"; country = "Spain"; }
        else {
           return res.status(404).json({ error: "Destination not found" });
        }
      }
    }

    // 2. Get Aggregated Data
    const cityData = await getEnhancedCityData(city, country);

    // 3. Map to Response Structure
    const accommodations = cityData.studentProfiles
      .filter(p => p.accommodationType !== "Unknown")
      .map((p, index) => ({
        id: `acc-${index}`,
        studentName: "Student", // Anonymized
        accommodationType: p.accommodationType,
        neighborhood: `${city} Area`, // Placeholder if not available
        monthlyRent: p.rawData.accommodation?.rent || 0,
        currency: "EUR",
        title: `${p.accommodationType} in ${city}`,
        description: p.rawData.accommodation?.review || `Accommodation experience in ${city}`,
        pros: [], // Extract if available
        cons: [],
        tips: [p.topTip].filter(Boolean),
        featured: index === 0,
        visible: true,
        rating: p.rawData.accommodation?.rating || 0
      }));

    const courseExchanges = cityData.studentProfiles
      .filter(p => p.university !== "Unknown")
      .map((p, index) => ({
        id: `course-${index}`,
        studentName: "Student",
        hostUniversity: p.university,
        fieldOfStudy: p.fieldOfStudy,
        studyLevel: "Bachelor", // Placeholder
        semester: p.studyPeriod,
        title: `${p.fieldOfStudy} at ${p.university}`,
        description: p.rawData.experience?.academicComment || `Academic experience at ${p.university}`,
        courseQuality: p.rawData.experience?.academicRating || 0,
        professorQuality: 0,
        facilityQuality: 0,
        coursesEnrolled: [],
        creditsEarned: 30,
        language: "English",
        featured: index === 0,
        visible: true
      }));

    const result: DestinationWithDetails = {
      id: destination?.id || slug,
      name: destination?.name || city,
      city: city,
      country: country,
      description: destination?.description || `Discover ${city}, ${country} through student experiences.`,
      imageUrl: destination?.imageUrl || `/images/destinations/${city.toLowerCase().replace(/ /g, '-')}.jpg`,
      climate: destination?.climate || "Temperate",
      highlights: [], // Populate if available
      featured: destination?.featured || false,
      slug: slug,

      totalSubmissions: cityData.totalSubmissions,
      averageRating: cityData.ratings.avgOverallRating,
      avgCostPerMonth: cityData.livingCosts.avgTotalMonthly,
      avgMonthlyRent: cityData.livingCosts.avgMonthlyRent,

      accommodations,
      courseExchanges,
      universities: cityData.universities,

      livingExpenses: {
        rent: cityData.livingCosts.avgMonthlyRent,
        groceries: cityData.livingCosts.avgMonthlyFood,
        transportation: cityData.livingCosts.avgMonthlyTransport,
        eatingOut: cityData.livingCosts.avgMonthlyEntertainment, // Mapping entertainment to eatingOut/social
        bills: cityData.livingCosts.avgMonthlyUtilities,
        entertainment: cityData.livingCosts.avgMonthlyEntertainment,
        other: cityData.livingCosts.avgMonthlyOther,
        total: cityData.livingCosts.avgTotalMonthly
      },

      adminTitle: destination?.name || city,
      adminDescription: destination?.description,
      adminImageUrl: destination?.imageUrl
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching destination details:", error);
    return res.status(500).json({
      error: "Failed to fetch destination details",
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
