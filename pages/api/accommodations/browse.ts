import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Enhanced Accommodation Browsing API
 *
 * GET /api/accommodations/browse
 *
 * Advanced filtering and sorting for accommodation listings
 *
 * Query params:
 * - city: string - Filter by city
 * - country: string - Filter by country
 * - type: string - Accommodation type (apartment, residence, studio, etc.)
 * - minPrice: number - Minimum monthly rent (in EUR)
 * - maxPrice: number - Maximum monthly rent (in EUR)
 * - amenities: string - Comma-separated amenities (wifi, parking, kitchen, etc.)
 * - neighborhood: string - Filter by neighborhood
 * - minRating: number - Minimum overall rating (1-5)
 * - sortBy: string - Sort field (price, rating, date, popularity)
 * - order: string - Sort order (asc, desc)
 * - page: number - Page number (default: 1)
 * - limit: number - Results per page (default: 12, max: 50)
 */

interface AccommodationListing {
  id: string;
  name: string;
  type: string;
  city: string;
  country: string;
  neighborhood: string | null;
  address: string | null;

  // Pricing
  monthlyRent: number; // in cents
  deposit: number | null; // in cents
  utilities: number | null; // in cents
  totalMonthlyCost: number; // in cents

  // Details
  amenities: string[];
  description: string | null;
  imageUrl: string | null;

  // Ratings
  overallRating: number | null;
  locationRating: number | null;
  cleanlinessRating: number | null;
  valueForMoneyRating: number | null;

  // Meta
  studentName: string | null;
  studentUniversity: string | null;
  stayDuration: string | null;
  createdAt: string;

  // Highlights
  highlights: string[];
  isRecommended: boolean;
}

interface BrowseResponse {
  accommodations: AccommodationListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    cities: string[];
    types: string[];
    amenities: string[];
    priceRange: { min: number; max: number };
    ratingRange: { min: number; max: number };
  };
  summary: {
    averageRent: number;
    medianRent: number;
    mostPopularType: string;
    totalListings: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      city,
      country,
      type,
      minPrice,
      maxPrice,
      amenities,
      neighborhood,
      minRating,
      sortBy = "date",
      order = "desc",
      page = "1",
      limit = "12",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause: any = {
      status: "APPROVED",
      isPublic: true,
    };

    if (city) {
      whereClause.city = {
        equals: city as string,
        mode: "insensitive",
      };
    }

    if (country) {
      whereClause.country = {
        equals: country as string,
        mode: "insensitive",
      };
    }

    if (type) {
      whereClause.type = {
        equals: type as string,
        mode: "insensitive",
      };
    }

    if (neighborhood) {
      whereClause.neighborhood = {
        contains: neighborhood as string,
        mode: "insensitive",
      };
    }

    // Price filtering (convert EUR to cents)
    if (minPrice || maxPrice) {
      whereClause.pricePerMonth = {};
      if (minPrice) {
        const minCents = parseFloat(minPrice as string) * 100;
        whereClause.pricePerMonth.gte = minCents;
      }
      if (maxPrice) {
        const maxCents = parseFloat(maxPrice as string) * 100;
        whereClause.pricePerMonth.lte = maxCents;
      }
    }

    // Rating filtering
    if (minRating) {
      whereClause.overallRating = {
        gte: parseFloat(minRating as string),
      };
    }

    // Amenities filtering (check if amenities exist in description or specific fields)
    if (amenities) {
      const amenityList = (amenities as string)
        .split(",")
        .map((a) => a.trim().toLowerCase());

      // Build OR conditions for amenity matching
      const amenityConditions = amenityList.map((amenity) => ({
        OR: [
          {
            amenities: {
              contains: amenity,
              mode: "insensitive" as const,
            },
          },
          {
            description: {
              contains: amenity,
              mode: "insensitive" as const,
            },
          },
        ],
      }));

      if (amenityConditions.length > 0) {
        whereClause.AND = amenityConditions;
      }
    }

    // Build orderBy clause
    let orderByClause: any = {};
    switch (sortBy) {
      case "price":
        orderByClause = { pricePerMonth: order === "asc" ? "asc" : "desc" };
        break;
      case "rating":
        orderByClause = { overallRating: order === "asc" ? "asc" : "desc" };
        break;
      case "popularity":
        orderByClause = { views: order === "asc" ? "asc" : "desc" };
        break;
      case "date":
      default:
        orderByClause = { createdAt: order === "asc" ? "asc" : "desc" };
        break;
    }

    // Get total count
    const total = await prisma.accommodation_views.count({
      where: whereClause,
    });

    // Fetch accommodations with pagination
    const accommodations = await prisma.accommodation_views.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take: limitNum,
    });

    // Convert price to cents helper
    const convertToCents = (price: number | null): number => {
      if (price === null) return 0;
      return price > 1000 ? price : Math.round(price * 100);
    };

    // Transform to AccommodationListing format
    const listings: AccommodationListing[] = accommodations.map((acc) => {
      const rentCents = convertToCents(acc.pricePerMonth);
      const depositCents = acc.deposit ? convertToCents(acc.deposit) : null;
      const utilitiesCents = acc.utilities
        ? convertToCents(acc.utilities)
        : null;

      const totalCost = rentCents + (utilitiesCents || 0);

      // Parse amenities
      const amenitiesList: string[] = [];
      const amenitiesStr = acc.amenities || acc.description || "";

      // Common amenities to extract
      const amenityKeywords = {
        wifi: ["wifi", "wi-fi", "internet"],
        parking: ["parking", "garage"],
        kitchen: ["kitchen", "kitchenette"],
        laundry: ["laundry", "washing machine", "washer"],
        furnished: ["furnished", "furniture"],
        aircon: ["air conditioning", "a/c", "ac", "aircon"],
        heating: ["heating", "heater"],
        elevator: ["elevator", "lift"],
        balcony: ["balcony", "terrace"],
        gym: ["gym", "fitness"],
      };

      Object.entries(amenityKeywords).forEach(([amenity, keywords]) => {
        const lowerStr = amenitiesStr.toLowerCase();
        if (keywords.some((kw) => lowerStr.includes(kw))) {
          amenitiesList.push(amenity);
        }
      });

      // Generate highlights
      const highlights: string[] = [];
      if (acc.overallRating && acc.overallRating >= 4.5) {
        highlights.push("⭐ Highly Rated");
      }
      if (rentCents < 50000) {
        highlights.push("💰 Budget Friendly");
      }
      if (
        amenitiesList.includes("wifi") &&
        amenitiesList.includes("furnished")
      ) {
        highlights.push("🏡 Move-in Ready");
      }
      if (
        acc.neighborhood?.toLowerCase().includes("center") ||
        acc.neighborhood?.toLowerCase().includes("downtown")
      ) {
        highlights.push("📍 Central Location");
      }

      // Determine if recommended
      const isRecommended = !!(
        acc.overallRating &&
        acc.overallRating >= 4.0 &&
        rentCents < 70000 &&
        amenitiesList.length >= 3
      );

      return {
        id: acc.id,
        name: acc.name || "Unnamed Accommodation",
        type: acc.type || "Unknown",
        city: acc.city || "",
        country: acc.country || "",
        neighborhood: acc.neighborhood,
        address: acc.address,

        monthlyRent: rentCents,
        deposit: depositCents,
        utilities: utilitiesCents,
        totalMonthlyCost: totalCost,

        amenities: amenitiesList,
        description: acc.description,
        imageUrl: acc.imageUrl,

        overallRating: acc.overallRating,
        locationRating: acc.locationRating,
        cleanlinessRating: acc.cleanlinessRating,
        valueForMoneyRating: acc.valueForMoneyRating,

        studentName: acc.studentName,
        studentUniversity: acc.studentUniversity,
        stayDuration: acc.stayDuration,
        createdAt: acc.createdAt.toISOString(),

        highlights,
        isRecommended,
      };
    });

    // Fetch all accommodations for filter options (no pagination)
    const allAccommodations = await prisma.accommodation_views.findMany({
      where: {
        status: "APPROVED",
        isPublic: true,
      },
      select: {
        city: true,
        type: true,
        pricePerMonth: true,
        overallRating: true,
        amenities: true,
        description: true,
      },
    });

    // Calculate filter options
    const cities = [
      ...new Set(allAccommodations.map((a) => a.city).filter(Boolean)),
    ] as string[];
    const types = [
      ...new Set(allAccommodations.map((a) => a.type).filter(Boolean)),
    ] as string[];

    // Extract all amenities
    const allAmenities = new Set<string>();
    allAccommodations.forEach((acc) => {
      const amenitiesStr = acc.amenities || acc.description || "";
      const lowerStr = amenitiesStr.toLowerCase();

      if (lowerStr.includes("wifi") || lowerStr.includes("wi-fi"))
        allAmenities.add("wifi");
      if (lowerStr.includes("parking")) allAmenities.add("parking");
      if (lowerStr.includes("kitchen")) allAmenities.add("kitchen");
      if (lowerStr.includes("laundry") || lowerStr.includes("washing"))
        allAmenities.add("laundry");
      if (lowerStr.includes("furnished")) allAmenities.add("furnished");
      if (lowerStr.includes("air conditioning") || lowerStr.includes("a/c"))
        allAmenities.add("aircon");
      if (lowerStr.includes("heating")) allAmenities.add("heating");
      if (lowerStr.includes("elevator") || lowerStr.includes("lift"))
        allAmenities.add("elevator");
      if (lowerStr.includes("balcony")) allAmenities.add("balcony");
      if (lowerStr.includes("gym")) allAmenities.add("gym");
    });

    // Calculate price range
    const prices = allAccommodations
      .map((a) => convertToCents(a.pricePerMonth))
      .filter((p) => p > 0);
    const priceRange =
      prices.length > 0
        ? { min: Math.min(...prices), max: Math.max(...prices) }
        : { min: 0, max: 100000 };

    // Calculate rating range
    const ratings = allAccommodations
      .map((a) => a.overallRating)
      .filter((r): r is number => r !== null);
    const ratingRange =
      ratings.length > 0
        ? { min: Math.min(...ratings), max: Math.max(...ratings) }
        : { min: 1, max: 5 };

    // Calculate summary statistics
    const rentsList = listings.map((l) => l.monthlyRent).filter((r) => r > 0);
    const averageRent =
      rentsList.length > 0
        ? Math.round(
            rentsList.reduce((sum, r) => sum + r, 0) / rentsList.length,
          )
        : 0;

    const sortedRents = [...rentsList].sort((a, b) => a - b);
    const medianRent =
      sortedRents.length > 0
        ? sortedRents[Math.floor(sortedRents.length / 2)]
        : 0;

    // Most popular type
    const typeCounts: Record<string, number> = {};
    listings.forEach((l) => {
      typeCounts[l.type] = (typeCounts[l.type] || 0) + 1;
    });
    const mostPopularType =
      Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Apartment";

    const response: BrowseResponse = {
      accommodations: listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      filters: {
        cities,
        types,
        amenities: Array.from(allAmenities),
        priceRange,
        ratingRange,
      },
      summary: {
        averageRent,
        medianRent,
        mostPopularType,
        totalListings: total,
      },
    };

    // Cache for 15 minutes (accommodations change frequently)
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=900, stale-while-revalidate=1800",
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error browsing accommodations:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
