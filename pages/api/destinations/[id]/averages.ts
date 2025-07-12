import { NextApiRequest, NextApiResponse } from "next";
import { getTestDataByCity } from "../../test-data/form-submissions";

interface SubmissionData {
  id: string;
  userId: string;
  type: string;
  title: string;
  data: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DestinationAverages {
  city: string;
  totalSubmissions: number;
  averages: {
    livingCosts: {
      rent: number | null;
      food: number | null;
      transport: number | null;
      entertainment: number | null;
      total: number | null;
    };
    ratings: {
      overall: number | null;
      accommodation: number | null;
      socialLife: number | null;
      academics: number | null;
      costOfLiving: number | null;
    };
    recommendations: {
      wouldRecommend: number; // percentage
      totalResponses: number;
    };
  };
  recentSubmissions: Array<{
    id: string;
    type: string;
    title: string;
    excerpt: string;
    author: string;
    createdAt: string;
  }>;
  topTips: string[];
  accommodationTypes: Array<{
    type: string;
    count: number;
    averageRent: number | null;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid id parameter" });
  }

  try {
    // In a real application, you would fetch this from your database
    // For now, we'll simulate data based on the city
    const cityData = await getDestinationAverages(id);

    res.status(200).json(cityData);
  } catch (error) {
    console.error("Error fetching destination averages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getDestinationAverages(
  destinationId: string,
): Promise<DestinationAverages> {
  // Extract city name from destination ID (e.g., "berlin_germany" -> "berlin")
  const city = destinationId.split("_")[0];

  // Get test data based on actual form submissions
  const testData = getTestDataByCity(city);

  if (testData) {
    return {
      city,
      ...testData,
    };
  }

  // Fallback to hardcoded data for cities without test submissions
  const cityAveragesMap: Record<string, Partial<DestinationAverages>> = {
    berlin: {
      totalSubmissions: 47,
      averages: {
        livingCosts: {
          rent: 450,
          food: 280,
          transport: 85,
          entertainment: 150,
          total: 965,
        },
        ratings: {
          overall: 4.3,
          accommodation: 4.1,
          socialLife: 4.6,
          academics: 4.4,
          costOfLiving: 3.8,
        },
        recommendations: {
          wouldRecommend: 92,
          totalResponses: 47,
        },
      },
      topTips: [
        "Get a student travel card for public transport discounts",
        "Check out university dormitories for affordable housing",
        "Join student groups early to make friends quickly",
        "Learn basic German phrases - locals appreciate the effort",
        "Visit free museums on Sundays",
      ],
      accommodationTypes: [
        { type: "Student Dormitory", count: 18, averageRent: 320 },
        { type: "Shared Apartment", count: 22, averageRent: 480 },
        { type: "Private Studio", count: 7, averageRent: 650 },
      ],
    },
    barcelona: {
      totalSubmissions: 38,
      averages: {
        livingCosts: {
          rent: 520,
          food: 320,
          transport: 55,
          entertainment: 180,
          total: 1075,
        },
        ratings: {
          overall: 4.7,
          accommodation: 4.2,
          socialLife: 4.8,
          academics: 4.3,
          costOfLiving: 3.6,
        },
        recommendations: {
          wouldRecommend: 97,
          totalResponses: 38,
        },
      },
      topTips: [
        "Live near metro stations for easy university access",
        "Try local markets for fresh, affordable food",
        "Take advantage of the beach and free outdoor activities",
        "Learn Spanish basics - Catalan is appreciated but not required",
        "Join the Erasmus Student Network (ESN) for events",
      ],
      accommodationTypes: [
        { type: "Shared Apartment", count: 25, averageRent: 480 },
        { type: "Student Residence", count: 10, averageRent: 580 },
        { type: "Homestay", count: 3, averageRent: 420 },
      ],
    },
    prague: {
      totalSubmissions: 29,
      averages: {
        livingCosts: {
          rent: 380,
          food: 220,
          transport: 35,
          entertainment: 120,
          total: 755,
        },
        ratings: {
          overall: 4.5,
          accommodation: 4.0,
          socialLife: 4.4,
          academics: 4.2,
          costOfLiving: 4.3,
        },
        recommendations: {
          wouldRecommend: 89,
          totalResponses: 29,
        },
      },
      topTips: [
        "Prague is very affordable - great value for money",
        "Public transport is excellent and cheap",
        "Try traditional Czech cuisine and local beer",
        "Explore the beautiful historic city center",
        "Learn a few Czech phrases to connect with locals",
      ],
      accommodationTypes: [
        { type: "Student Dormitory", count: 15, averageRent: 280 },
        { type: "Shared Apartment", count: 12, averageRent: 420 },
        { type: "Private Room", count: 2, averageRent: 550 },
      ],
    },
  };

  const normalizedCity = city.toLowerCase().replace(/[^a-z]/g, "");
  const baseData = cityAveragesMap[normalizedCity] || {
    totalSubmissions: 0,
    averages: {
      livingCosts: {
        rent: null,
        food: null,
        transport: null,
        entertainment: null,
        total: null,
      },
      ratings: {
        overall: null,
        accommodation: null,
        socialLife: null,
        academics: null,
        costOfLiving: null,
      },
      recommendations: {
        wouldRecommend: 0,
        totalResponses: 0,
      },
    },
    topTips: [],
    accommodationTypes: [],
  };

  // Generate some recent submissions
  const recentSubmissions = generateRecentSubmissions(
    city,
    baseData.totalSubmissions || 0,
  );

  return {
    city,
    totalSubmissions: baseData.totalSubmissions || 0,
    averages: baseData.averages!,
    recentSubmissions,
    topTips: baseData.topTips || [],
    accommodationTypes: baseData.accommodationTypes || [],
  };
}

function generateRecentSubmissions(city: string, totalCount: number) {
  if (totalCount === 0) return [];

  const sampleSubmissions = [
    {
      id: "1",
      type: "living-expenses",
      title: `My Living Costs in ${city}`,
      excerpt: "Detailed breakdown of monthly expenses during my exchange",
      author: "Maria S.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    },
    {
      id: "2",
      type: "accommodation",
      title: `Best Accommodation Areas in ${city}`,
      excerpt:
        "Guide to finding the perfect place to stay as an exchange student",
      author: "David L.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days ago
    },
    {
      id: "3",
      type: "story",
      title: `My Amazing Semester in ${city}`,
      excerpt:
        "Unforgettable experiences and lessons learned during my exchange",
      author: "Sophie K.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(), // 18 days ago
    },
    {
      id: "4",
      type: "course-matching",
      title: `Academic Experience at University in ${city}`,
      excerpt: "Course recommendations and academic tips for future students",
      author: "Alex M.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
    },
  ];

  return sampleSubmissions.slice(0, Math.min(4, Math.ceil(totalCount / 10)));
}
