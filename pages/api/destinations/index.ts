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
    // Get all basic info submissions
    const basicInfoSubmissions = await prisma.formSubmission.findMany({
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
    if (basicInfoSubmissions.length > 0) {
      console.log("Sample submission:", basicInfoSubmissions[0]);
    }

    // Get accommodation data for cost information
    const accommodationSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: "SUBMITTED",
        type: "ACCOMMODATION",
      },
    });

    // Get living expenses data
    const expenseSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: "SUBMITTED",
        type: "LIVING_EXPENSES",
      },
    });

    // Get custom destination overrides
    const customDestinations = await prisma.customDestination.findMany();
    const customDestinationMap = new Map();
    customDestinations.forEach((custom) => {
      customDestinationMap.set(custom.destinationId, custom.data);
    });

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
    const destinations = Array.from(destinationMap.values()).map((dest) => {
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

    res.status(200).json({ destinations });
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
