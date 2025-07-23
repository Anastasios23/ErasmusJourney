import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  type: "accommodation" | "platform" | "tip" | "location";
  relevanceScore: number;
  data: any;
  reason: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userUniversity, hostCountry, hostCity, hostUniversity, budget } =
      req.query;

    const recommendations: SmartRecommendation[] = [];

    // 1. Similar student recommendations
    if (userUniversity && hostCity) {
      try {
        const similarStudents = await prisma.formSubmission.findMany({
          where: {
            type: "ACCOMMODATION",
            status: "PUBLISHED",
            data: {
              path: "universityInCyprus",
              equals: userUniversity,
            },
          },
          take: 5,
        });

        similarStudents.forEach((submission, index) => {
          const data = submission.data as any;
          if (data.city === hostCity) {
            recommendations.push({
              id: `similar-${submission.id}`,
              title: `${data.accommodationType} in ${data.neighborhood || data.city}`,
              description: `${data.studentName} from ${userUniversity} stayed here`,
              type: "accommodation",
              relevanceScore: 95 - index * 5,
              data: data,
              reason: `Students from ${userUniversity} also chose this accommodation`,
            });
          }
        });
      } catch (error) {
        console.error("Error fetching similar students:", error);
      }
    }

    // 2. Budget-based recommendations
    if (budget && hostCity) {
      const budgetNum = parseInt(budget.toString());
      const budgetRange = {
        low: budgetNum * 0.8,
        high: budgetNum * 1.2,
      };

      try {
        const budgetAccommodations = await prisma.formSubmission.findMany({
          where: {
            type: "ACCOMMODATION",
            status: "PUBLISHED",
            data: {
              path: "city",
              equals: hostCity,
            },
          },
          take: 10,
        });

        budgetAccommodations.forEach((submission, index) => {
          const data = submission.data as any;
          const rent = data.monthlyRent;

          if (rent >= budgetRange.low && rent <= budgetRange.high) {
            recommendations.push({
              id: `budget-${submission.id}`,
              title: `€${rent}/month ${data.accommodationType}`,
              description: `Perfect match for your €${budget} budget`,
              type: "accommodation",
              relevanceScore: 85 - index * 3,
              data: data,
              reason: `Within your budget of €${budget}/month`,
            });
          }
        });
      } catch (error) {
        console.error("Error fetching budget accommodations:", error);
      }
    }

    // 3. Location-based tips
    if (hostCity && hostCountry) {
      const locationTips = [
        {
          id: "transport-tip",
          title: `Transportation in ${hostCity}`,
          description: "Get a student discount card for public transport",
          type: "tip" as const,
          relevanceScore: 75,
          data: {
            tip: `Most cities offer student discounts on public transport. Look for student transport cards in ${hostCity}.`,
            category: "transport",
          },
          reason: `Essential tip for living in ${hostCity}`,
        },
        {
          id: "neighborhoods-tip",
          title: `Best neighborhoods in ${hostCity}`,
          description: "Popular areas among international students",
          type: "tip" as const,
          relevanceScore: 70,
          data: {
            tip: `Research student-friendly neighborhoods with good transport links to ${hostUniversity || "your university"}.`,
            category: "location",
          },
          reason: `Location advice for ${hostCity}`,
        },
      ];

      recommendations.push(...locationTips);
    }

    // 4. Platform recommendations based on country
    if (hostCountry) {
      const platformRecommendations = [
        {
          id: "uniplaces-rec",
          title: "Uniplaces - Student Housing",
          description: "Specialized platform for international students",
          type: "platform" as const,
          relevanceScore: 80,
          data: {
            url: "https://uniplaces.com",
            features: [
              "Student verified",
              "No deposit needed",
              "All bills included options",
            ],
          },
          reason: `Popular platform for students in ${hostCountry}`,
        },
        {
          id: "housing-anywhere-rec",
          title: "HousingAnywhere",
          description: "Secure booking for international students",
          type: "platform" as const,
          relevanceScore: 75,
          data: {
            url: "https://housinganywhere.com",
            features: [
              "Secure booking",
              "No deposit",
              "Multi-language support",
            ],
          },
          reason: `Trusted by students moving to ${hostCountry}`,
        },
      ];

      recommendations.push(...platformRecommendations);
    }

    // 5. University-specific recommendations
    if (hostUniversity) {
      recommendations.push({
        id: "university-housing",
        title: `${hostUniversity} Official Housing`,
        description: "Check university dormitories and official housing",
        type: "tip" as const,
        relevanceScore: 90,
        data: {
          tip: `Contact ${hostUniversity} housing office early. University housing often fills up quickly.`,
          category: "university",
        },
        reason: `Official housing at your destination university`,
      });
    }

    // Sort by relevance score and limit results
    const sortedRecommendations = recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);

    res.status(200).json({
      recommendations: sortedRecommendations,
      total: sortedRecommendations.length,
      metadata: {
        userUniversity,
        hostCountry,
        hostCity,
        hostUniversity,
        budget,
      },
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
