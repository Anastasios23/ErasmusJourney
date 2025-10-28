import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Accommodation Comparison API
 *
 * GET /api/accommodations/compare
 *
 * Compare multiple accommodations side-by-side
 *
 * Query params:
 * - ids: string - Comma-separated accommodation IDs (e.g., "id1,id2,id3")
 *
 * Returns detailed comparison including:
 * - Pricing breakdown
 * - Amenities comparison
 * - Ratings comparison
 * - Location details
 * - Cost-benefit analysis
 */

interface AccommodationComparison {
  id: string;
  name: string;
  type: string;
  city: string;
  country: string;
  neighborhood: string | null;

  // Pricing (all in cents)
  pricing: {
    monthlyRent: number;
    deposit: number | null;
    utilities: number | null;
    totalMonthly: number;
    totalUpfront: number; // Deposit + first month
    yearlyTotal: number;
  };

  // Amenities
  amenities: {
    available: string[];
    missing: string[]; // Compared to other listings
    uniqueFeatures: string[];
  };

  // Ratings
  ratings: {
    overall: number | null;
    location: number | null;
    cleanliness: number | null;
    valueForMoney: number | null;
    average: number | null;
  };

  // Location
  location: {
    neighborhood: string | null;
    address: string | null;
    proximityScore: number; // 1-10 based on location rating
  };

  // Student feedback
  feedback: {
    studentName: string | null;
    studentUniversity: string | null;
    stayDuration: string | null;
    description: string | null;
    wouldRecommend: boolean;
  };

  // Cost analysis
  costAnalysis: {
    affordabilityScore: number; // 1-10 (10 = most affordable)
    valueScore: number; // 1-10 (10 = best value for money)
    budgetCategory: string; // "Budget", "Mid-range", "Premium"
  };

  // Highlights
  pros: string[];
  cons: string[];
}

interface ComparisonResponse {
  accommodations: AccommodationComparison[];
  summary: {
    cheapest: { id: string; name: string; price: number };
    mostExpensive: { id: string; name: string; price: number };
    highestRated: { id: string; name: string; rating: number };
    bestValue: { id: string; name: string; score: number };
  };
  recommendations: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { ids } = req.query;

    if (!ids || typeof ids !== "string") {
      return res
        .status(400)
        .json({ error: "Accommodation IDs are required (comma-separated)" });
    }

    const accommodationIds = ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (accommodationIds.length < 2) {
      return res
        .status(400)
        .json({ error: "At least 2 accommodations required for comparison" });
    }

    if (accommodationIds.length > 4) {
      return res
        .status(400)
        .json({ error: "Maximum 4 accommodations can be compared at once" });
    }

    // Fetch all accommodations
    const accommodations = await prisma.accommodation_views.findMany({
      where: {
        id: {
          in: accommodationIds,
        },
        status: "APPROVED",
        isPublic: true,
      },
    });

    if (accommodations.length === 0) {
      return res.status(404).json({ error: "No accommodations found" });
    }

    // Helper functions
    const convertToCents = (price: number | null): number => {
      if (price === null) return 0;
      return price > 1000 ? price : Math.round(price * 100);
    };

    // Extract all unique amenities across all accommodations
    const allAmenitiesSet = new Set<string>();
    accommodations.forEach((acc) => {
      const amenitiesStr = acc.amenities || acc.description || "";
      const lowerStr = amenitiesStr.toLowerCase();

      const amenityMap = {
        wifi: ["wifi", "wi-fi", "internet"],
        parking: ["parking", "garage"],
        kitchen: ["kitchen", "kitchenette"],
        laundry: ["laundry", "washing machine"],
        furnished: ["furnished", "furniture"],
        aircon: ["air conditioning", "a/c", "ac"],
        heating: ["heating", "heater"],
        elevator: ["elevator", "lift"],
        balcony: ["balcony", "terrace"],
        gym: ["gym", "fitness"],
        pool: ["pool", "swimming"],
        security: ["security", "secure"],
        pets: ["pets", "pet-friendly"],
        bike: ["bike", "bicycle"],
      };

      Object.entries(amenityMap).forEach(([amenity, keywords]) => {
        if (keywords.some((kw) => lowerStr.includes(kw))) {
          allAmenitiesSet.add(amenity);
        }
      });
    });

    const allAmenities = Array.from(allAmenitiesSet);

    // Build comparison data
    const comparisons: AccommodationComparison[] = accommodations.map((acc) => {
      const rentCents = convertToCents(acc.pricePerMonth);
      const depositCents = acc.deposit ? convertToCents(acc.deposit) : null;
      const utilitiesCents = acc.utilities
        ? convertToCents(acc.utilities)
        : null;

      const totalMonthly = rentCents + (utilitiesCents || 0);
      const totalUpfront = rentCents + (depositCents || 0);
      const yearlyTotal = totalMonthly * 12;

      // Extract this accommodation's amenities
      const amenitiesStr = acc.amenities || acc.description || "";
      const lowerStr = amenitiesStr.toLowerCase();

      const availableAmenities: string[] = [];
      const amenityMap = {
        wifi: ["wifi", "wi-fi", "internet"],
        parking: ["parking", "garage"],
        kitchen: ["kitchen", "kitchenette"],
        laundry: ["laundry", "washing machine"],
        furnished: ["furnished", "furniture"],
        aircon: ["air conditioning", "a/c", "ac"],
        heating: ["heating", "heater"],
        elevator: ["elevator", "lift"],
        balcony: ["balcony", "terrace"],
        gym: ["gym", "fitness"],
        pool: ["pool", "swimming"],
        security: ["security", "secure"],
        pets: ["pets", "pet-friendly"],
        bike: ["bike", "bicycle"],
      };

      Object.entries(amenityMap).forEach(([amenity, keywords]) => {
        if (keywords.some((kw) => lowerStr.includes(kw))) {
          availableAmenities.push(amenity);
        }
      });

      // Find missing amenities (compared to all others)
      const missingAmenities = allAmenities.filter(
        (a) => !availableAmenities.includes(a),
      );

      // Find unique features (not present in any other)
      const uniqueFeatures = availableAmenities.filter((amenity) => {
        const othersHaveIt = accommodations.some((other) => {
          if (other.id === acc.id) return false;
          const otherStr = (
            other.amenities ||
            other.description ||
            ""
          ).toLowerCase();
          const keywords = amenityMap[amenity as keyof typeof amenityMap] || [];
          return keywords.some((kw) => otherStr.includes(kw));
        });
        return !othersHaveIt;
      });

      // Calculate ratings
      const ratingValues = [
        acc.overallRating,
        acc.locationRating,
        acc.cleanlinessRating,
        acc.valueForMoneyRating,
      ].filter((r): r is number => r !== null);

      const averageRating =
        ratingValues.length > 0
          ? Math.round(
              (ratingValues.reduce((sum, r) => sum + r, 0) /
                ratingValues.length) *
                10,
            ) / 10
          : null;

      // Calculate proximity score (1-10) based on location rating
      const proximityScore = acc.locationRating
        ? Math.round(acc.locationRating * 2)
        : 5;

      // Determine if student would recommend
      const wouldRecommend = !!(
        acc.overallRating &&
        acc.overallRating >= 4.0 &&
        acc.valueForMoneyRating &&
        acc.valueForMoneyRating >= 3.5
      );

      // Calculate affordability score (inverse of price, 1-10)
      const maxPossibleRent = 150000; // €1,500/month max
      const affordabilityScore = Math.round(
        (1 - rentCents / maxPossibleRent) * 10,
      );

      // Calculate value score (combination of price and quality)
      const valueScore =
        averageRating && rentCents > 0
          ? Math.round(
              ((averageRating / 5) * 0.6 + (affordabilityScore / 10) * 0.4) *
                10,
            )
          : 5;

      // Determine budget category
      let budgetCategory = "Mid-range";
      if (rentCents < 50000) budgetCategory = "Budget";
      else if (rentCents > 80000) budgetCategory = "Premium";

      // Generate pros
      const pros: string[] = [];
      if (rentCents < 60000) pros.push("💰 Affordable pricing");
      if (availableAmenities.length >= 5) pros.push("✨ Well-equipped");
      if (acc.overallRating && acc.overallRating >= 4.5)
        pros.push("⭐ Excellent ratings");
      if (acc.locationRating && acc.locationRating >= 4.5)
        pros.push("📍 Great location");
      if (acc.cleanlinessRating && acc.cleanlinessRating >= 4.5)
        pros.push("🧹 Very clean");
      if (
        availableAmenities.includes("wifi") &&
        availableAmenities.includes("furnished")
      ) {
        pros.push("🏡 Move-in ready");
      }
      if (uniqueFeatures.length > 0) {
        pros.push(`🎯 Unique: ${uniqueFeatures.join(", ")}`);
      }

      // Generate cons
      const cons: string[] = [];
      if (rentCents > 80000) cons.push("💸 Above average price");
      if (missingAmenities.length >= 5)
        cons.push(`❌ Missing: ${missingAmenities.slice(0, 3).join(", ")}`);
      if (!availableAmenities.includes("wifi"))
        cons.push("📡 No WiFi mentioned");
      if (!availableAmenities.includes("furnished"))
        cons.push("🪑 Not furnished");
      if (acc.overallRating && acc.overallRating < 3.5)
        cons.push("⚠️ Below average ratings");
      if (!depositCents) cons.push("⚠️ No deposit information");

      return {
        id: acc.id,
        name: acc.name || "Unnamed Accommodation",
        type: acc.type || "Unknown",
        city: acc.city || "",
        country: acc.country || "",
        neighborhood: acc.neighborhood,

        pricing: {
          monthlyRent: rentCents,
          deposit: depositCents,
          utilities: utilitiesCents,
          totalMonthly,
          totalUpfront,
          yearlyTotal,
        },

        amenities: {
          available: availableAmenities,
          missing: missingAmenities,
          uniqueFeatures,
        },

        ratings: {
          overall: acc.overallRating,
          location: acc.locationRating,
          cleanliness: acc.cleanlinessRating,
          valueForMoney: acc.valueForMoneyRating,
          average: averageRating,
        },

        location: {
          neighborhood: acc.neighborhood,
          address: acc.address,
          proximityScore,
        },

        feedback: {
          studentName: acc.studentName,
          studentUniversity: acc.studentUniversity,
          stayDuration: acc.stayDuration,
          description: acc.description,
          wouldRecommend,
        },

        costAnalysis: {
          affordabilityScore,
          valueScore,
          budgetCategory,
        },

        pros,
        cons,
      };
    });

    // Generate summary
    const cheapest = comparisons.reduce((min, acc) =>
      acc.pricing.monthlyRent < min.pricing.monthlyRent ? acc : min,
    );

    const mostExpensive = comparisons.reduce((max, acc) =>
      acc.pricing.monthlyRent > max.pricing.monthlyRent ? acc : max,
    );

    const withRatings = comparisons.filter(
      (acc) => acc.ratings.average !== null,
    );
    const highestRated =
      withRatings.length > 0
        ? withRatings.reduce((max, acc) =>
            (acc.ratings.average || 0) > (max.ratings.average || 0) ? acc : max,
          )
        : comparisons[0];

    const bestValue = comparisons.reduce((max, acc) =>
      acc.costAnalysis.valueScore > max.costAnalysis.valueScore ? acc : max,
    );

    // Generate recommendations
    const recommendations: string[] = [];

    const priceDiff =
      mostExpensive.pricing.monthlyRent - cheapest.pricing.monthlyRent;
    if (priceDiff > 20000) {
      recommendations.push(
        `You could save €${Math.round(priceDiff / 100)}/month by choosing ${cheapest.name} over ${mostExpensive.name}.`,
      );
    }

    if (highestRated.ratings.average && highestRated.ratings.average >= 4.0) {
      recommendations.push(
        `${highestRated.name} has the highest student satisfaction rating at ${highestRated.ratings.average}/5.0.`,
      );
    }

    if (bestValue.costAnalysis.valueScore >= 7) {
      recommendations.push(
        `${bestValue.name} offers the best value for money with a score of ${bestValue.costAnalysis.valueScore}/10.`,
      );
    }

    // Add amenity recommendations
    const accWithMostAmenities = comparisons.reduce((max, acc) =>
      acc.amenities.available.length > max.amenities.available.length
        ? acc
        : max,
    );
    if (accWithMostAmenities.amenities.available.length >= 6) {
      recommendations.push(
        `${accWithMostAmenities.name} has the most amenities (${accWithMostAmenities.amenities.available.length} features).`,
      );
    }

    const response: ComparisonResponse = {
      accommodations: comparisons,
      summary: {
        cheapest: {
          id: cheapest.id,
          name: cheapest.name,
          price: cheapest.pricing.monthlyRent,
        },
        mostExpensive: {
          id: mostExpensive.id,
          name: mostExpensive.name,
          price: mostExpensive.pricing.monthlyRent,
        },
        highestRated: {
          id: highestRated.id,
          name: highestRated.name,
          rating: highestRated.ratings.average || 0,
        },
        bestValue: {
          id: bestValue.id,
          name: bestValue.name,
          score: bestValue.costAnalysis.valueScore,
        },
      },
      recommendations,
    };

    // Cache for 30 minutes
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=3600",
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error comparing accommodations:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
