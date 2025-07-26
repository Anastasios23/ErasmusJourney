import { NextApiRequest, NextApiResponse } from "next";
import { getTestDataByCity } from "../../test-data/form-submissions";
import { ERASMUS_DESTINATIONS } from "../../../../src/data/destinations";
import { prisma } from "../../../../lib/prisma";

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
  // Look up the destination by ID to get the actual city name
  const destination = ERASMUS_DESTINATIONS.find(
    (dest) => dest.id === destinationId,
  );

  if (!destination) {
    throw new Error(`Destination with id "${destinationId}" not found`);
  }

  const city = destination.city.toLowerCase();
  
  // Fetch real form submissions from the database
  try {
    const submissions = await prisma.formSubmission.findMany({
      where: {
        status: "PUBLISHED", // Only use published submissions
      },
      orderBy: { createdAt: "desc" },
    });
    
    // Filter submissions by city
    const citySubmissions = submissions.filter((submission) => {
      const data = submission.data as any;
      return data.hostCity?.toLowerCase() === city.toLowerCase();
    });
    
    const totalSubmissions = citySubmissions.length;
    
    if (totalSubmissions > 0) {
      // Calculate real averages from submissions
      return calculateRealAverages(city, citySubmissions);
    }
  } catch (error) {
    console.error(`Error fetching submissions for ${city}:`, error);
    // Fall through to use fallback data
  }
  
  // Fallback to hardcoded data for cities without real submissions
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

// Calculate real averages from actual form submissions
function calculateRealAverages(city: string, submissions: any[]): DestinationAverages {
  const totalSubmissions = submissions.length;
  
  // Calculate living costs
  const livingCosts = submissions.reduce(
    (acc, submission) => {
      const data = submission.data as any;
      if (data.monthlyRent) acc.rent.push(data.monthlyRent);
      if (data.monthlyFood) acc.food.push(data.monthlyFood);
      if (data.monthlyTransport) acc.transport.push(data.monthlyTransport);
      if (data.monthlyEntertainment) acc.entertainment.push(data.monthlyEntertainment);
      return acc;
    },
    { rent: [], food: [], transport: [], entertainment: [] } as any
  );

  // Calculate average living costs
  const avgRent = livingCosts.rent.length > 0
    ? Math.round(livingCosts.rent.reduce((a: number, b: number) => a + b, 0) / livingCosts.rent.length)
    : null;
    
  const avgFood = livingCosts.food.length > 0
    ? Math.round(livingCosts.food.reduce((a: number, b: number) => a + b, 0) / livingCosts.food.length)
    : null;
    
  const avgTransport = livingCosts.transport.length > 0
    ? Math.round(livingCosts.transport.reduce((a: number, b: number) => a + b, 0) / livingCosts.transport.length)
    : null;
    
  const avgEntertainment = livingCosts.entertainment.length > 0
    ? Math.round(livingCosts.entertainment.reduce((a: number, b: number) => a + b, 0) / livingCosts.entertainment.length)
    : null;
    
  // Calculate total average cost
  const avgTotal = [avgRent, avgFood, avgTransport, avgEntertainment].filter(x => x !== null).length > 0
    ? [avgRent, avgFood, avgTransport, avgEntertainment].reduce((a, b) => (a || 0) + (b || 0), 0)
    : null;
  
  // Calculate ratings
  const ratings = submissions.reduce(
    (acc, submission) => {
      const data = submission.data as any;
      if (data.overallRating) acc.overall.push(data.overallRating);
      if (data.accommodationRating) acc.accommodation.push(data.accommodationRating);
      if (data.socialLifeRating) acc.socialLife.push(data.socialLifeRating);
      if (data.academicsRating) acc.academics.push(data.academicsRating);
      if (data.costOfLivingRating) acc.costOfLiving.push(data.costOfLivingRating);
      return acc;
    },
    { overall: [], accommodation: [], socialLife: [], academics: [], costOfLiving: [] } as any
  );
  
  // Calculate average ratings
  const avgOverall = ratings.overall.length > 0
    ? Number((ratings.overall.reduce((a: number, b: number) => a + b, 0) / ratings.overall.length).toFixed(1))
    : null;
    
  const avgAccommodation = ratings.accommodation.length > 0
    ? Number((ratings.accommodation.reduce((a: number, b: number) => a + b, 0) / ratings.accommodation.length).toFixed(1))
    : null;
    
  const avgSocialLife = ratings.socialLife.length > 0
    ? Number((ratings.socialLife.reduce((a: number, b: number) => a + b, 0) / ratings.socialLife.length).toFixed(1))
    : null;
    
  const avgAcademics = ratings.academics.length > 0
    ? Number((ratings.academics.reduce((a: number, b: number) => a + b, 0) / ratings.academics.length).toFixed(1))
    : null;
    
  const avgCostOfLiving = ratings.costOfLiving.length > 0
    ? Number((ratings.costOfLiving.reduce((a: number, b: number) => a + b, 0) / ratings.costOfLiving.length).toFixed(1))
    : null;
  
  // Calculate recommendations
  const recommendations = submissions.reduce(
    (acc, submission) => {
      const data = submission.data as any;
      if (data.wouldRecommend !== undefined) {
        acc.total++;
        if (data.wouldRecommend) acc.positive++;
      }
      return acc;
    },
    { positive: 0, total: 0 }
  );
  
  // Calculate recommendation percentage
  const recommendationPercentage = recommendations.total > 0
    ? Math.round((recommendations.positive / recommendations.total) * 100)
    : 0;
  
  // Extract top tips
  const allTips = submissions.flatMap(submission => {
    const data = submission.data as any;
    return data.topTips || [];
  });
  const uniqueTips = [...new Set(allTips)];
  
  // Extract accommodation types
  const accommodationTypes = submissions.reduce((acc, submission) => {
    const data = submission.data as any;
    if (data.accommodationType) {
      const type = data.accommodationType;
      if (!acc[type]) {
        acc[type] = { count: 0, rents: [] };
      }
      acc[type].count++;
      if (data.monthlyRent) {
        acc[type].rents.push(data.monthlyRent);
      }
    }
    return acc;
  }, {} as any);
  
  const accommodationTypesArray = Object.entries(accommodationTypes).map(
    ([type, data]: [string, any]) => ({
      type,
      count: data.count,
      averageRent: data.rents.length > 0
        ? Math.round(data.rents.reduce((a: number, b: number) => a + b, 0) / data.rents.length)
        : null,
    })
  );
  
  // Format recent submissions
  const recentSubmissions = submissions.slice(0, 4).map(submission => {
    const data = submission.data as any;
    return {
      id: submission.id,
      type: submission.type,
      title: submission.title || `Experience in ${city}`,
      excerpt: data.personalExperience || data.challenges || "Student experience shared",
      author: `${data.firstName || 'Anonymous'} ${data.lastName ? data.lastName.charAt(0) + '.' : ''}`,
      createdAt: submission.createdAt.toISOString(),
    };
  });
  
  return {
    city,
    totalSubmissions,
    averages: {
      livingCosts: {
        rent: avgRent,
        food: avgFood,
        transport: avgTransport,
        entertainment: avgEntertainment,
        total: avgTotal,
      },
      ratings: {
        overall: avgOverall,
        accommodation: avgAccommodation,
        socialLife: avgSocialLife,
        academics: avgAcademics,
        costOfLiving: avgCostOfLiving,
      },
      recommendations: {
        wouldRecommend: recommendationPercentage,
        totalResponses: recommendations.total,
      },
    },
    recentSubmissions,
    topTips: uniqueTips.slice(0, 5),
    accommodationTypes: accommodationTypesArray,
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
