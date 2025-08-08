import { NextApiRequest, NextApiResponse } from "next";
import { ERASMUS_DESTINATIONS } from "../../../src/data/destinations";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid destination ID" });
  }

  try {
    // First, try to get dynamically generated destination from form submissions
    // This matches the logic from the main destinations API

    // Get all basic info submissions to build dynamic destinations
    let basicInfoSubmissions = [];
    try {
      basicInfoSubmissions = await prisma.formSubmission.findMany({
        where: {
          status: "APPROVED",
          type: "basic-info", // Using standardized lowercase form type
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      });
    } catch (submissionError) {
      console.error("Error fetching basic info submissions:", submissionError);
    }

    // Build destination map from submissions (same logic as main API)
    const destinationMap = new Map();

    for (const submission of basicInfoSubmissions) {
      const data = submission.data as any;
      const hostCity = data.hostCity;
      const hostCountry = data.hostCountry;

      if (!hostCity || !hostCountry) continue;

      const key = `${hostCity}-${hostCountry}`;
      const destinationId = key.toLowerCase().replace(/\s+/g, "-");

      if (!destinationMap.has(key)) {
        destinationMap.set(key, {
          id: destinationId,
          city: hostCity,
          country: hostCountry,
          universities: new Set(),
          studentCount: 0,
          experiences: [],
          accommodationCount: 0,
          avgRent: 0,
          avgLivingExpenses: 0,
          avgAccommodationRating: 0,
          expenseSubmissionCount: 0,
        });
      }

      const destination = destinationMap.get(key);
      destination.universities.add(data.hostUniversity);
      destination.studentCount++;

      const userName =
        submission.user?.firstName && submission.user?.lastName
          ? `${submission.user.firstName} ${submission.user.lastName}`
          : "Anonymous Student";

      destination.experiences.push({
        studentName: userName,
        university: data.hostUniversity,
        submissionId: submission.id,
      });
    }

    // Check if this ID matches a dynamically generated destination
    const dynamicDestination = Array.from(destinationMap.values()).find(
      (dest: any) => dest.id === id,
    );

    if (dynamicDestination) {
      // Fetch all related submissions for this destination
      let allSubmissions = [];
      try {
        allSubmissions = await prisma.formSubmission.findMany({
          where: {
            status: "APPROVED",
          },
        });
      } catch (submissionsError) {
        console.error("Error fetching submissions:", submissionsError);
      }

      // Filter submissions by destination city
      const experienceSubmissions = allSubmissions.filter((submission) => {
        const data = submission.data as any;
        return (
          submission.type === "erasmus-experience" &&
          data.hostCity === dynamicDestination.city
        );
      });

      const accommodationSubmissions = allSubmissions.filter((submission) => {
        const data = submission.data as any;
        return (
          submission.type === "accommodation" &&
          data.hostCity === dynamicDestination.city
        );
      });

      // Calculate enhanced stats from all submissions
      let totalRating = 0;
      let ratingCount = 0;
      let highlights = new Set<string>();
      let recommendations = [];
      let totalRent = 0;
      let rentCount = 0;
      let totalFood = 0;
      let foodCount = 0;
      let totalTransport = 0;
      let transportCount = 0;
      let totalEntertainment = 0;
      let entertainmentCount = 0;

      // Process experience submissions
      experienceSubmissions.forEach((submission) => {
        const data = submission.data as any;

        // Collect ratings
        if (data.overallRating) {
          totalRating += parseFloat(data.overallRating);
          ratingCount++;
        }

        // Collect highlights
        if (data.highlights && Array.isArray(data.highlights)) {
          data.highlights.forEach((highlight) => highlights.add(highlight));
        }

        // Collect recommendations
        if (data.recommendations) {
          recommendations.push(data.recommendations);
        }
      });

      // Process accommodation submissions
      accommodationSubmissions.forEach((submission) => {
        const data = submission.data as any;

        // Collect rent costs
        if (data.monthlyRent) {
          totalRent += parseFloat(data.monthlyRent);
          rentCount++;
        }

        // Collect other expenses
        if (data.foodExpenses) {
          totalFood += parseFloat(data.foodExpenses);
          foodCount++;
        }

        if (data.transportExpenses) {
          totalTransport += parseFloat(data.transportExpenses);
          transportCount++;
        }

        if (data.entertainmentExpenses) {
          totalEntertainment += parseFloat(data.entertainmentExpenses);
          entertainmentCount++;
        }
      });

      // Calculate averages
      const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
      const avgRent =
        rentCount > 0 ? totalRent / rentCount : dynamicDestination.avgRent || 0;
      const avgFood = foodCount > 0 ? totalFood / foodCount : 0;
      const avgTransport =
        transportCount > 0 ? totalTransport / transportCount : 0;
      const avgEntertainment =
        entertainmentCount > 0 ? totalEntertainment / entertainmentCount : 0;

      const totalMonthlyCost =
        avgRent + avgFood + avgTransport + avgEntertainment;

      const getCostLevel = (cost: number) => {
        if (cost < 600) return "low";
        if (cost < 1000) return "medium";
        return "high";
      };

      const result = {
        ...dynamicDestination,
        universities: Array.from(dynamicDestination.universities),
        imageUrl: `/images/destinations/${dynamicDestination.city.toLowerCase().replace(/\s+/g, "-")}.svg`,
        description:
          experienceSubmissions.length > 0 &&
          experienceSubmissions[0].data.experienceDescription
            ? (experienceSubmissions[0].data as any).experienceDescription
            : `Experience ${dynamicDestination.city} through the eyes of ${dynamicDestination.studentCount} Erasmus student${dynamicDestination.studentCount !== 1 ? "s" : ""}. A wonderful destination for your Erasmus exchange experience.`,
        costOfLiving: getCostLevel(totalMonthlyCost),
        averageRent: avgRent,
        rating: avgRating > 0 ? Math.round(avgRating * 10) / 10 : 4,
        avgCostPerMonth: totalMonthlyCost,
        popularUniversities: Array.from(dynamicDestination.universities),
        popularWith: Array.from(dynamicDestination.universities), // Map to expected field name
        partnerUniversities: Array.from(dynamicDestination.universities),
        university:
          Array.from(dynamicDestination.universities)[0] ||
          "Partner University",
        universityShort: "PU",
        language: "English/Local",
        highlights:
          highlights.size > 0
            ? Array.from(highlights)
            : ["European Culture", "Student Life", "Academic Excellence"],
        recommendations: recommendations.length > 0 ? recommendations : [],
        cityInfo: {
          population: "Information not available",
          language: "Local language",
          currency: "EUR",
          climate: "European climate",
          topAttractions: [],
          practicalInfo: {
            englishFriendly: "Moderate",
            safetyRating: "Good",
          },
        },
        dataInsights: {
          hasAccommodationData: accommodationSubmissions.length > 0,
          hasExpenseData: accommodationSubmissions.length > 0,
          avgRent: avgRent,
          avgFood: avgFood,
          avgTransport: avgTransport,
          avgEntertainment: avgEntertainment,
          avgLivingExpenses: avgFood + avgTransport + avgEntertainment,
          accommodationRating: avgRating,
          totalSubmissions:
            experienceSubmissions.length + accommodationSubmissions.length,
        },
        expenseBreakdown: {
          rent: {
            average: avgRent,
            count: rentCount,
          },
          food: {
            average: avgFood,
            count: foodCount,
          },
          transport: {
            average: avgTransport,
            count: transportCount,
          },
          entertainment: {
            average: avgEntertainment,
            count: entertainmentCount,
          },
          total: totalMonthlyCost,
        },
        userStories: experienceSubmissions.map((submission) => {
          const data = submission.data as any;
          return {
            id: submission.id,
            studentName: data.studentName || "Anonymous Student",
            universityInCyprus: data.universityInCyprus || "University",
            hostUniversity: data.hostUniversity || "Host University",
            experienceDescription: data.experienceDescription || "",
            overallRating: data.overallRating || 4,
            wouldRecommend: data.wouldRecommend || true,
            highlights: data.highlights || [],
            recommendations: data.recommendations || "",
            createdAt: submission.createdAt,
          };
        }),
        userAccommodationTips: accommodationSubmissions.map((submission) => {
          const data = submission.data as any;
          return {
            id: submission.id,
            accommodationType: data.accommodationType || "Student Apartment",
            monthlyRent: data.monthlyRent || 0,
            accommodationRating: data.accommodationRating || 4,
            accommodationTips: data.accommodationTips || "",
            createdAt: submission.createdAt,
          };
        }),
        userCourseMatches: [],
        userReviews: experienceSubmissions.map((submission) => {
          const data = submission.data as any;
          return {
            id: submission.id,
            studentName: data.studentName || "Anonymous",
            rating: data.overallRating || 4,
            comment: data.experienceDescription || "",
            date: submission.createdAt,
          };
        }),
      };

      return res.status(200).json(result);
    }

    // If no dynamic destination found, check database and static destinations
    let baseDestination = null;

    try {
      const dbDestination = await prisma.destination.findFirst({
        where: {
          OR: [{ id: id }, { name: { contains: id } }],
        },
      });

      if (dbDestination) {
        // Parse highlights field which may contain enhanced data
        let parsedHighlights: any = {};
        try {
          if (dbDestination.highlights) {
            try {
              parsedHighlights = JSON.parse(dbDestination.highlights);
            } catch {
              parsedHighlights = { highlights: dbDestination.highlights };
            }
          }
        } catch (error) {
          console.error("Error parsing highlights:", error);
          parsedHighlights = { highlights: dbDestination.highlights || "" };
        }

        baseDestination = {
          id: dbDestination.id,
          city: dbDestination.name.split(",")[0].trim(),
          country: dbDestination.country,
          university: "Partner University",
          universityShort: "PU",
          partnerUniversities: [],
          language: "English/Local",
          costOfLiving: "medium" as const,
          averageRent: (dbDestination.costOfLiving as any)?.averageRent || 500,
          popularWith: [],
          imageUrl: dbDestination.imageUrl || "/placeholder.svg",
          description: dbDestination.description || "",
          photos: parsedHighlights.photos || [],
          generalInfo: parsedHighlights.generalInfo || {},
          highlights: parsedHighlights.highlights || "",
        };
      }
    } catch (dbError) {
      console.error("Error checking database destinations:", dbError);
    }

    // Fall back to static data if no database destination found
    if (!baseDestination) {
      baseDestination = ERASMUS_DESTINATIONS.find((dest) => dest.id === id);
      if (!baseDestination) {
        return res.status(404).json({ message: "Destination not found" });
      }
    }

    // Fetch user-generated content related to this destination
    let userStories = [];
    let userAccommodationTips = [];
    let userCourseMatches = [];
    let userReviews = [];

    try {
      // Fetch form submissions related to this destination
      const submissions = await prisma.formSubmission.findMany({
        where: {
          status: "PUBLISHED",
        },
        orderBy: { createdAt: "desc" },
      });

      // Filter submissions by city
      const citySubmissions = submissions.filter((submission) => {
        const data = submission.data as any;
        return (
          data.hostCity?.toLowerCase() === baseDestination.city.toLowerCase()
        );
      });

      // Process different types of submissions
      citySubmissions.forEach((submission) => {
        const data = submission.data as any;

        if (submission.type === "EXPERIENCE") {
          userStories.push({
            id: submission.id,
            title: data.overallExperienceTitle || "Study Experience",
            content: data.overallExperienceContent || data.personalExperience,
            author: `${data.firstName || "Anonymous"} ${data.lastName || "Student"}`,
            rating: data.overallRating,
            createdAt: submission.createdAt,
          });
        }

        if (submission.type === "ACCOMMODATION") {
          userAccommodationTips.push({
            id: submission.id,
            type: data.accommodationType,
            address: data.accommodationAddress,
            rent: data.monthlyRent,
            rating: data.accommodationRating,
            tips: data.additionalNotes || data.recommendationReason,
            author: `${data.firstName || "Anonymous"} ${data.lastName || "Student"}`,
          });
        }

        if (submission.type === "COURSE_MATCHING") {
          userCourseMatches.push({
            id: submission.id,
            hostUniversity: data.hostUniversity,
            hostCourses: data.hostCourses || [],
            difficulty: data.courseMatchingDifficult,
            recommendation: data.recommendCourses,
            tips: data.courseMatchingChallenges,
            author: `${data.firstName || "Anonymous"} ${data.lastName || "Student"}`,
          });
        }
      });
    } catch (error) {
      console.error("Error fetching user-generated content:", error);
    }

    // Calculate living costs for the enriched destination
    let enrichedAvgRent = 0;
    let enrichedAvgFood = 0;
    let enrichedAvgTransport = 0;
    let enrichedAvgEntertainment = 0;
    let enrichedTotalCost = 0;

    // Try to get costs from submissions for this city
    try {
      const allCitySubmissions = await prisma.formSubmission.findMany({
        where: {
          status: "APPROVED",
        },
      });

      // Filter manually by city
      const citySubmissions = allCitySubmissions.filter((submission) => {
        const data = submission.data as any;
        return (
          data.city === baseDestination.city ||
          data.hostCity === baseDestination.city
        );
      });

      // Extract costs from submissions
      let rentTotal = 0,
        rentCount = 0;
      let foodTotal = 0,
        foodCount = 0;
      let transportTotal = 0,
        transportCount = 0;
      let entertainmentTotal = 0,
        entertainmentCount = 0;

      citySubmissions.forEach((submission) => {
        const data = submission.data as any;

        if (data.monthlyRent) {
          rentTotal += parseFloat(data.monthlyRent);
          rentCount++;
        }

        if (data.foodExpenses) {
          foodTotal += parseFloat(data.foodExpenses);
          foodCount++;
        }

        if (data.transportExpenses) {
          transportTotal += parseFloat(data.transportExpenses);
          transportCount++;
        }

        if (data.entertainmentExpenses) {
          entertainmentTotal += parseFloat(data.entertainmentExpenses);
          entertainmentCount++;
        }
      });

      enrichedAvgRent = rentCount > 0 ? rentTotal / rentCount : 500;
      enrichedAvgFood = foodCount > 0 ? foodTotal / foodCount : 250;
      enrichedAvgTransport =
        transportCount > 0 ? transportTotal / transportCount : 50;
      enrichedAvgEntertainment =
        entertainmentCount > 0 ? entertainmentTotal / entertainmentCount : 100;
      enrichedTotalCost =
        enrichedAvgRent +
        enrichedAvgFood +
        enrichedAvgTransport +
        enrichedAvgEntertainment;
    } catch (error) {
      console.error("Error calculating costs for enriched destination:", error);
      enrichedAvgRent = 500;
      enrichedAvgFood = 250;
      enrichedAvgTransport = 50;
      enrichedAvgEntertainment = 100;
      enrichedTotalCost = 900;
    }

    // Build the enriched destination response
    const enrichedDestination = {
      ...baseDestination,
      userStories,
      userAccommodationTips,
      userCourseMatches,
      userReviews,
      detailedInfo: {
        population: 1000000,
        currency: "EUR",
        climate: "Temperate continental climate",
        timezone: "Central European Time (CET)",
      },
      livingCosts: {
        accommodation: {
          min: Math.max(enrichedAvgRent * 0.8, enrichedAvgRent - 100),
          max: enrichedAvgRent * 1.2,
          avg: enrichedAvgRent,
        },
        food: {
          min: Math.max(enrichedAvgFood * 0.8, enrichedAvgFood - 50),
          max: enrichedAvgFood * 1.2,
          avg: enrichedAvgFood,
        },
        transport: enrichedAvgTransport,
        entertainment: {
          min: Math.max(
            enrichedAvgEntertainment * 0.8,
            enrichedAvgEntertainment - 30,
          ),
          max: enrichedAvgEntertainment * 1.2,
          avg: enrichedAvgEntertainment,
        },
        total: {
          min: enrichedTotalCost * 0.9,
          max: enrichedTotalCost * 1.1,
          avg: enrichedTotalCost,
        },
      },
      transportation: {
        publicTransport: "Good public transport system",
        bikeRentals: true,
        walkability: 7,
        nearestAirport: `${baseDestination.city} Airport`,
      },
      attractions: [],
      studentLife: {
        nightlife: 7,
        culture: 8,
        sports: 6,
        internationalCommunity: 8,
      },
      practicalInfo: {
        visa: "EU citizens do not need a visa",
        healthcare: "European Health Insurance Card accepted",
        bankingTips: "Major banks available",
        simCard: "Prepaid SIM cards available",
      },
      gallery: [baseDestination.imageUrl || "/placeholder.svg"],
    };

    return res.status(200).json(enrichedDestination);
  } catch (error) {
    console.error("Error in destination detail API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
