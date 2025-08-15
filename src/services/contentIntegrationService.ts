import { prisma } from "../../lib/prisma";
import { ContentManagementService } from "./contentManagementService";

// Types for enhanced content integration
interface EnhancedDestinationData {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  imageUrl?: string;
  featured: boolean;

  // Aggregated statistics
  stats: {
    totalStudents: number;
    averageRating: number | null;
    averageCost: number | null;
    submissionCount: number;
    lastUpdated: Date;
  };

  // Detailed breakdowns
  accommodation: {
    types: Record<string, number>;
    averageRent: number | null;
    rentRange: { min: number; max: number } | null;
    popularOptions: [string, number][];
  };

  courses: {
    popularDepartments: [string, number][];
    averageCourseCount: number | null;
    difficultyDistribution: Record<string, number>;
  };

  livingCosts: {
    breakdown: {
      rent: number | null;
      food: number | null;
      transport: number | null;
      entertainment: number | null;
    };
    totalMonthly: number | null;
  };

  userExperiences: {
    id: string;
    title: string;
    excerpt: string;
    rating: number | null;
    author: string;
    createdAt: Date;
  }[];

  // SEO and metadata
  seo: {
    title: string;
    description: string;
    keywords: string[];
    metaImage?: string;
  };
}

interface ContentAnalytics {
  pageViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  topReferrers: string[];
  searchQueries: string[];
  popularContent: any[];
}

export class ContentIntegrationService {
  /**
   * Get enhanced destination data for public pages
   */
  static async getEnhancedDestinationForPublic(
    cityOrId: string,
    country?: string,
  ): Promise<EnhancedDestinationData | null> {
    try {
      // Find destination by ID or city/country
      let destination;
      if (country) {
        destination = await prisma.destination.findFirst({
          where: {
            city: cityOrId,
            country: country,
            status: "published",
          },
          include: {
            linkedSubmissions: {
              where: {
                adminApproved: true,
              },
              include: {
                submission: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } else {
        destination = await prisma.destination.findUnique({
          where: {
            id: cityOrId,
            status: "published",
          },
          include: {
            linkedSubmissions: {
              where: {
                adminApproved: true,
              },
              include: {
                submission: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }

      if (!destination) {
        return null;
      }

      // Get fresh aggregated data if needed
      let aggregatedData = destination.aggregatedData;
      const isStale =
        destination.lastDataUpdate < new Date(Date.now() - 24 * 60 * 60 * 1000);

      if (isStale && destination.linkedSubmissions.length > 0) {
        const submissions = destination.linkedSubmissions.map(
          (link) => link.submission,
        );
        aggregatedData =
          await ContentManagementService.aggregateSubmissionData(submissions);

        // Update in background
        prisma.destination
          .update({
            where: { id: destination.id },
            data: {
              aggregatedData,
              lastDataUpdate: new Date(),
            },
          })
          .catch(console.error);
      }

      // Apply admin overrides
      const finalData = this.applyAdminOverrides(destination, aggregatedData);

      // Format for public consumption
      return this.formatDestinationForPublic(finalData);
    } catch (error) {
      console.error("Error getting enhanced destination:", error);
      return null;
    }
  }

  /**
   * Apply admin overrides to aggregated data
   */
  private static applyAdminOverrides(destination: any, aggregatedData: any) {
    const overrides = destination.adminOverrides || {};

    return {
      ...destination,
      // Override basic fields if admin provided them
      name: overrides.name || destination.name,
      description:
        overrides.description ||
        destination.description ||
        `Study abroad in ${destination.city}, ${destination.country}`,
      imageUrl: overrides.imageUrl || destination.imageUrl,

      // Merge aggregated data with overrides
      aggregatedData: {
        ...aggregatedData,
        // Allow admin to override specific statistics
        ...(overrides.statsOverrides || {}),
      },
    };
  }

  /**
   * Format destination data for public pages
   */
  private static formatDestinationForPublic(
    destination: any,
  ): EnhancedDestinationData {
    const data = destination.aggregatedData || {};

    return {
      id: destination.id,
      name: destination.name,
      city: destination.city,
      country: destination.country,
      description: destination.description,
      imageUrl: destination.imageUrl,
      featured: destination.featured,

      stats: {
        totalStudents: data.totalSubmissions || 0,
        averageRating: data.averageRating,
        averageCost: data.averageCost,
        submissionCount: destination.submissionCount || 0,
        lastUpdated: destination.lastDataUpdate,
      },

      accommodation: {
        types: data.accommodationData?.accommodationTypes || {},
        averageRent: data.accommodationData?.averageRent,
        rentRange: data.accommodationData?.rentRange,
        popularOptions: data.accommodationData?.popularOptions || [],
      },

      courses: {
        popularDepartments: data.courseData?.popularDepartments || [],
        averageCourseCount: data.courseData?.averageCourseCount,
        difficultyDistribution: data.courseData?.difficultyDistribution || {},
      },

      livingCosts: {
        breakdown: {
          rent: data.livingExpensesData?.rent?.average,
          food: data.livingExpensesData?.food?.average,
          transport: data.livingExpensesData?.transport?.average,
          entertainment: data.livingExpensesData?.entertainment?.average,
        },
        totalMonthly: data.livingExpensesData?.total?.average,
      },

      userExperiences: (data.userExperiences || []).map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        excerpt: exp.excerpt,
        rating: exp.rating,
        author: exp.authorName || "Anonymous",
        createdAt: new Date(exp.createdAt),
      })),

      seo: this.generateSEOData(destination, data),
    };
  }

  /**
   * Generate SEO metadata for destinations
   */
  private static generateSEOData(destination: any, aggregatedData: any) {
    const { city, country, name } = destination;
    const totalStudents = aggregatedData.totalSubmissions || 0;
    const averageRating = aggregatedData.averageRating;

    const title = `Study in ${name} - Erasmus Exchange Guide | ErasmusJourney`;

    let description = `Complete guide to studying in ${city}, ${country}. `;
    if (totalStudents > 0) {
      description += `Based on ${totalStudents} student experiences. `;
    }
    if (averageRating) {
      description += `Average rating: ${averageRating.toFixed(1)}/5. `;
    }
    description += "Find accommodation, courses, costs, and student stories.";

    const keywords = [
      "erasmus",
      "study abroad",
      city.toLowerCase(),
      country.toLowerCase(),
      "student exchange",
      "university",
      "accommodation",
      "living costs",
      "student experience",
    ];

    return {
      title,
      description,
      keywords,
      metaImage: destination.imageUrl,
    };
  }

  /**
   * Get all published destinations for listing pages
   */
  static async getPublishedDestinations(
    options: {
      limit?: number;
      offset?: number;
      featured?: boolean;
      country?: string;
      orderBy?: "name" | "students" | "rating" | "updated";
      order?: "asc" | "desc";
    } = {},
  ) {
    const {
      limit = 50,
      offset = 0,
      featured,
      country,
      orderBy = "students",
      order = "desc",
    } = options;

    const where: any = {
      status: "published",
    };

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (country) {
      where.country = country;
    }

    // Build orderBy clause
    let orderByClause: any = {};
    switch (orderBy) {
      case "name":
        orderByClause = { name: order };
        break;
      case "students":
        orderByClause = { submissionCount: order };
        break;
      case "updated":
        orderByClause = { lastDataUpdate: order };
        break;
      case "rating":
        // For rating, we'll sort by aggregated data in post-processing
        orderByClause = { submissionCount: order };
        break;
      default:
        orderByClause = { submissionCount: order };
    }

    const destinations = await prisma.destination.findMany({
      where,
      include: {
        linkedSubmissions: {
          where: {
            adminApproved: true,
          },
          select: {
            contributionType: true,
          },
        },
      },
      orderBy: orderByClause,
      take: limit,
      skip: offset,
    });

    // Format for public consumption
    const formatted = destinations.map((dest) => ({
      id: dest.id,
      name: dest.name,
      city: dest.city,
      country: dest.country,
      description: dest.description,
      imageUrl: dest.imageUrl,
      featured: dest.featured,
      submissionCount: dest.submissionCount,
      averageRating: dest.aggregatedData?.averageRating || null,
      averageCost: dest.aggregatedData?.averageCost || null,
      lastUpdated: dest.lastDataUpdate,
    }));

    // Sort by rating if requested
    if (orderBy === "rating") {
      formatted.sort((a, b) => {
        const ratingA = a.averageRating || 0;
        const ratingB = b.averageRating || 0;
        return order === "desc" ? ratingB - ratingA : ratingA - ratingB;
      });
    }

    return formatted;
  }

  /**
   * Get accommodation data from approved submissions
   */
  static async getAccommodationExperiences(
    options: {
      city?: string;
      country?: string;
      type?: string;
      limit?: number;
      minRating?: number;
    } = {},
  ) {
    const { city, country, type, limit = 20, minRating = 0 } = options;

    const where: any = {
      status: "PUBLISHED",
      processed: true,
      type: "accommodation",
    };

    if (city || country) {
      const locationFilter = [];
      if (city && country) {
        locationFilter.push(`${city}, ${country}`);
      } else if (city) {
        locationFilter.push(city);
      } else if (country) {
        locationFilter.push(country);
      }

      where.location = {
        in: locationFilter,
      };
    }

    const submissions = await prisma.formSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return submissions
      .filter((sub) => {
        const data = sub.data as any;
        if (type && data.accommodationType !== type) return false;
        if (
          minRating > 0 &&
          (!data.accommodationRating || data.accommodationRating < minRating)
        )
          return false;
        return true;
      })
      .map((sub) => {
        const data = sub.data as any;
        return {
          id: sub.id,
          title: sub.title,
          type: data.accommodationType,
          monthlyRent: data.monthlyRent,
          rating: data.accommodationRating,
          location: sub.location,
          description: data.accommodationDescription,
          amenities: data.amenities,
          author:
            `${sub.user?.firstName || ""} ${sub.user?.lastName || ""}`.trim() ||
            "Anonymous",
          createdAt: sub.createdAt,
        };
      });
  }

  /**
   * Get university exchange data from approved submissions
   */
  static async getUniversityExchanges(
    options: {
      university?: string;
      country?: string;
      department?: string;
      limit?: number;
    } = {},
  ) {
    const { university, country, department, limit = 20 } = options;

    const where: any = {
      status: "PUBLISHED",
      processed: true,
      type: { in: ["basic-info", "course-matching"] },
    };

    if (country) {
      where.location = {
        contains: country,
      };
    }

    const submissions = await prisma.formSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit * 2, // Get more to filter
    });

    // Group by university and process
    const exchanges = new Map();

    submissions.forEach((sub) => {
      const data = sub.data as any;
      const uni = data.hostUniversity;

      if (!uni) return;
      if (university && !uni.toLowerCase().includes(university.toLowerCase()))
        return;
      if (
        department &&
        data.hostDepartment &&
        !data.hostDepartment.toLowerCase().includes(department.toLowerCase())
      )
        return;

      if (!exchanges.has(uni)) {
        exchanges.set(uni, {
          university: uni,
          city: data.hostCity,
          country: data.hostCountry,
          students: 0,
          departments: new Set(),
          experiences: [],
        });
      }

      const exchange = exchanges.get(uni);
      exchange.students++;
      if (data.hostDepartment) {
        exchange.departments.add(data.hostDepartment);
      }
      exchange.experiences.push({
        id: sub.id,
        title: sub.title,
        author:
          `${sub.user?.firstName || ""} ${sub.user?.lastName || ""}`.trim() ||
          "Anonymous",
        createdAt: sub.createdAt,
        excerpt: data.advice?.substring(0, 150) || "",
      });
    });

    return Array.from(exchanges.values())
      .map((ex) => ({
        ...ex,
        departments: Array.from(ex.departments),
        experiences: ex.experiences.slice(0, 3), // Latest 3 experiences
      }))
      .slice(0, limit);
  }

  /**
   * Search across all content types
   */
  static async searchContent(
    query: string,
    options: {
      type?: "destinations" | "accommodations" | "exchanges" | "all";
      limit?: number;
    } = {},
  ) {
    const { type = "all", limit = 20 } = options;
    const results: any[] = [];

    const searchTerms = query.toLowerCase().split(" ");

    if (type === "destinations" || type === "all") {
      const destinations = await this.getPublishedDestinations({ limit: 100 });
      const filteredDestinations = destinations.filter((dest) =>
        searchTerms.some(
          (term) =>
            dest.name.toLowerCase().includes(term) ||
            dest.city.toLowerCase().includes(term) ||
            dest.country.toLowerCase().includes(term) ||
            dest.description?.toLowerCase().includes(term),
        ),
      );

      results.push(
        ...filteredDestinations.map((dest) => ({
          ...dest,
          type: "destination",
          relevance: this.calculateRelevance(
            query,
            `${dest.name} ${dest.description}`,
          ),
        })),
      );
    }

    if (type === "accommodations" || type === "all") {
      const accommodations = await this.getAccommodationExperiences({
        limit: 50,
      });
      const filteredAccommodations = accommodations.filter((acc) =>
        searchTerms.some(
          (term) =>
            acc.title.toLowerCase().includes(term) ||
            acc.location?.toLowerCase().includes(term) ||
            acc.type?.toLowerCase().includes(term) ||
            acc.description?.toLowerCase().includes(term),
        ),
      );

      results.push(
        ...filteredAccommodations.map((acc) => ({
          ...acc,
          type: "accommodation",
          relevance: this.calculateRelevance(
            query,
            `${acc.title} ${acc.description}`,
          ),
        })),
      );
    }

    if (type === "exchanges" || type === "all") {
      const exchanges = await this.getUniversityExchanges({ limit: 50 });
      const filteredExchanges = exchanges.filter((ex) =>
        searchTerms.some(
          (term) =>
            ex.university.toLowerCase().includes(term) ||
            ex.city?.toLowerCase().includes(term) ||
            ex.country?.toLowerCase().includes(term) ||
            ex.departments.some((dept: string) =>
              dept.toLowerCase().includes(term),
            ),
        ),
      );

      results.push(
        ...filteredExchanges.map((ex) => ({
          ...ex,
          type: "exchange",
          relevance: this.calculateRelevance(
            query,
            `${ex.university} ${ex.departments.join(" ")}`,
          ),
        })),
      );
    }

    // Sort by relevance and limit
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  }

  /**
   * Calculate search relevance score
   */
  private static calculateRelevance(query: string, content: string): number {
    const queryTerms = query.toLowerCase().split(" ");
    const contentLower = content.toLowerCase();

    let score = 0;
    queryTerms.forEach((term) => {
      if (contentLower.includes(term)) {
        // Exact match gets higher score
        if (contentLower.includes(query.toLowerCase())) {
          score += 10;
        } else {
          score += 5;
        }

        // Bonus for title/beginning matches
        if (contentLower.startsWith(term)) {
          score += 3;
        }
      }
    });

    return score;
  }

  /**
   * Get analytics data for content performance
   */
  static async getContentAnalytics(
    contentId: string,
    contentType: string,
  ): Promise<ContentAnalytics> {
    // This would integrate with your analytics service (Google Analytics, custom tracking, etc.)
    // For now, return mock data structure
    return {
      pageViews: 0,
      uniqueVisitors: 0,
      averageTimeOnPage: 0,
      bounceRate: 0,
      topReferrers: [],
      searchQueries: [],
      popularContent: [],
    };
  }

  /**
   * Track content interaction
   */
  static async trackContentInteraction(
    contentId: string,
    contentType: string,
    action: string,
    userId?: string,
  ) {
    // Implementation would depend on your analytics setup
    // Could use Google Analytics, Mixpanel, custom database tracking, etc.
    console.log(
      `Tracking: ${action} on ${contentType} ${contentId} by user ${userId || "anonymous"}`,
    );
  }
}
