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
          status: "SUBMITTED",
          type: "BASIC_INFO",
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
      // Build full destination data like the main API does
      const totalMonthlyCost =
        (dynamicDestination.avgRent || 0) +
        (dynamicDestination.avgLivingExpenses || 0);

      const getCostLevel = (cost: number) => {
        if (cost < 600) return "low";
        if (cost < 1000) return "medium";
        return "high";
      };

      const result = {
        ...dynamicDestination,
        universities: Array.from(dynamicDestination.universities),
        imageUrl: `/images/destinations/${dynamicDestination.city.toLowerCase().replace(/\s+/g, "-")}.svg`,
        description: `Experience ${dynamicDestination.city} through the eyes of ${dynamicDestination.studentCount} Erasmus student${dynamicDestination.studentCount !== 1 ? "s" : ""}. A wonderful destination for your Erasmus exchange experience.`,
        costOfLiving: getCostLevel(totalMonthlyCost),
        averageRent: dynamicDestination.avgRent || 0,
        rating:
          dynamicDestination.avgAccommodationRating > 0
            ? Math.round(dynamicDestination.avgAccommodationRating * 10) / 10
            : 4,
        avgCostPerMonth: totalMonthlyCost,
        popularUniversities: Array.from(dynamicDestination.universities),
        popularWith: Array.from(dynamicDestination.universities), // Map to expected field name
        partnerUniversities: Array.from(dynamicDestination.universities),
        university:
          Array.from(dynamicDestination.universities)[0] ||
          "Partner University",
        universityShort: "PU",
        language: "English/Local",
        highlights: ["European Culture", "Student Life", "Academic Excellence"],
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
          hasAccommodationData: dynamicDestination.accommodationCount > 0,
          hasExpenseData: dynamicDestination.expenseSubmissionCount > 0,
          avgRent: dynamicDestination.avgRent,
          avgLivingExpenses: dynamicDestination.avgLivingExpenses,
          accommodationRating: dynamicDestination.avgAccommodationRating,
        },
        userStories: [],
        userAccommodationTips: [],
        userCourseMatches: [],
        userReviews: [],
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
        accommodation: { min: 300, max: 600 },
        food: { min: 200, max: 400 },
        transport: 50,
        entertainment: { min: 100, max: 200 },
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
