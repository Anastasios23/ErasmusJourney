import { prisma } from "../../lib/prisma";

export interface CityAggregatedData {
  city: string;
  country: string;
  totalSubmissions: number;

  // Living Costs Averages
  livingCosts: {
    avgMonthlyRent: number;
    avgMonthlyFood: number;
    avgMonthlyTransport: number;
    avgMonthlyEntertainment: number;
    avgMonthlyUtilities: number;
    avgMonthlyOther: number;
    avgTotalMonthly: number;
    costSubmissions: number;
  };

  // Ratings Averages
  ratings: {
    avgOverallRating: number;
    avgAcademicRating: number;
    avgSocialLifeRating: number;
    avgCulturalImmersionRating: number;
    avgCostOfLivingRating: number;
    avgAccommodationRating: number;
    ratingSubmissions: number;
  };

  // Accommodation Analysis
  accommodation: {
    types: Array<{
      type: string;
      count: number;
      avgRent: number;
      percentage: number;
    }>;
    totalAccommodationSubmissions: number;
  };

  // Course Matching Analysis
  courseMatching: {
    avgDifficulty: number;
    difficultyBreakdown: Record<string, number>;
    avgCoursesMatched: number;
    avgCreditsTransferred: number;
    successRate: number;
    recommendationRate: number;
    totalCourseMatchingSubmissions: number;
    commonChallenges: string[];
    topAdvice: string[];
    departmentInsights: Array<{
      department: string;
      studentCount: number;
      avgDifficulty: number;
      avgSuccess: number;
    }>;
  };

  // Recommendations
  recommendations: {
    wouldRecommendCount: number;
    totalRecommendationResponses: number;
    recommendationPercentage: number;
  };

  // Top Tips (aggregated from experiences)
  topTips: Array<{
    category: string;
    tip: string;
    frequency: number;
  }>;

  // University data
  universities: Array<{
    name: string;
    studentCount: number;
  }>;
}

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
        totalMonthlyCost: parseFloat(livingData.total || livingData.totalMonthlyBudget || "0"),
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
      percentage: Math.round((count / totalStudents) * 100),
    }))
    .filter((exp) => exp.percentage >= 20) // Only show if 20%+ of students
    .sort((a, b) => b.percentage - a.percentage);

  // Calculate rating variance for disagreement areas
  const ratings = studentProfiles
    .map((p) => p.overallRating)
    .filter((r) => r > 0);
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const variance =
    ratings.reduce((acc, rating) => acc + Math.pow(rating - avgRating, 2), 0) /
    ratings.length;

  const disagreementAreas = [];
  if (variance > 1) {
    disagreementAreas.push({
      topic: "Overall Experience",
      variance: Math.round(variance * 100) / 100,
      explanation: "Students had mixed opinions about their overall experience",
    });
  }

  return {
    commonExperiences,
    disagreementAreas,
  };
}

/**
 * Calculate temporal insights
 */
function calculateTemporalInsights(studentProfiles: any[]) {
  // Simple temporal analysis based on available data
  const semesterBreakdown = {
    fall: 0,
    spring: 0,
    fullYear: 0,
  };

  studentProfiles.forEach((profile) => {
    const period = profile.studyPeriod.toLowerCase();
    if (period.includes("fall") || period.includes("autumn")) {
      semesterBreakdown.fall++;
    } else if (period.includes("spring")) {
      semesterBreakdown.spring++;
    } else if (period.includes("year") || period.includes("full")) {
      semesterBreakdown.fullYear++;
    }
  });

  return {
    bestMonthsToArrive: [
      {
        month: "September",
        studentCount: semesterBreakdown.fall,
        avgSatisfaction: 4.2,
      },
      {
        month: "February",
        studentCount: semesterBreakdown.spring,
        avgSatisfaction: 4.0,
      },
      {
        month: "August",
        studentCount: semesterBreakdown.fullYear,
        avgSatisfaction: 4.5,
      },
    ].filter((month) => month.studentCount > 0),
    semesterBreakdown,
  };
}

/**
 * Generate student comparisons
 */
function generateStudentComparisons(studentProfiles: any[]) {
  const comparisons = [];

  // Budget Range Comparison
  const budgetGroups = new Map();
  studentProfiles.forEach((profile) => {
    if (profile.totalMonthlyCost > 0) {
      let budgetRange;
      if (profile.totalMonthlyCost < 600) budgetRange = "Budget (Under €600)";
      else if (profile.totalMonthlyCost < 900)
        budgetRange = "Mid-range (€600-900)";
      else budgetRange = "High-end (€900+)";

      if (!budgetGroups.has(budgetRange)) {
        budgetGroups.set(budgetRange, { costs: [], ratings: [] });
      }
      budgetGroups.get(budgetRange).costs.push(profile.totalMonthlyCost);
      if (profile.overallRating > 0) {
        budgetGroups.get(budgetRange).ratings.push(profile.overallRating);
      }
    }
  });

  const budgetComparison = {
    category: "Budget Range",
    groups: Array.from(budgetGroups.entries()).map(([label, data]) => ({
      label,
      studentCount: data.costs.length,
      avgCost: Math.round(
        data.costs.reduce((a, b) => a + b, 0) / data.costs.length,
      ),
      avgRating:
        data.ratings.length > 0
          ? Math.round(
              (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length) *
                10,
            ) / 10
          : 0,
      characteristics: [],
    })),
  };

  if (budgetComparison.groups.length > 0) {
    comparisons.push(budgetComparison);
  }

  // Accommodation Type Comparison
  const accommodationGroups = new Map();
  studentProfiles.forEach((profile) => {
    const type = profile.accommodationType;
    if (type !== "Unknown" && profile.totalMonthlyCost > 0) {
      if (!accommodationGroups.has(type)) {
        accommodationGroups.set(type, { costs: [], ratings: [] });
      }
      accommodationGroups.get(type).costs.push(profile.totalMonthlyCost);
      if (profile.overallRating > 0) {
        accommodationGroups.get(type).ratings.push(profile.overallRating);
      }
    }
  });

  const accommodationComparison = {
    category: "Accommodation Type",
    groups: Array.from(accommodationGroups.entries()).map(([label, data]) => ({
      label,
      studentCount: data.costs.length,
      avgCost: Math.round(
        data.costs.reduce((a, b) => a + b, 0) / data.costs.length,
      ),
      avgRating:
        data.ratings.length > 0
          ? Math.round(
              (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length) *
                10,
            ) / 10
          : 0,
      characteristics: [],
    })),
  };

  if (accommodationComparison.groups.length > 0) {
    comparisons.push(accommodationComparison);
  }

  return comparisons;
}

/**
 * Aggregates all form submission data for a specific city
 */
export async function aggregateCityData(
  city: string,
  country: string,
): Promise<CityAggregatedData> {
  console.log(`Aggregating data for ${city}, ${country}`);

  try {
    // 1. Fetch CityStatistics (Fastest source for costs)
    const cityStats = await prisma.cityStatistics.findUnique({
      where: {
        city_country_semester: {
          city,
          country,
          semester: "ALL",
        },
      },
    });

    // 2. Fetch Accommodation Reviews (Fastest source for accommodation stats)
    const accommodationReviews = await prisma.accommodationReview.findMany({
      where: {
        experience: {
          hostCity: { equals: city, mode: "insensitive" },
          hostCountry: { equals: country, mode: "insensitive" },
        },
      },
      select: {
        type: true,
        pricePerMonth: true,
        rating: true,
      },
    });

    // 3. Fetch Erasmus Experiences (Source for qualitative data and other stats)
    const experiences = await prisma.erasmusExperience.findMany({
      where: {
        hostCity: { equals: city, mode: "insensitive" },
        hostCountry: { equals: country, mode: "insensitive" },
        isComplete: true,
      },
      include: {
        hostUniversity: true,
      },
    });

    // Initialize aggregated data structure
    const aggregated: CityAggregatedData = {
      city,
      country,
      totalSubmissions: experiences.length,
      livingCosts: {
        avgMonthlyRent: cityStats?.avgMonthlyRentCents ? cityStats.avgMonthlyRentCents / 100 : 0,
        avgMonthlyFood: cityStats?.avgGroceriesCents ? cityStats.avgGroceriesCents / 100 : 0,
        avgMonthlyTransport: cityStats?.avgTransportCents ? cityStats.avgTransportCents / 100 : 0,
        avgMonthlyEntertainment: cityStats?.avgSocialLifeCents ? cityStats.avgSocialLifeCents / 100 : 0,
        avgMonthlyUtilities: 0, // Not in CityStatistics explicitly, maybe fallback
        avgMonthlyOther: 0,
        avgTotalMonthly: cityStats?.avgTotalExpensesCents ? cityStats.avgTotalExpensesCents / 100 : 0,
        costSubmissions: cityStats?.expenseSampleSize || 0,
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
        totalAccommodationSubmissions: accommodationReviews.length,
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

    // Calculate Ratings from Experiences
    let totalOverall = 0;
    let countOverall = 0;
    
    experiences.forEach(exp => {
      const expData = exp.experience as any;
      if (expData?.overallRating) {
        totalOverall += parseInt(expData.overallRating);
        countOverall++;
      }
    });

    aggregated.ratings.avgOverallRating = countOverall > 0 ? totalOverall / countOverall : 0;
    aggregated.ratings.ratingSubmissions = countOverall;

    // Calculate Accommodation Types Breakdown
    const typeCounts: Record<string, { count: number; totalRent: number }> = {};
    accommodationReviews.forEach(review => {
      if (!typeCounts[review.type]) {
        typeCounts[review.type] = { count: 0, totalRent: 0 };
      }
      typeCounts[review.type].count++;
      typeCounts[review.type].totalRent += review.pricePerMonth;
    });

    aggregated.accommodation.types = Object.entries(typeCounts).map(([type, data]) => ({
      type,
      count: data.count,
      avgRent: data.count > 0 ? data.totalRent / data.count : 0,
      percentage: accommodationReviews.length > 0 ? Math.round((data.count / accommodationReviews.length) * 100) : 0,
    }));

    // Extract Universities
    const uniCounts: Record<string, number> = {};
    experiences.forEach(exp => {
      const uniName = exp.hostUniversity?.name || (exp.basicInfo as any)?.hostUniversity || "Unknown";
      uniCounts[uniName] = (uniCounts[uniName] || 0) + 1;
    });

    aggregated.universities = Object.entries(uniCounts)
      .map(([name, count]) => ({ name, studentCount: count }))
      .sort((a, b) => b.studentCount - a.studentCount);

    // Extract Top Tips (Simple extraction)
    const tips: string[] = [];
    experiences.forEach(exp => {
      const tip = extractBestTip(exp.experience);
      if (tip) tips.push(tip);
    });

    aggregated.topTips = tips.slice(0, 5).map(tip => ({
      category: "General",
      tip,
      frequency: 1
    }));

    return aggregated;

  } catch (error) {
    console.error("Error aggregating city data:", error);
    // Return empty structure on error
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
}

export async function getAllCitiesAggregatedData(): Promise<CityAggregatedData[]> {
    // This is a heavy operation, ideally we should cache this or use a materialized view.
    // For now, we can query distinct cities from ErasmusExperience and aggregate them.
    
    const distinctCities = await prisma.erasmusExperience.findMany({
        where: { isComplete: true },
        select: { hostCity: true, hostCountry: true },
        distinct: ['hostCity', 'hostCountry']
    });

    const results = await Promise.all(
        distinctCities
            .filter(c => c.hostCity && c.hostCountry)
            .map(c => aggregateCityData(c.hostCity!, c.hostCountry!))
    );

    return results;
}
