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
      stdDevMonthlyCost: number;
    };
    ratingDistribution: {
      [key: number]: number; // 1-5 star counts
    };
  };
}
