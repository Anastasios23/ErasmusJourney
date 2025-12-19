import { prisma } from "../../lib/prisma";
import { CityAggregatedData } from "../types/cityData";

// Enhanced interface for detailed multi-student insights
export interface EnhancedCityAggregatedData extends CityAggregatedData {
  // Individual student insights (anonymized)
  studentProfiles: Array<{
    id: string;
    university: string;
    studyPeriod: string;
    fieldOfStudy: string;
    totalMonthlyCost: number;
    overallRating: number;
    accommodationType: string;
    topTip: string;
    rawData: any;
  }>;

  // Statistical insights for multiple students
  statisticalInsights: {
    costVariability: {
      minMonthlyCost: number;
      maxMonthlyCost: number;
      medianMonthlyCost: number;
      costRanges: Array<{
        range: string;
        percentage: number;
        count: number;
      }>;
    };

    consensusMetrics: {
      commonExperiences: Array<{
        experience: string;
        studentCount: number;
        percentage: number;
      }>;
      disagreementAreas: Array<{
        topic: string;
        variance: number;
        explanation: string;
      }>;
    };

    temporalInsights: {
      bestMonthsToArrive: Array<{
        month: string;
        studentCount: number;
        avgSatisfaction: number;
      }>;
      semesterBreakdown: {
        fall: number;
        spring: number;
        fullYear: number;
      };
    };
  };

  // Comparative insights
  studentComparisons: Array<{
    category: string;
    groups: Array<{
      label: string;
      studentCount: number;
      avgCost: number;
      avgRating: number;
      characteristics: string[];
    }>;
  }>;
}

// Helper function to calculate average of an array of numbers
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

export async function aggregateCityData(city: string, country: string): Promise<CityAggregatedData> {
  // Fetch all completed experiences for this city
  // Filter: Only show SUBMITTED or APPROVED, exclude DRAFT and REJECTED
  // Note: livingExpenses, accommodation, courses, experience are JSON fields, not relations
  const experiences = await prisma.erasmusExperience.findMany({
    where: {
      hostCity: { equals: city, mode: "insensitive" },
      hostCountry: { equals: country, mode: "insensitive" },
      isComplete: true,
      status: {
        notIn: ["DRAFT", "REJECTED"],
      },
    },
  });

  const totalSubmissions = experiences.length;

  if (totalSubmissions === 0) {
    return {
      city,
      country,
      totalSubmissions: 0,
      livingCosts: {
        avgMonthlyRent: 0,
        avgMonthlyFood: 0,
        avgMonthlyTransport: 0,
        avgMonthlyEntertainment: 0,
        avgMonthlyUtilities: 0,
        avgMonthlyOther: 0,
        avgTotalMonthly: 0,
        costSubmissions: 0,
      },
      ratings: {
        avgOverallRating: 0,
        avgAcademicRating: 0,
        avgSocialLifeRating: 0,
        avgCulturalImmersionRating: 0,
        avgCostOfLivingRating: 0,
        avgAccommodationRating: 0,
        ratingSubmissions: 0,
      },
      accommodation: {
        types: [],
        totalAccommodationSubmissions: 0,
      },
      courseMatching: {
        avgDifficulty: 0,
        difficultyBreakdown: {},
        avgCoursesMatched: 0,
        avgCreditsTransferred: 0,
        successRate: 0,
        recommendationRate: 0,
        totalCourseMatchingSubmissions: 0,
        commonChallenges: [],
        topAdvice: [],
        departmentInsights: [],
      },
      recommendations: {
        wouldRecommendCount: 0,
        totalRecommendationResponses: 0,
        recommendationPercentage: 0,
      },
      topTips: [],
      universities: [],
    };
  }

  // Calculate Living Costs Averages
  const livingCostsList = experiences.filter((e) => e.livingExpenses);
  const costSubmissions = livingCostsList.length;

  const livingCosts = {
    avgMonthlyRent: calculateAverage(livingCostsList.map((e) => {
      const data = e.livingExpenses as any;
      return parseFloat(data?.rent || "0");
    })),
    avgMonthlyFood: calculateAverage(livingCostsList.map((e) => {
      const data = e.livingExpenses as any;
      return parseFloat(data?.food || "0");
    })),
    avgMonthlyTransport: calculateAverage(livingCostsList.map((e) => {
      const data = e.livingExpenses as any;
      return parseFloat(data?.transport || "0");
    })),
    avgMonthlyEntertainment: calculateAverage(livingCostsList.map((e) => {
      const data = e.livingExpenses as any;
      return parseFloat(data?.social || data?.entertainment || "0");
    })),
    avgMonthlyUtilities: calculateAverage(livingCostsList.map((e) => {
      const data = e.livingExpenses as any;
      const accData = e.accommodation as any;
      return parseFloat(data?.utilities || accData?.utilities || "0");
    })),
    avgMonthlyOther: calculateAverage(livingCostsList.map((e) => {
      const data = e.livingExpenses as any;
      return parseFloat(data?.other || "0");
    })),
    avgTotalMonthly: calculateAverage(livingCostsList.map((e) => {
      const data = e.livingExpenses as any;
      return parseFloat(data?.total || data?.totalMonthlyBudget || "0");
    })),
    costSubmissions,
  };

  // Calculate Ratings Averages (from experience JSON field)
  const ratingsList = experiences.filter((e) => e.experience);
  const ratingSubmissions = ratingsList.length;

  const ratings = {
    avgOverallRating: calculateAverage(ratingsList.map((e) => {
      const data = e.experience as any;
      return parseInt(data?.overallRating || "0") || 0;
    })),
    avgAcademicRating: calculateAverage(ratingsList.map((e) => {
      const data = e.experience as any;
      return parseInt(data?.academicQuality || "0") || 0;
    })),
    avgSocialLifeRating: calculateAverage(ratingsList.map((e) => {
      const data = e.experience as any;
      return parseInt(data?.socialLife || "0") || 0;
    })),
    avgCulturalImmersionRating: calculateAverage(ratingsList.map((e) => {
      const data = e.experience as any;
      return parseInt(data?.culturalImmersion || "0") || 0;
    })),
    avgCostOfLivingRating: calculateAverage(ratingsList.map((e) => {
      const data = e.experience as any;
      return parseInt(data?.costOfLiving || "0") || 0;
    })),
    avgAccommodationRating: calculateAverage(ratingsList.map((e) => {
      const data = e.accommodation as any;
      return parseInt(data?.rating || "0") || 0;
    })),
    ratingSubmissions,
  };

  // Accommodation Analysis
  const accommodationList = experiences.filter((e) => e.accommodation);
  const totalAccommodationSubmissions = accommodationList.length;
  const accommodationTypesMap = new Map<string, { count: number; totalRent: number }>();

  accommodationList.forEach((exp) => {
    const acc = exp.accommodation as any;
    if (acc?.type) {
      const type = acc.type;
      const rent = parseFloat(acc.rent || "0");
      const current = accommodationTypesMap.get(type) || { count: 0, totalRent: 0 };
      accommodationTypesMap.set(type, {
        count: current.count + 1,
        totalRent: current.totalRent + rent,
      });
    }
  });

  const accommodationTypes = Array.from(accommodationTypesMap.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    avgRent: data.count > 0 ? data.totalRent / data.count : 0,
    percentage: totalAccommodationSubmissions > 0 ? (data.count / totalAccommodationSubmissions) * 100 : 0,
  }));

  // Course Matching Analysis (from courses JSON field)
  const courseMatchingList = experiences.filter((e) => e.courses);
  const totalCourseMatchingSubmissions = courseMatchingList.length;
  
  // Calculate difficulty breakdown
  const difficultyBreakdown: Record<string, number> = {};
  courseMatchingList.forEach(exp => {
    const coursesData = exp.courses as any;
    if (coursesData?.difficulty) {
      const diff = coursesData.difficulty.toString();
      difficultyBreakdown[diff] = (difficultyBreakdown[diff] || 0) + 1;
    }
  });

  const courseMatching = {
    avgDifficulty: calculateAverage(courseMatchingList.map((e) => {
      const data = e.courses as any;
      return parseInt(data?.difficulty || "0") || 0;
    })),
    difficultyBreakdown,
    avgCoursesMatched: calculateAverage(courseMatchingList.map((e) => {
      const data = e.courses as any;
      const mappings = data?.mappings || [];
      return Array.isArray(mappings) ? mappings.length : 0;
    })),
    avgCreditsTransferred: calculateAverage(courseMatchingList.map((e) => {
      const data = e.courses as any;
      const mappings = data?.mappings || [];
      if (!Array.isArray(mappings)) return 0;
      return mappings.reduce((sum: number, m: any) => sum + (parseFloat(m.hostEcts) || 0), 0);
    })),
    successRate: totalCourseMatchingSubmissions > 0 
      ? (courseMatchingList.filter(e => {
          const data = e.courses as any;
          const mappings = data?.mappings || [];
          return Array.isArray(mappings) && mappings.length > 0;
        }).length / totalCourseMatchingSubmissions) * 100 
      : 0,
    recommendationRate: 0, // Placeholder
    totalCourseMatchingSubmissions,
    commonChallenges: [], // Placeholder for text analysis
    topAdvice: [], // Placeholder for text analysis
    departmentInsights: [], // Placeholder
  };

  // Recommendations (based on overall rating from experience JSON)
  const wouldRecommendCount = experiences.filter((e) => {
    const data = e.experience as any;
    const rating = parseInt(data?.overallRating || "0") || 0;
    return rating >= 4;
  }).length;
  const recommendations = {
    wouldRecommendCount,
    totalRecommendationResponses: totalSubmissions,
    recommendationPercentage: totalSubmissions > 0 ? (wouldRecommendCount / totalSubmissions) * 100 : 0,
  };

  // Top Tips (Simple aggregation for now)
  const topTips = experiences
    .filter(e => e.experience?.tips)
    .map(e => ({
      category: "General",
      tip: e.experience?.tips || "",
      frequency: 1
    }))
    .slice(0, 5);

  return {
    city,
    country,
    totalSubmissions,
    livingCosts,
    ratings,
    accommodation: {
      types: accommodationTypes,
      totalAccommodationSubmissions,
    },
    courseMatching,
    recommendations,
    topTips,
    universities: [], // Placeholder
  };
}

/**
 * Get aggregated data for all cities that have at least one completed experience
 */
export async function getAllCitiesAggregatedData(): Promise<CityAggregatedData[]> {
  // Get all unique city/country combinations from completed experiences
  // Filter: Only show SUBMITTED or APPROVED, exclude DRAFT and REJECTED
  const locations = await prisma.erasmusExperience.findMany({
    where: {
      isComplete: true,
      status: {
        notIn: ["DRAFT", "REJECTED"],
      },
    },
    select: {
      hostCity: true,
      hostCountry: true,
    },
    distinct: ["hostCity", "hostCountry"],
  });

  // Aggregate data for each location
  const aggregatedDataPromises = locations.map((loc) =>
    aggregateCityData(loc.hostCity, loc.hostCountry)
  );

  return Promise.all(aggregatedDataPromises);
}

/**
 * Gets enhanced aggregated data with detailed multi-student insights
 */
export async function getEnhancedCityData(
  city: string,
  country: string,
): Promise<EnhancedCityAggregatedData> {
  try {
    // Get basic aggregated data
    const basicData = await aggregateCityData(city, country);

    // Get detailed individual student data
    const studentProfiles = await generateStudentProfiles(city, country);

    // Calculate statistical insights
    const statisticalInsights = calculateStatisticalInsights(studentProfiles);

    // Generate comparative analysis
    const studentComparisons = generateStudentComparisons(studentProfiles);

    return {
      ...basicData,
      studentProfiles,
      statisticalInsights,
      studentComparisons,
    };
  } catch (error) {
    console.error(
      `Error getting enhanced city data for ${city}, ${country}:`,
      error,
    );
    throw error;
  }
}

/**
 * Generate individual student profiles (anonymized)
 */
async function generateStudentProfiles(city: string, country: string) {
  const profiles = await prisma.erasmusExperience.findMany({
    where: {
      hostCity: { equals: city, mode: "insensitive" },
      hostCountry: { equals: country, mode: "insensitive" },
      isComplete: true,
      status: {
        notIn: ["DRAFT", "REJECTED"],
      },
    },
    include: {
      hostUniversity: true,
    },
  });

  return profiles
    .map((profile, index) => {
      const basicInfo = profile.basicInfo as any || {};
      const livingData = profile.livingExpenses as any || {};
      const accommodationData = profile.accommodation as any || {};
      const experienceData = profile.experience as any || {};

      return {
        id: `student_${index + 1}`, // Anonymous ID
        university:
          profile.hostUniversity?.name || basicInfo.hostUniversity || "Unknown",
        studyPeriod: profile.semester || basicInfo.exchangePeriod || "Unknown",
        fieldOfStudy: basicInfo.fieldOfStudy || "Unknown",
        totalMonthlyCost: parseFloat(livingData.total || livingData.totalMonthlyBudget || "0") || (
          (parseFloat(livingData.rent || accommodationData.rent || "0")) +
          (parseFloat(livingData.food || "0")) +
          (parseFloat(livingData.transport || "0")) +
          (parseFloat(livingData.social || "0")) +
          (parseFloat(livingData.travel || "0")) +
          (parseFloat(livingData.other || "0"))
        ),
        overallRating: parseInt(experienceData.overallRating || "0"),
        accommodationType:
          accommodationData.type ||
          "Unknown",
        topTip: extractBestTip(experienceData),
        rawData: {
          living: livingData,
          accommodation: accommodationData,
          experience: experienceData,
        },
      };
    })
    .filter(
      (profile) =>
        profile.university !== "Unknown" || profile.totalMonthlyCost > 0,
    );
}

/**
 * Extract the best tip from experience data
 */
function extractBestTip(experienceData: any): string {
  if (!experienceData) return "";

  const tipFields = [
    "budgetTips",
    "transportationTips",
    "socialLifeTips",
    "travelTips",
    "tips",
    "recommendations",
    "advice",
    "generalTips",
    "bestExperience"
  ];

  for (const field of tipFields) {
    if (experienceData[field] && typeof experienceData[field] === "string") {
      const tip = experienceData[field].trim();
      if (tip.length > 15) {
        // Return first sentence or up to 150 characters
        const firstSentence = tip.split(/[.!?]/)[0];
        return firstSentence.length > 10
          ? firstSentence + "."
          : tip.substring(0, 150) + "...";
      }
    }
  }

  return "";
}

/**
 * Calculate statistical insights from student profiles
 */
function calculateStatisticalInsights(studentProfiles: any[]) {
  const costs = studentProfiles
    .map((p) => p.totalMonthlyCost)
    .filter((cost) => cost > 0);

  const ratings = studentProfiles
    .map((p) => p.overallRating)
    .filter((rating) => rating > 0);

  return {
    costVariability: calculateCostVariability(costs),
    consensusMetrics: calculateConsensusMetrics(studentProfiles),
    temporalInsights: calculateTemporalInsights(studentProfiles),
  };
}

/**
 * Calculate cost variability metrics
 */
function calculateCostVariability(costs: number[]) {
  if (costs.length === 0) {
    return {
      minMonthlyCost: 0,
      maxMonthlyCost: 0,
      medianMonthlyCost: 0,
      costRanges: [],
    };
  }

  const sortedCosts = costs.sort((a, b) => a - b);
  const min = sortedCosts[0];
  const max = sortedCosts[sortedCosts.length - 1];
  const median = sortedCosts[Math.floor(sortedCosts.length / 2)];

  // Generate cost ranges
  const rangeSize = Math.ceil((max - min) / 4); // 4 ranges
  const ranges = [];

  for (let i = 0; i < 4; i++) {
    const rangeMin = min + i * rangeSize;
    const rangeMax = i === 3 ? max : min + (i + 1) * rangeSize;
    const count = costs.filter(
      (cost) => cost >= rangeMin && cost <= rangeMax,
    ).length;
    const percentage = Math.round((count / costs.length) * 100);

    if (count > 0) {
      ranges.push({
        range: `€${rangeMin}-${rangeMax}`,
        percentage,
        count,
      });
    }
  }

  return {
    minMonthlyCost: min,
    maxMonthlyCost: max,
    medianMonthlyCost: median,
    costRanges: ranges,
  };
}

/**
 * Calculate consensus metrics
 */
function calculateConsensusMetrics(studentProfiles: any[]) {
  // Analyze accommodation types
  const accommodationCounts = new Map<string, number>();
  studentProfiles.forEach((profile) => {
    const type = profile.accommodationType;
    if (type !== "Unknown") {
      accommodationCounts.set(type, (accommodationCounts.get(type) || 0) + 1);
    }
  });

  const totalStudents = studentProfiles.length;
  const commonExperiences = Array.from(accommodationCounts.entries())
    .map(([experience, count]) => ({
      experience: `Stayed in ${experience}`,
      studentCount: count,
      percentage: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  return {
    commonExperiences,
    disagreementAreas: [], // Placeholder
  };
}

/**
 * Calculate temporal insights
 */
function calculateTemporalInsights(studentProfiles: any[]) {
  // Placeholder implementation
  return {
    bestMonthsToArrive: [],
    semesterBreakdown: {
      fall: 0,
      spring: 0,
      fullYear: 0,
    },
  };
}

/**
 * Generate comparative analysis
 */
function generateStudentComparisons(studentProfiles: any[]) {
  // Placeholder implementation
  return [];
}
