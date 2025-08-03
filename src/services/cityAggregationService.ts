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
  const profiles = await prisma.formSubmission.findMany({
    where: {
      status: "PUBLISHED",
      type: "BASIC_INFO",
      OR: [
        {
          data: {
            path: "hostCity",
            equals: city,
          },
        },
        {
          data: {
            path: "destinationCity",
            equals: city,
          },
        },
      ],
    },
    include: {
      user: {
        include: {
          formSubmissions: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
  });

  return profiles
    .map((profile, index) => {
      const basicInfo = profile.data as any;
      const userSubmissions = profile.user.formSubmissions;

      // Get linked submissions for this student
      const livingExpenses = userSubmissions.find(
        (s) => s.type === "LIVING_EXPENSES",
      );
      const accommodation = userSubmissions.find(
        (s) => s.type === "ACCOMMODATION",
      );
      const experience = userSubmissions.find((s) => s.type === "EXPERIENCE");

      const livingData = livingExpenses?.data as any;
      const accommodationData = accommodation?.data as any;
      const experienceData = experience?.data as any;

      return {
        id: `student_${index + 1}`, // Anonymous ID
        university:
          basicInfo.hostUniversity || basicInfo.university || "Unknown",
        studyPeriod: basicInfo.studyPeriod || basicInfo.duration || "Unknown",
        fieldOfStudy: basicInfo.fieldOfStudy || basicInfo.major || "Unknown",
        totalMonthlyCost: livingData?.totalMonthlyBudget || 0,
        overallRating: experienceData?.overallRating || 0,
        accommodationType:
          accommodationData?.accommodationType ||
          accommodationData?.type ||
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
    // Get all basic info submissions for this city
    const basicInfoSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: "PUBLISHED",
        type: "BASIC_INFO",
        OR: [
          {
            data: {
              path: "hostCity",
              equals: city,
            },
          },
          {
            data: {
              path: "destinationCity",
              equals: city,
            },
          },
        ],
      },
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    console.log(
      `Found ${basicInfoSubmissions.length} basic info submissions for ${city}`,
    );

    // Get user IDs for linked submissions
    const userIds = basicInfoSubmissions.map((sub) => sub.userId);

    // Get all linked submissions for these users
    const [
      livingExpensesSubmissions,
      accommodationSubmissions,
      experienceSubmissions,
      courseMatchingSubmissions,
    ] = await Promise.all([
      // Living expenses
      prisma.formSubmission.findMany({
        where: {
          status: "PUBLISHED",
          type: "LIVING_EXPENSES",
          userId: { in: userIds },
        },
      }),

      // Accommodation
      prisma.formSubmission.findMany({
        where: {
          status: "PUBLISHED",
          type: "ACCOMMODATION",
          userId: { in: userIds },
        },
      }),

      // Experience/Story submissions
      prisma.formSubmission.findMany({
        where: {
          status: "PUBLISHED",
          type: { in: ["EXPERIENCE", "STORY"] },
          userId: { in: userIds },
        },
      }),

      // Course Matching submissions
      prisma.formSubmission.findMany({
        where: {
          status: "PUBLISHED",
          type: "COURSE_MATCHING",
          userId: { in: userIds },
        },
      }),
    ]);

    // Initialize aggregated data structure
    const aggregated: CityAggregatedData = {
      city,
      country,
      totalSubmissions: basicInfoSubmissions.length,
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

    // Aggregate living costs
    if (livingExpensesSubmissions.length > 0) {
      const costs = {
        monthlyRent: [],
        monthlyFood: [],
        monthlyTransport: [],
        monthlyEntertainment: [],
        monthlyUtilities: [],
        monthlyOther: [],
        totalMonthlyBudget: [],
      };

      livingExpensesSubmissions.forEach((submission) => {
        const data = submission.data as any;

        // Handle both direct fields and nested expenses object
        const rent = data.monthlyRent || data.expenses?.rent;
        const food = data.monthlyFood || data.expenses?.food;
        const transport = data.monthlyTransport || data.expenses?.transport;
        const entertainment =
          data.monthlyEntertainment || data.expenses?.entertainment;
        const utilities = data.monthlyUtilities || data.expenses?.utilities;
        const other = data.monthlyOther || data.expenses?.other;
        const total = data.totalMonthlyBudget || data.expenses?.total;

        if (rent && !isNaN(parseFloat(rent)))
          costs.monthlyRent.push(parseFloat(rent));
        if (food && !isNaN(parseFloat(food)))
          costs.monthlyFood.push(parseFloat(food));
        if (transport && !isNaN(parseFloat(transport)))
          costs.monthlyTransport.push(parseFloat(transport));
        if (entertainment && !isNaN(parseFloat(entertainment)))
          costs.monthlyEntertainment.push(parseFloat(entertainment));
        if (utilities && !isNaN(parseFloat(utilities)))
          costs.monthlyUtilities.push(parseFloat(utilities));
        if (other && !isNaN(parseFloat(other)))
          costs.monthlyOther.push(parseFloat(other));
        if (total && !isNaN(parseFloat(total)))
          costs.totalMonthlyBudget.push(parseFloat(total));
      });

      // Calculate averages
      aggregated.livingCosts = {
        avgMonthlyRent:
          costs.monthlyRent.length > 0
            ? costs.monthlyRent.reduce((a, b) => a + b, 0) /
              costs.monthlyRent.length
            : 0,
        avgMonthlyFood:
          costs.monthlyFood.length > 0
            ? costs.monthlyFood.reduce((a, b) => a + b, 0) /
              costs.monthlyFood.length
            : 0,
        avgMonthlyTransport:
          costs.monthlyTransport.length > 0
            ? costs.monthlyTransport.reduce((a, b) => a + b, 0) /
              costs.monthlyTransport.length
            : 0,
        avgMonthlyEntertainment:
          costs.monthlyEntertainment.length > 0
            ? costs.monthlyEntertainment.reduce((a, b) => a + b, 0) /
              costs.monthlyEntertainment.length
            : 0,
        avgMonthlyUtilities:
          costs.monthlyUtilities.length > 0
            ? costs.monthlyUtilities.reduce((a, b) => a + b, 0) /
              costs.monthlyUtilities.length
            : 0,
        avgMonthlyOther:
          costs.monthlyOther.length > 0
            ? costs.monthlyOther.reduce((a, b) => a + b, 0) /
              costs.monthlyOther.length
            : 0,
        avgTotalMonthly:
          costs.totalMonthlyBudget.length > 0
            ? costs.totalMonthlyBudget.reduce((a, b) => a + b, 0) /
              costs.totalMonthlyBudget.length
            : 0,
        costSubmissions: livingExpensesSubmissions.length,
      };
    }

    // Aggregate ratings from experience submissions
    if (experienceSubmissions.length > 0) {
      const ratings = {
        overall: [],
        academic: [],
        socialLife: [],
        culturalImmersion: [],
        costOfLiving: [],
        accommodation: [],
      };

      experienceSubmissions.forEach((submission) => {
        const data = submission.data as any;

        // Handle ratings (ensure they're numbers and within valid range 1-5)
        if (data.overallRating && !isNaN(parseFloat(data.overallRating))) {
          const rating = parseFloat(data.overallRating);
          if (rating >= 1 && rating <= 5) {
            ratings.overall.push(rating);
          }
        }
        if (data.academicRating && !isNaN(parseFloat(data.academicRating))) {
          const rating = parseFloat(data.academicRating);
          if (rating >= 1 && rating <= 5) {
            ratings.academic.push(rating);
          }
        }
        if (data.socialLifeRating && !isNaN(parseFloat(data.socialLifeRating))) {
          const rating = parseFloat(data.socialLifeRating);
          if (rating >= 1 && rating <= 5) {
            ratings.socialLife.push(rating);
          }
        }
        if (data.culturalImmersionRating && !isNaN(parseFloat(data.culturalImmersionRating))) {
          const rating = parseFloat(data.culturalImmersionRating);
          if (rating >= 1 && rating <= 5) {
            ratings.culturalImmersion.push(rating);
          }
        }
        if (data.costOfLivingRating && !isNaN(parseFloat(data.costOfLivingRating))) {
          const rating = parseFloat(data.costOfLivingRating);
          if (rating >= 1 && rating <= 5) {
            ratings.costOfLiving.push(rating);
          }
        }
        if (data.accommodationRating && !isNaN(parseFloat(data.accommodationRating))) {
          const rating = parseFloat(data.accommodationRating);
          if (rating >= 1 && rating <= 5) {
            ratings.accommodation.push(rating);
          }
        }
      });

      aggregated.ratings = {
        avgOverallRating:
          ratings.overall.length > 0
            ? ratings.overall.reduce((a, b) => a + b, 0) /
              ratings.overall.length
            : 0,
        avgAcademicRating:
          ratings.academic.length > 0
            ? ratings.academic.reduce((a, b) => a + b, 0) /
              ratings.academic.length
            : 0,
        avgSocialLifeRating:
          ratings.socialLife.length > 0
            ? ratings.socialLife.reduce((a, b) => a + b, 0) /
              ratings.socialLife.length
            : 0,
        avgCulturalImmersionRating:
          ratings.culturalImmersion.length > 0
            ? ratings.culturalImmersion.reduce((a, b) => a + b, 0) /
              ratings.culturalImmersion.length
            : 0,
        avgCostOfLivingRating:
          ratings.costOfLiving.length > 0
            ? ratings.costOfLiving.reduce((a, b) => a + b, 0) /
              ratings.costOfLiving.length
            : 0,
        avgAccommodationRating:
          ratings.accommodation.length > 0
            ? ratings.accommodation.reduce((a, b) => a + b, 0) /
              ratings.accommodation.length
            : 0,
        ratingSubmissions: experienceSubmissions.length,
      };
    }

    // Aggregate accommodation types
    if (accommodationSubmissions.length > 0) {
      const accommodationTypes = new Map<
        string,
        { count: number; totalRent: number; rents: number[] }
      >();

      accommodationSubmissions.forEach((submission) => {
        const data = submission.data as any;
        const type = data.accommodationType || data.type || "Unknown";
        const rent = data.monthlyRent;

        if (!accommodationTypes.has(type)) {
          accommodationTypes.set(type, { count: 0, totalRent: 0, rents: [] });
        }

        const typeData = accommodationTypes.get(type)!;
        typeData.count++;

        if (rent && !isNaN(parseFloat(rent))) {
          const rentValue = parseFloat(rent);
          typeData.rents.push(rentValue);
          typeData.totalRent += rentValue;
        }
      });

      const totalAccommodation = accommodationSubmissions.length;
      aggregated.accommodation = {
        types: Array.from(accommodationTypes.entries()).map(([type, data]) => ({
          type,
          count: data.count,
          avgRent:
            data.rents.length > 0 ? data.totalRent / data.rents.length : 0,
          percentage: Math.round((data.count / totalAccommodation) * 100),
        })),
        totalAccommodationSubmissions: totalAccommodation,
      };
    }

    // Aggregate course matching data
    if (courseMatchingSubmissions.length > 0) {
      const difficultyMap: Record<string, number> = {
        "Very Easy": 1,
        "Easy": 2,
        "Moderate": 3,
        "Difficult": 4,
        "Very Difficult": 5,
      };

      let totalDifficulty = 0;
      let totalCoursesMatched = 0;
      let totalCreditsTransferred = 0;
      let creditsTransferredCount = 0;
      let courseRecommendationCount = 0;
      const challenges: string[] = [];
      const advice: string[] = [];
      const difficultyBreakdown: Record<string, number> = {};
      const departmentData = new Map<string, {
        count: number;
        totalDifficulty: number;
        totalSuccess: number;
        successCount: number;
      }>();

      courseMatchingSubmissions.forEach((submission) => {
        const data = submission.data as any;

        // Difficulty aggregation
        const difficulty = difficultyMap[data.courseMatchingDifficult] || 3;
        totalDifficulty += difficulty;

        // Track difficulty breakdown
        const difficultyLabel = data.courseMatchingDifficult || "Moderate";
        difficultyBreakdown[difficultyLabel] = (difficultyBreakdown[difficultyLabel] || 0) + 1;

        // Courses matched
        if (data.homeCourseCount) {
          totalCoursesMatched += data.homeCourseCount;
        }

        // Credits transferred
        if (data.creditsTransferredSuccessfully && data.totalCreditsAttempted) {
          const successRate = (data.creditsTransferredSuccessfully / data.totalCreditsAttempted) * 100;
          totalCreditsTransferred += successRate;
          creditsTransferredCount++;
        }

        // Course recommendations
        if (data.recommendCourses === "Yes") {
          courseRecommendationCount++;
        }

        // Collect challenges and advice
        if (data.courseMatchingChallenges) {
          challenges.push(data.courseMatchingChallenges);
        }
        if (data.biggestCourseChallenge) {
          challenges.push(data.biggestCourseChallenge);
        }
        if (data.academicAdviceForFuture) {
          advice.push(data.academicAdviceForFuture);
        }
        if (data.courseSelectionTips) {
          advice.push(data.courseSelectionTips);
        }

        // Department insights
        const dept = data.hostDepartment;
        if (dept) {
          if (!departmentData.has(dept)) {
            departmentData.set(dept, {
              count: 0,
              totalDifficulty: 0,
              totalSuccess: 0,
              successCount: 0,
            });
          }
          const deptData = departmentData.get(dept)!;
          deptData.count++;
          deptData.totalDifficulty += difficulty;

          if (data.creditsTransferredSuccessfully && data.totalCreditsAttempted) {
            deptData.totalSuccess += (data.creditsTransferredSuccessfully / data.totalCreditsAttempted) * 100;
            deptData.successCount++;
          }
        }
      });

      // Process common challenges and advice (extract most frequent/useful ones)
      const commonChallenges = challenges
        .filter(challenge => challenge.length > 20)
        .slice(0, 3);

      const topAdvice = advice
        .filter(tip => tip.length > 20)
        .slice(0, 3);

      // Calculate department insights
      const departmentInsights = Array.from(departmentData.entries())
        .map(([department, data]) => ({
          department,
          studentCount: data.count,
          avgDifficulty: Math.round((data.totalDifficulty / data.count) * 10) / 10,
          avgSuccess: data.successCount > 0
            ? Math.round((data.totalSuccess / data.successCount) * 10) / 10
            : 0,
        }))
        .sort((a, b) => b.studentCount - a.studentCount)
        .slice(0, 5);

      aggregated.courseMatching = {
        avgDifficulty: Math.round((totalDifficulty / courseMatchingSubmissions.length) * 10) / 10,
        difficultyBreakdown,
        avgCoursesMatched: Math.round((totalCoursesMatched / courseMatchingSubmissions.length) * 10) / 10,
        avgCreditsTransferred: creditsTransferredCount > 0
          ? Math.round((totalCreditsTransferred / creditsTransferredCount) * 10) / 10
          : 0,
        successRate: creditsTransferredCount > 0
          ? Math.round((totalCreditsTransferred / creditsTransferredCount) * 10) / 10
          : 0,
        recommendationRate: Math.round((courseRecommendationCount / courseMatchingSubmissions.length) * 100),
        totalCourseMatchingSubmissions: courseMatchingSubmissions.length,
        commonChallenges,
        topAdvice,
        departmentInsights,
      };
    }

    // Calculate recommendation percentage from multiple sources
    let recommendCount = 0;
    let totalRecommendationResponses = 0;

    // Check experience submissions for recommendations
    experienceSubmissions.forEach((submission) => {
      const data = submission.data as any;

      // Check new experience form field
      if (data.recommendExchange !== undefined) {
        totalRecommendationResponses++;
        if (data.recommendExchange === "yes") {
          recommendCount++;
        }
      }
      // Check legacy fields
      else if (data.wouldRecommend !== undefined) {
        totalRecommendationResponses++;
        if (
          data.wouldRecommend === "yes" ||
          data.wouldRecommend === true ||
          data.wouldRecommend === "true"
        ) {
          recommendCount++;
        }
      }
    });

    // Check accommodation submissions for recommendations
    accommodationSubmissions.forEach((submission) => {
      const data = submission.data as any;
      if (data.wouldRecommend !== undefined) {
        totalRecommendationResponses++;
        if (
          data.wouldRecommend === "yes" ||
          data.wouldRecommend === "Definitely" ||
          data.wouldRecommend === "Probably" ||
          data.wouldRecommend === true ||
          data.wouldRecommend === "true"
        ) {
          recommendCount++;
        }
      }
    });

    aggregated.recommendations = {
      wouldRecommendCount: recommendCount,
      totalRecommendationResponses,
      recommendationPercentage:
        totalRecommendationResponses > 0
          ? Math.round((recommendCount / totalRecommendationResponses) * 100)
          : 0,
    };

    // Extract universities from basic info
    const universityMap = new Map<string, number>();
    basicInfoSubmissions.forEach((submission) => {
      const data = submission.data as any;
      const university = data.hostUniversity || data.university;
      if (university) {
        universityMap.set(university, (universityMap.get(university) || 0) + 1);
      }
    });

    aggregated.universities = Array.from(universityMap.entries())
      .map(([name, count]) => ({ name, studentCount: count }))
      .sort((a, b) => b.studentCount - a.studentCount);

    // Extract top tips from experience submissions
    const tipsMap = new Map<string, number>();
    experienceSubmissions.forEach((submission) => {
      const data = submission.data as any;

      // Look for various tip fields including new experience form fields
      const tipFields = [
        // New experience form fields
        "socialTips",
        "culturalTips",
        "travelTips",
        "academicTips", // Now includes course matching advice
        "practicalTips",
        "adviceForFutureStudents",
        // Course matching specific fields from linked submissions
        "academicAdviceForFuture",
        "courseSelectionTips",
        "academicPreparationAdvice",
        "bestCoursesRecommendation",
        // Legacy and other fields
        "budgetTips",
        "transportationTips",
        "socialLifeTips",
        "tips",
        "recommendations",
        "advice",
        "generalTips",
      ];

      tipFields.forEach((field) => {
        if (data[field] && typeof data[field] === "string" && data[field].length > 10) {
          // Split tips by common delimiters and clean them
          const tips = data[field]
            .split(/[.!?;]/)
            .map((tip: string) => tip.trim())
            .filter((tip: string) => tip.length > 15 && tip.length < 200); // Not too long

          tips.forEach((tip: string) => {
            // Clean and normalize tip
            const cleanTip = tip.replace(/^[-*•]\s*/, '').trim(); // Remove bullet points
            if (cleanTip.length > 15) {
              const normalizedTip = cleanTip.toLowerCase();
              tipsMap.set(cleanTip, (tipsMap.get(normalizedTip) || 0) + 1);
            }
          });
        }
      });
    });

    // Get top 10 most common tips
    aggregated.topTips = Array.from(tipsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tip, frequency]) => ({
        category: "General",
        tip,
        frequency,
      }));

    console.log(`Aggregated data for ${city}:`, {
      totalSubmissions: aggregated.totalSubmissions,
      costSubmissions: aggregated.livingCosts.costSubmissions,
      ratingSubmissions: aggregated.ratings.ratingSubmissions,
      accommodationSubmissions:
        aggregated.accommodation.totalAccommodationSubmissions,
    });

    return aggregated;
  } catch (error) {
    console.error(`Error aggregating data for ${city}, ${country}:`, error);
    throw error;
  }
}

/**
 * Gets aggregated data for all cities with submissions
 */
export async function getAllCitiesAggregatedData(): Promise<
  CityAggregatedData[]
> {
  try {
    // Get all unique city/country combinations from basic info submissions
    const submissions = await prisma.formSubmission.findMany({
      where: {
        status: "PUBLISHED",
        type: "BASIC_INFO",
      },
      select: {
        data: true,
      },
    });

    console.log(
      `Found ${submissions.length} basic info submissions for aggregation`,
    );

    const cityCountryCombinations = new Set<string>();
    submissions.forEach((submission) => {
      const data = submission.data as any;
      const city = data.hostCity || data.destinationCity;
      const country = data.hostCountry || data.destinationCountry;

      if (city && country) {
        cityCountryCombinations.add(`${city}|${country}`);
      }
    });

    console.log(
      `Found ${cityCountryCombinations.size} unique city/country combinations`,
    );

    // Aggregate data for each city
    const results = await Promise.all(
      Array.from(cityCountryCombinations).map(async (cityCountry) => {
        try {
          const [city, country] = cityCountry.split("|");
          return await aggregateCityData(city, country);
        } catch (error) {
          console.error(`Error aggregating data for ${cityCountry}:`, error);
          return null;
        }
      }),
    );

    // Filter out null results and cities with no submissions
    const validResults = results
      .filter((result): result is CityAggregatedData => result !== null)
      .filter((result) => result.totalSubmissions > 0);

    console.log(
      `Successfully aggregated data for ${validResults.length} cities`,
    );
    return validResults;
  } catch (error) {
    console.error("Error in getAllCitiesAggregatedData:", error);
    return [];
  }
}
