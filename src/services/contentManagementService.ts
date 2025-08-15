import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

// Types for enhanced content management
interface DestinationAggregation {
  totalSubmissions: number;
  averageRating: number | null;
  averageCost: number | null;
  accommodationData: any;
  courseData: any;
  livingExpensesData: any;
  userExperiences: any[];
  demographics: any;
}

interface ContentMetrics {
  qualityScore: number;
  completeness: number;
  relevance: number;
  userRating: number;
}

export class ContentManagementService {
  /**
   * Create or update a destination from user submissions
   */
  static async createDestinationFromSubmissions(
    city: string,
    country: string,
    adminOverrides: any = {},
  ) {
    try {
      // Get all relevant submissions for this location
      const submissions = await prisma.formSubmission.findMany({
        where: {
          location: `${city}, ${country}`,
          status: "PUBLISHED",
          processed: false,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (submissions.length === 0) {
        throw new Error("No submissions found for this location");
      }

      // Aggregate data from submissions
      const aggregatedData = await this.aggregateSubmissionData(submissions);

      // Check if destination already exists
      let destination = await prisma.destination.findFirst({
        where: { city, country },
      });

      const destinationData = {
        name: adminOverrides.name || `${city}, ${country}`,
        city,
        country,
        description:
          adminOverrides.description ||
          `Study destination in ${city}, ${country} based on ${submissions.length} student experiences`,
        imageUrl: adminOverrides.imageUrl,
        featured: adminOverrides.featured || false,
        status: "published",
        source: "user_generated",
        aggregatedData: aggregatedData,
        adminOverrides: adminOverrides,
        submissionCount: submissions.length,
        lastDataUpdate: new Date(),
      };

      if (destination) {
        // Update existing destination
        destination = await prisma.destination.update({
          where: { id: destination.id },
          data: destinationData,
        });
      } else {
        // Create new destination
        destination = await prisma.destination.create({
          data: destinationData,
        });
      }

      // Link submissions to destination
      await this.linkSubmissionsToDestination(destination.id, submissions);

      // Mark submissions as processed
      await prisma.formSubmission.updateMany({
        where: {
          id: { in: submissions.map((s) => s.id) },
        },
        data: { processed: true },
      });

      return destination;
    } catch (error) {
      console.error("Error creating destination from submissions:", error);
      throw error;
    }
  }

  /**
   * Aggregate data from multiple submissions
   */
  static async aggregateSubmissionData(
    submissions: any[],
  ): Promise<DestinationAggregation> {
    const basicInfoSubmissions = submissions.filter(
      (s) => s.type === "basic-info",
    );
    const accommodationSubmissions = submissions.filter(
      (s) => s.type === "accommodation",
    );
    const livingExpensesSubmissions = submissions.filter(
      (s) => s.type === "living-expenses",
    );
    const experienceSubmissions = submissions.filter(
      (s) => s.type === "help-future-students",
    );

    // Calculate average rating
    const ratings = experienceSubmissions
      .map((s) => s.data?.overallRating || s.data?.ratings?.overallRating)
      .filter((r) => r !== null && r !== undefined);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null;

    // Calculate average cost
    const costs = livingExpensesSubmissions
      .map((s) => s.data?.totalMonthlyBudget)
      .filter((c) => c !== null && c !== undefined);
    const averageCost =
      costs.length > 0
        ? costs.reduce((sum, cost) => sum + cost, 0) / costs.length
        : null;

    // Aggregate accommodation data
    const accommodationData = this.aggregateAccommodationData(
      accommodationSubmissions,
    );

    // Aggregate course data
    const courseData = this.aggregateCourseData(
      submissions.filter((s) => s.type === "course-matching"),
    );

    // Aggregate living expenses data
    const livingExpensesData = this.aggregateLivingExpensesData(
      livingExpensesSubmissions,
    );

    // Extract user experiences
    const userExperiences = experienceSubmissions.map((s) => ({
      id: s.id,
      userId: s.userId,
      title: s.title,
      excerpt: s.data?.advice?.substring(0, 200) || "",
      rating: s.data?.overallRating || s.data?.ratings?.overallRating,
      createdAt: s.createdAt,
    }));

    // Calculate demographics
    const demographics = this.calculateDemographics(basicInfoSubmissions);

    return {
      totalSubmissions: submissions.length,
      averageRating,
      averageCost,
      accommodationData,
      courseData,
      livingExpensesData,
      userExperiences,
      demographics,
    };
  }

  /**
   * Aggregate accommodation data
   */
  static aggregateAccommodationData(submissions: any[]) {
    if (submissions.length === 0) return null;

    const accommodationTypes = {};
    const rentRanges = [];
    const ratings = [];

    submissions.forEach((submission) => {
      const data = submission.data;

      // Count accommodation types
      if (data.accommodationType) {
        accommodationTypes[data.accommodationType] =
          (accommodationTypes[data.accommodationType] || 0) + 1;
      }

      // Collect rent data
      if (data.monthlyRent) {
        rentRanges.push(data.monthlyRent);
      }

      // Collect ratings
      if (data.accommodationRating) {
        ratings.push(data.accommodationRating);
      }
    });

    const averageRent =
      rentRanges.length > 0
        ? rentRanges.reduce((sum, rent) => sum + rent, 0) / rentRanges.length
        : null;

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null;

    return {
      totalSubmissions: submissions.length,
      accommodationTypes,
      averageRent,
      rentRange:
        rentRanges.length > 0
          ? {
              min: Math.min(...rentRanges),
              max: Math.max(...rentRanges),
            }
          : null,
      averageRating,
      popularOptions: Object.entries(accommodationTypes)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3),
    };
  }

  /**
   * Aggregate course data
   */
  static aggregateCourseData(submissions: any[]) {
    if (submissions.length === 0) return null;

    const departments = {};
    const courseCounts = [];
    const difficulties = [];

    submissions.forEach((submission) => {
      const data = submission.data;

      if (data.hostDepartment) {
        departments[data.hostDepartment] =
          (departments[data.hostDepartment] || 0) + 1;
      }

      if (data.hostCourseCount) {
        courseCounts.push(data.hostCourseCount);
      }

      if (data.difficulty) {
        difficulties.push(data.difficulty);
      }
    });

    return {
      totalSubmissions: submissions.length,
      popularDepartments: Object.entries(departments)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5),
      averageCourseCount:
        courseCounts.length > 0
          ? courseCounts.reduce((sum, count) => sum + count, 0) /
            courseCounts.length
          : null,
      difficultyDistribution: difficulties.reduce((acc, diff) => {
        acc[diff] = (acc[diff] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  /**
   * Aggregate living expenses data
   */
  static aggregateLivingExpensesData(submissions: any[]) {
    if (submissions.length === 0) return null;

    const expenses = {
      rent: [],
      food: [],
      transport: [],
      entertainment: [],
      total: [],
    };

    submissions.forEach((submission) => {
      const data = submission.data;

      if (data.monthlyRent) expenses.rent.push(data.monthlyRent);
      if (data.monthlyFood) expenses.food.push(data.monthlyFood);
      if (data.monthlyTransport) expenses.transport.push(data.monthlyTransport);
      if (data.monthlyEntertainment)
        expenses.entertainment.push(data.monthlyEntertainment);
      if (data.totalMonthlyBudget) expenses.total.push(data.totalMonthlyBudget);
    });

    const calculateStats = (values: number[]) => {
      if (values.length === 0) return null;
      const sorted = values.sort((a, b) => a - b);
      return {
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: sorted[0],
        max: sorted[sorted.length - 1],
      };
    };

    return {
      totalSubmissions: submissions.length,
      rent: calculateStats(expenses.rent),
      food: calculateStats(expenses.food),
      transport: calculateStats(expenses.transport),
      entertainment: calculateStats(expenses.entertainment),
      total: calculateStats(expenses.total),
    };
  }

  /**
   * Calculate demographics from basic info submissions
   */
  static calculateDemographics(submissions: any[]) {
    if (submissions.length === 0) return null;

    const nationalities = {};
    const homeCountries = {};
    const studyLevels = {};

    submissions.forEach((submission) => {
      const data = submission.data;

      if (data.nationality) {
        nationalities[data.nationality] =
          (nationalities[data.nationality] || 0) + 1;
      }

      if (data.homeCountry) {
        homeCountries[data.homeCountry] =
          (homeCountries[data.homeCountry] || 0) + 1;
      }

      if (data.levelOfStudy) {
        studyLevels[data.levelOfStudy] =
          (studyLevels[data.levelOfStudy] || 0) + 1;
      }
    });

    return {
      totalStudents: submissions.length,
      topNationalities: Object.entries(nationalities)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5),
      topHomeCountries: Object.entries(homeCountries)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5),
      studyLevelDistribution: studyLevels,
    };
  }

  /**
   * Link submissions to destination
   */
  static async linkSubmissionsToDestination(
    destinationId: string,
    submissions: any[],
  ) {
    const links = submissions.map((submission) => ({
      destinationId,
      submissionId: submission.id,
      contributionType: this.determineContributionType(submission),
      weight: this.calculateSubmissionWeight(submission),
      adminApproved: true,
    }));

    await prisma.destinationSubmission.createMany({
      data: links,
      skipDuplicates: true,
    });
  }

  /**
   * Determine contribution type based on submission
   */
  static determineContributionType(submission: any): string {
    switch (submission.type) {
      case "basic-info":
        return "primary";
      case "help-future-students":
        return "primary";
      case "accommodation":
      case "living-expenses":
      case "course-matching":
        return "supporting";
      default:
        return "reference";
    }
  }

  /**
   * Calculate submission weight for aggregation
   */
  static calculateSubmissionWeight(submission: any): number {
    // Base weight
    let weight = 1.0;

    // Adjust based on data completeness
    const data = submission.data;
    const completeness = this.calculateDataCompleteness(data, submission.type);
    weight *= completeness;

    // Adjust based on recency (newer submissions get slightly higher weight)
    const daysOld =
      (Date.now() - new Date(submission.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.5, 1 - daysOld / 365); // Decay over a year
    weight *= recencyFactor;

    return Math.max(0.1, Math.min(2.0, weight)); // Clamp between 0.1 and 2.0
  }

  /**
   * Calculate data completeness score
   */
  static calculateDataCompleteness(data: any, type: string): number {
    const requiredFields = {
      "basic-info": ["hostCity", "hostCountry", "hostUniversity"],
      accommodation: ["accommodationType", "monthlyRent"],
      "living-expenses": ["totalMonthlyBudget"],
      "course-matching": ["hostCourseCount"],
      "help-future-students": ["overallRating", "advice"],
    };

    const fields = requiredFields[type] || [];
    if (fields.length === 0) return 1.0;

    const completedFields = fields.filter((field) => {
      const value = data[field];
      return value !== null && value !== undefined && value !== "";
    });

    return completedFields.length / fields.length;
  }

  /**
   * Get enhanced destination data with aggregations
   */
  static async getDestinationWithAggregations(destinationId: string) {
    const destination = await prisma.destination.findUnique({
      where: { id: destinationId },
      include: {
        linkedSubmissions: {
          include: {
            submission: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!destination) {
      throw new Error("Destination not found");
    }

    // If aggregated data is stale, refresh it
    const isStale =
      destination.lastDataUpdate < new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    if (isStale && destination.linkedSubmissions.length > 0) {
      const submissions = destination.linkedSubmissions.map(
        (link) => link.submission,
      );
      const freshAggregation = await this.aggregateSubmissionData(submissions);

      await prisma.destination.update({
        where: { id: destinationId },
        data: {
          aggregatedData: freshAggregation,
          lastDataUpdate: new Date(),
        },
      });

      destination.aggregatedData = freshAggregation;
    }

    return destination;
  }

  /**
   * Update destination with admin overrides
   */
  static async updateDestinationOverrides(
    destinationId: string,
    overrides: any,
  ) {
    return await prisma.destination.update({
      where: { id: destinationId },
      data: {
        adminOverrides: overrides,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get destinations requiring admin review
   */
  static async getDestinationsForReview() {
    return await prisma.destination.findMany({
      where: {
        status: { in: ["draft", "under_review"] },
      },
      include: {
        linkedSubmissions: {
          include: {
            submission: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
