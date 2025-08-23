import { NextApiRequest, NextApiResponse } from "next";

// Simple fallback destinations data to get the app working
const mockDestinations = [
  {
    id: "1",
    name: "Berlin, Germany",
    city: "Berlin",
    country: "Germany",
    description:
      "Vibrant cultural capital with excellent universities and student life",
    imageUrl:
      "https://images.unsplash.com/photo-1560930950-5cc20e80d392?w=400&h=250&fit=crop",
    featured: true,
    submissionCount: 45,
    averageRating: 4.5,
    averageCost: 850,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Barcelona, Spain",
    city: "Barcelona",
    country: "Spain",
    description:
      "Mediterranean paradise with world-class architecture and beaches",
    imageUrl:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=250&fit=crop",
    featured: true,
    submissionCount: 38,
    averageRating: 4.7,
    averageCost: 750,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Amsterdam, Netherlands",
    city: "Amsterdam",
    country: "Netherlands",
    description:
      "Historic canals, world-renowned universities, and vibrant student culture",
    imageUrl:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=250&fit=crop",
    featured: true,
    submissionCount: 32,
    averageRating: 4.4,
    averageCost: 950,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Prague, Czech Republic",
    city: "Prague",
    country: "Czech Republic",
    description: "Stunning medieval architecture and affordable student living",
    imageUrl:
      "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=250&fit=crop",
    featured: false,
    submissionCount: 28,
    averageRating: 4.3,
    averageCost: 600,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Vienna, Austria",
    city: "Vienna",
    country: "Austria",
    description:
      "Imperial grandeur meets modern student life in this cultural hub",
    imageUrl:
      "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=250&fit=crop",
    featured: false,
    submissionCount: 25,
    averageRating: 4.2,
    averageCost: 800,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Copenhagen, Denmark",
    city: "Copenhagen",
    country: "Denmark",
    description:
      "Scandinavian design, innovative education, and high quality of life",
    imageUrl:
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&h=250&fit=crop",
    featured: false,
    submissionCount: 22,
    averageRating: 4.6,
    averageCost: 1100,
    lastUpdated: new Date().toISOString(),
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      featured,
      country,
      orderBy = "students",
      order = "desc",
      limit = 100,
    } = req.query;

    console.log("Fetching destinations with options:", {
      featured,
      country,
      orderBy,
      order,
      limit,
    });

    let filteredDestinations = [...mockDestinations];

    // Apply filters
    if (featured === "true") {
      filteredDestinations = filteredDestinations.filter(
        (dest) => dest.featured,
      );
    }

    if (country && country !== "all") {
      filteredDestinations = filteredDestinations.filter(
        (dest) => dest.country === country,
      );
    }

    // Apply sorting
    filteredDestinations.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (orderBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "students":
          aValue = a.submissionCount;
          bValue = b.submissionCount;
          break;
        case "rating":
          aValue = a.averageRating;
          bValue = b.averageRating;
          break;
        case "updated":
          aValue = new Date(a.lastUpdated);
          bValue = new Date(b.lastUpdated);
          break;
        default:
          aValue = a.submissionCount;
          bValue = b.submissionCount;
      }

      if (order === "desc") {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply limit
    const limitNum = parseInt(limit as string) || 100;
    filteredDestinations = filteredDestinations.slice(0, limitNum);

    console.log(`Returning ${filteredDestinations.length} destinations`);
    res.status(200).json(filteredDestinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({
      message: "Failed to fetch destinations",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
