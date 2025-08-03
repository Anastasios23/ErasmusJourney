import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getCityInfo } from "../../../src/data/cityInfo";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("Starting destinations API...");

    // Get all basic info submissions
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
      console.log(`Found ${basicInfoSubmissions.length} basic info submissions`);
    } catch (submissionError) {
      console.error("Error fetching basic info submissions:", submissionError);
      basicInfoSubmissions = []; // Continue with empty array
    }

    // Get accommodation data for cost information
    let accommodationSubmissions = [];
    try {
      accommodationSubmissions = await prisma.formSubmission.findMany({
        where: {
          status: "SUBMITTED",
          type: "ACCOMMODATION",
        },
      });
      console.log(`Found ${accommodationSubmissions.length} accommodation submissions`);
    } catch (accommodationError) {
      console.error("Error fetching accommodation submissions:", accommodationError);
      accommodationSubmissions = [];
    }

    // Get living expenses data
    let expenseSubmissions = [];
    try {
      expenseSubmissions = await prisma.formSubmission.findMany({
        where: {
          status: "SUBMITTED",
          type: "LIVING_EXPENSES",
        },
      });
      console.log(`Found ${expenseSubmissions.length} expense submissions`);
    } catch (expenseError) {
      console.error("Error fetching expense submissions:", expenseError);
      expenseSubmissions = [];
    }

    // Get custom destination overrides
    let customDestinations = [];
    const customDestinationMap = new Map();
    try {
      customDestinations = await prisma.customDestination.findMany();
      customDestinations.forEach((custom) => {
        customDestinationMap.set(custom.destinationId, custom.data);
      });
      console.log(`Found ${customDestinations.length} custom destinations`);
    } catch (customError) {
      console.error("Error fetching custom destinations:", customError);
      // Continue without custom destinations
    }

    // Get published destinations from admin panel
    let publishedDestinations = [];
    try {
      publishedDestinations = await prisma.destination.findMany({
        where: {
          featured: true, // Only get featured/published destinations
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      console.log(`Found ${publishedDestinations.length} published destinations`);
    } catch (publishedError) {
      console.error("Error fetching published destinations:", publishedError);
      publishedDestinations = [];
    }

    // Aggregate destinations data
    const destinationMap = new Map();

    basicInfoSubmissions.forEach((submission) => {
      const { hostCity, hostCountry, hostUniversity } = submission.data as {
        hostCity: string;
        hostCountry: string;
        hostUniversity: string;
      };
      const key = `${hostCity}-${hostCountry}`;

      if (!destinationMap.has(key)) {
        destinationMap.set(key, {
          id: key.toLowerCase().replace(/\s+/g, "-"),
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
          commonBiggestExpenses: {},
        });
      }

      const destination = destinationMap.get(key);
      destination.universities.add(hostUniversity);
      destination.studentCount++;
      destination.experiences.push({
        studentName: `${submission.user.firstName} ${submission.user.lastName}`,
        university: hostUniversity,
        submissionId: submission.id,
      });
    });

    // Add accommodation data
    accommodationSubmissions.forEach((submission) => {
      const { city, country, monthlyRent, accommodationRating } =
        submission.data as {
          city?: string;
          country?: string;
          monthlyRent?: string;
          accommodationRating?: string;
        };

      // Use city/country from accommodation if available, otherwise find from basicInfo
      let destCity = city;
      let destCountry = country;

      if (!destCity || !destCountry) {
        const basicInfo = basicInfoSubmissions.find(
          (b) => b.userId === submission.userId,
        );
        if (basicInfo) {
          const basicData = basicInfo.data as {
            hostCity: string;
            hostCountry: string;
          };
          destCity = destCity || basicData.hostCity;
          destCountry = destCountry || basicData.hostCountry;
        }
      }

      if (destCity && destCountry) {
        const key = `${destCity}-${destCountry}`;
        const destination = destinationMap.get(key);

        if (destination && monthlyRent) {
          const rent = parseFloat(monthlyRent);
          if (!isNaN(rent)) {
            destination.accommodationCount++;
            destination.avgRent =
              destination.accommodationCount === 1
                ? rent
                : (destination.avgRent * (destination.accommodationCount - 1) +
                    rent) /
                  destination.accommodationCount;

            // Add accommodation rating
            if (accommodationRating) {
              const rating = parseFloat(accommodationRating);
              if (!isNaN(rating)) {
                destination.avgAccommodationRating =
                  destination.avgAccommodationRating || 0;
                destination.avgAccommodationRating =
                  (destination.avgAccommodationRating + rating) /
                  destination.accommodationCount;
              }
            }
          }
        }
      }
    });

    // Add living expenses data
    expenseSubmissions.forEach((submission) => {
      const basicInfo = basicInfoSubmissions.find(
        (b) => b.userId === submission.userId,
      );
      if (basicInfo) {
        const { hostCity, hostCountry } = basicInfo.data as {
          hostCity: string;
          hostCountry: string;
        };
        const key = `${hostCity}-${hostCountry}`;
        const destination = destinationMap.get(key);

        const expenseData = submission.data as {
          expenses?: Record<string, string>;
          monthlyIncomeAmount?: string;
          biggestExpense?: string;
        };

        if (destination && expenseData.expenses) {
          const totalExpenses = Object.values(expenseData.expenses).reduce(
            (sum: number, expense) => {
              return sum + (parseFloat(expense as string) || 0);
            },
            0,
          );

          destination.expenseSubmissionCount =
            (destination.expenseSubmissionCount || 0) + 1;
          destination.avgLivingExpenses =
            destination.expenseSubmissionCount === 1
              ? totalExpenses
              : (destination.avgLivingExpenses *
                  (destination.expenseSubmissionCount - 1) +
                  totalExpenses) /
                destination.expenseSubmissionCount;

          // Track biggest expenses for insights
          if (expenseData.biggestExpense) {
            destination.commonBiggestExpenses =
              destination.commonBiggestExpenses || {};
            destination.commonBiggestExpenses[expenseData.biggestExpense] =
              (destination.commonBiggestExpenses[expenseData.biggestExpense] ||
                0) + 1;
          }
        }
      }
    });

    // Convert to array and format for frontend
    const destinations = Array.from(destinationMap.values())
      .filter((dest) => dest.city && dest.country) // Filter out invalid destinations
      .map((dest) => {
        const totalMonthlyCost = Math.round(
          dest.avgRent + dest.avgLivingExpenses,
        );
        const mostCommonExpense = dest.commonBiggestExpenses
          ? Object.entries(dest.commonBiggestExpenses).sort(
              ([, a], [, b]) => (b as number) - (a as number),
            )[0]?.[0]
          : undefined;

        // Get general city information
        const cityInfo = getCityInfo(dest.city);

        // Create base destination object
        const baseDestination = {
          ...dest,
          universities: Array.from(dest.universities),
          image: `/images/destinations/${dest.city
            .toLowerCase()
            .replace(/\s+/g, "-")}.svg`,
          description: `Experience ${dest.city} through the eyes of ${dest.studentCount} Erasmus student${dest.studentCount !== 1 ? "s" : ""}. ${getDestinationDescription(dest.city)}`,
          costLevel: getCostLevel(totalMonthlyCost),
          rating:
            dest.avgAccommodationRating > 0
              ? Math.round(dest.avgAccommodationRating * 10) / 10
              : Math.round((4.2 + Math.random() * 0.6) * 10) / 10, // Fallback rating
          avgCostPerMonth: totalMonthlyCost || Math.round(dest.avgRent),
          popularUniversities: Array.from(dest.universities).slice(0, 3),
          highlights: getDestinationHighlights(dest.city),
          // General city information
          cityInfo: cityInfo || {
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
          // Additional insights from real data
          dataInsights: {
            hasAccommodationData: dest.accommodationCount > 0,
            hasExpenseData: dest.expenseSubmissionCount > 0,
            mostCommonBiggestExpense: mostCommonExpense,
            avgRent: Math.round(dest.avgRent),
            avgLivingExpenses: Math.round(dest.avgLivingExpenses),
            accommodationRating:
              dest.avgAccommodationRating > 0
                ? Math.round(dest.avgAccommodationRating * 10) / 10
                : null,
          },
        };

        // Check if there's a custom override for this destination
        const customData = customDestinationMap.get(baseDestination.id);
        if (customData) {
          // Merge custom data with base data
          return { ...baseDestination, ...customData };
        }

        return baseDestination;
      });

    // Add published destinations from admin panel
    const publishedDestinationsFormatted = await Promise.all(
      publishedDestinations.map(async (dest) => {
        // Extract city from name (format: "City, Country")
        const [city, country] = dest.name.split(",").map((s) => s.trim());

        // Get form submissions for this city to calculate student count and rating
        const citySubmissions = basicInfoSubmissions.filter((sub) => {
          const data = sub.data as any;
          return data.hostCity?.toLowerCase() === city?.toLowerCase();
        });

        // Get accommodation and expense data for cost calculation
        const cityAccommodations = accommodationSubmissions.filter((sub) => {
          const data = sub.data as any;
          return data.city?.toLowerCase() === city?.toLowerCase();
        });

        const cityExpenses = expenseSubmissions.filter((sub) => {
          const data = sub.data as any;
          return data.city?.toLowerCase() === city?.toLowerCase();
        });

        // Calculate average costs
        const avgRent =
          cityAccommodations.length > 0
            ? cityAccommodations.reduce((sum, sub) => {
                const rent = parseFloat((sub.data as any).monthlyRent || "0");
                return sum + (isNaN(rent) ? 0 : rent);
              }, 0) / cityAccommodations.length
            : 500; // Default value

        const avgExpenses =
          cityExpenses.length > 0
            ? cityExpenses.reduce((sum, sub) => {
                const expenses = parseFloat(
                  (sub.data as any).totalMonthlyBudget || "0",
                );
                return sum + (isNaN(expenses) ? 0 : expenses);
              }, 0) / cityExpenses.length
            : 300; // Default value

        const totalMonthlyCost = Math.round(avgRent + avgExpenses);

        // Calculate average rating from form submissions
        const ratings = citySubmissions
          .map((sub) => (sub.data as any)?.overallRating)
          .filter((rating) => rating !== undefined && rating !== null);

        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 4.2; // Default rating

        return {
          id: dest.id,
          city: city || dest.name,
          country: country || dest.country,
          universities: [], // Will be populated from submissions if available
          studentCount: citySubmissions.length,
          experiences: [],
          accommodationCount: cityAccommodations.length,
          avgRent,
          avgLivingExpenses: avgExpenses,
          avgAccommodationRating: avgRating,
          expenseSubmissionCount: cityExpenses.length,
          commonBiggestExpenses: {},
          image:
            dest.imageUrl ||
            `/images/destinations/${city?.toLowerCase().replace(/\s+/g, "-")}.svg`,
          description:
            dest.description || getDestinationDescription(city || dest.name),
          costLevel: getCostLevel(totalMonthlyCost),
          rating: Math.round(avgRating * 10) / 10,
          avgCostPerMonth: totalMonthlyCost,
          popularUniversities: citySubmissions
            .slice(0, 3)
            .map((sub) => (sub.data as any).hostUniversity)
            .filter(Boolean),
          highlights: dest.highlights
            ? dest.highlights.split(",").map((h) => h.trim())
            : getDestinationHighlights(city || dest.name),
          cityInfo: getCityInfo(city || dest.name) || {
            population: "Information not available",
            language: "Local language",
            currency: "EUR",
            climate: dest.climate || "European climate",
            topAttractions: [],
            practicalInfo: {},
          },
          isAdminDestination: true, // Flag to identify admin-created destinations
        };
      }),
    );

    // Combine form-based destinations with admin-published destinations
    // Remove duplicates by city name (admin destinations take precedence)
    const allDestinations = [...destinations];

    publishedDestinationsFormatted.forEach((adminDest) => {
      const existingIndex = allDestinations.findIndex(
        (dest) =>
          dest.city?.toLowerCase() === adminDest.city?.toLowerCase() &&
          dest.country?.toLowerCase() === adminDest.country?.toLowerCase(),
      );

      if (existingIndex >= 0) {
        // Replace existing with admin version (admin takes precedence)
        allDestinations[existingIndex] = adminDest;
      } else {
        // Add new admin destination
        allDestinations.push(adminDest);
      }
    });

    res.status(200).json({ destinations: allDestinations });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Helper function to determine cost level based on total monthly expenses
function getCostLevel(totalCost: number): string {
  if (totalCost < 600) return "low";
  if (totalCost < 1000) return "medium";
  return "high";
}

// Helper function to get destination-specific descriptions
function getDestinationDescription(city: string): string {
  const descriptions: Record<string, string> = {
    Berlin:
      "Discover the vibrant culture, rich history, and dynamic student life in Germany's capital.",
    Barcelona:
      "Enjoy Mediterranean lifestyle, stunning architecture, and world-class universities in Catalonia.",
    Prague:
      "Explore one of Europe's most beautiful cities with affordable living and excellent academics.",
    Amsterdam:
      "Experience the unique Dutch culture, international environment, and innovative education.",
    Vienna:
      "Immerse yourself in classical culture, high quality of life, and prestigious institutions.",
    Lyon: "Study in France's gastronomic capital with excellent universities and beautiful architecture.",
  };
  return (
    descriptions[city] ||
    `A wonderful destination for your Erasmus exchange experience.`
  );
}

// Helper function to get destination-specific highlights
function getDestinationHighlights(city: string): string[] {
  const highlights: Record<string, string[]> = {
    Berlin: ["Rich History", "Vibrant Nightlife", "Tech Hub"],
    Barcelona: ["Mediterranean Coast", "Gaudí Architecture", "Beach Life"],
    Prague: ["Affordable Living", "Beautiful Architecture", "Central Europe"],
    Amsterdam: ["Canal Views", "Bike Culture", "International"],
    Vienna: ["Classical Music", "Coffee Culture", "High Quality of Life"],
    Lyon: ["French Cuisine", "UNESCO Heritage", "Student-Friendly"],
  };
  return (
    highlights[city] || [
      "European Culture",
      "Student Life",
      "Academic Excellence",
    ]
  );
}
