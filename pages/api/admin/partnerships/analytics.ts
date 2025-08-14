import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      const { timeRange = "12m", university, country } = req.query;

      // Calculate date range
      const now = new Date();
      const monthsBack =
        timeRange === "6m"
          ? 6
          : timeRange === "12m"
            ? 12
            : timeRange === "24m"
              ? 24
              : 12;
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - monthsBack,
        1,
      );

      // Build where clause for filtering
      let whereClause: any = {
        submittedAt: {
          gte: startDate,
        },
      };

      if (university) {
        whereClause.basicInfo = {
          path: ["hostUniversity"],
          string_contains: university as string,
        };
      }

      if (country) {
        whereClause.basicInfo = {
          ...whereClause.basicInfo,
          path: ["hostCountry"],
          string_contains: country as string,
        };
      }

      // Get all completed Erasmus experiences for partnership analysis
      const experiences = await prisma.erasmusExperience.findMany({
        where: {
          status: "COMPLETED",
          submittedAt: {
            gte: startDate,
          },
        },
        include: {
          user: {
            select: {
              firstName: true,
              homeCountry: true,
            },
          },
        },
      });

      // Process partnership data
      const partnerships = new Map();
      const monthlyTrends = new Map();
      const countryAnalytics = new Map();
      const universityRankings = new Map();

      experiences.forEach((exp) => {
        if (!exp.basicInfo || !exp.experience) return;

        const basicInfo = exp.basicInfo as any;
        const experienceData = exp.experience as any;

        const hostUniversity = basicInfo.hostUniversity;
        const hostCountry = basicInfo.hostCountry;
        const hostCity = basicInfo.hostCity;
        const homeCountry = exp.user?.homeCountry || "Unknown";

        if (!hostUniversity || !hostCountry) return;

        // Partnership key
        const partnershipKey = `${homeCountry}→${hostUniversity}, ${hostCity}, ${hostCountry}`;

        if (!partnerships.has(partnershipKey)) {
          partnerships.set(partnershipKey, {
            homeCountry,
            hostUniversity,
            hostCountry,
            hostCity,
            submissions: 0,
            ratings: [],
            costs: [],
            accommodationRatings: [],
            academicRatings: [],
            submissionDates: [],
          });
        }

        const partnership = partnerships.get(partnershipKey);
        partnership.submissions++;
        partnership.submissionDates.push(exp.submittedAt);

        // Extract ratings and costs
        if (experienceData.overallRating) {
          partnership.ratings.push(experienceData.overallRating);
        }

        if (experienceData.monthlyBudget) {
          partnership.costs.push(experienceData.monthlyBudget);
        }

        // Accommodation data
        if (exp.accommodation) {
          const accomData = exp.accommodation as any;
          if (accomData.satisfactionRating) {
            partnership.accommodationRatings.push(accomData.satisfactionRating);
          }
        }

        // Academic ratings
        if (exp.courses) {
          const coursesData = exp.courses as any;
          if (coursesData.overallSatisfaction) {
            partnership.academicRatings.push(coursesData.overallSatisfaction);
          }
        }

        // Monthly trends
        const monthKey = exp.submittedAt?.toISOString().slice(0, 7);
        if (monthKey) {
          monthlyTrends.set(monthKey, (monthlyTrends.get(monthKey) || 0) + 1);
        }

        // Country analytics
        if (!countryAnalytics.has(hostCountry)) {
          countryAnalytics.set(hostCountry, {
            country: hostCountry,
            submissions: 0,
            universities: new Set(),
            cities: new Set(),
            avgRating: 0,
            totalRatings: [],
          });
        }

        const countryData = countryAnalytics.get(hostCountry);
        countryData.submissions++;
        countryData.universities.add(hostUniversity);
        countryData.cities.add(hostCity);
        if (experienceData.overallRating) {
          countryData.totalRatings.push(experienceData.overallRating);
        }

        // University rankings
        if (!universityRankings.has(hostUniversity)) {
          universityRankings.set(hostUniversity, {
            university: hostUniversity,
            country: hostCountry,
            city: hostCity,
            submissions: 0,
            ratings: [],
            costs: [],
          });
        }

        const uniData = universityRankings.get(hostUniversity);
        uniData.submissions++;
        if (experienceData.overallRating) {
          uniData.ratings.push(experienceData.overallRating);
        }
        if (experienceData.monthlyBudget) {
          uniData.costs.push(experienceData.monthlyBudget);
        }
      });

      // Calculate analytics
      const partnershipAnalytics = Array.from(partnerships.values()).map(
        (p) => ({
          ...p,
          averageRating:
            p.ratings.length > 0
              ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length
              : null,
          averageCost:
            p.costs.length > 0
              ? p.costs.reduce((a, b) => a + b, 0) / p.costs.length
              : null,
          averageAccommodationRating:
            p.accommodationRatings.length > 0
              ? p.accommodationRatings.reduce((a, b) => a + b, 0) /
                p.accommodationRatings.length
              : null,
          averageAcademicRating:
            p.academicRatings.length > 0
              ? p.academicRatings.reduce((a, b) => a + b, 0) /
                p.academicRatings.length
              : null,
          lastSubmission:
            p.submissionDates.length > 0
              ? new Date(Math.max(...p.submissionDates.map((d) => d.getTime())))
              : null,
          growthTrend: calculateGrowthTrend(p.submissionDates, monthsBack),
        }),
      );

      const countryAnalyticsArray = Array.from(countryAnalytics.values()).map(
        (c) => ({
          ...c,
          universities: c.universities.size,
          cities: c.cities.size,
          avgRating:
            c.totalRatings.length > 0
              ? c.totalRatings.reduce((a, b) => a + b, 0) /
                c.totalRatings.length
              : null,
        }),
      );

      const universityRankingsArray = Array.from(
        universityRankings.values(),
      ).map((u) => ({
        ...u,
        averageRating:
          u.ratings.length > 0
            ? u.ratings.reduce((a, b) => a + b, 0) / u.ratings.length
            : null,
        averageCost:
          u.costs.length > 0
            ? u.costs.reduce((a, b) => a + b, 0) / u.costs.length
            : null,
      }));

      // Sort by various metrics
      const topPartnerships = partnershipAnalytics
        .sort((a, b) => b.submissions - a.submissions)
        .slice(0, 10);

      const topUniversities = universityRankingsArray
        .sort((a, b) => b.submissions - a.submissions)
        .slice(0, 10);

      const topCountries = countryAnalyticsArray.sort(
        (a, b) => b.submissions - a.submissions,
      );

      // Calculate overall statistics
      const totalSubmissions = experiences.length;
      const uniqueUniversities = universityRankingsArray.length;
      const uniqueCountries = countryAnalyticsArray.length;
      const uniquePartnerships = partnershipAnalytics.length;

      const allRatings = partnershipAnalytics
        .filter((p) => p.averageRating !== null)
        .map((p) => p.averageRating);

      const globalAverageRating =
        allRatings.length > 0
          ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
          : null;

      const monthlyTrendsArray = Array.from(monthlyTrends.entries())
        .map(([month, count]) => ({ month, submissions: count }))
        .sort((a, b) => a.month.localeCompare(b.month));

      res.status(200).json({
        overview: {
          totalSubmissions,
          uniquePartnerships,
          uniqueUniversities,
          uniqueCountries,
          globalAverageRating,
          timeRange: `${monthsBack} months`,
        },
        partnerships: {
          all: partnershipAnalytics,
          top: topPartnerships,
        },
        universities: {
          all: universityRankingsArray,
          top: topUniversities,
        },
        countries: {
          all: countryAnalyticsArray,
          top: topCountries,
        },
        trends: {
          monthly: monthlyTrendsArray,
        },
      });
    } catch (error) {
      console.error("Error fetching partnership analytics:", error);
      res.status(500).json({ error: "Failed to fetch partnership analytics" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function calculateGrowthTrend(
  submissionDates: Date[],
  monthsBack: number,
): string {
  if (submissionDates.length < 2) return "insufficient_data";

  const now = new Date();
  const halfwayPoint = new Date(
    now.getFullYear(),
    now.getMonth() - Math.floor(monthsBack / 2),
    1,
  );

  const recentSubmissions = submissionDates.filter(
    (date) => date >= halfwayPoint,
  ).length;
  const olderSubmissions = submissionDates.filter(
    (date) => date < halfwayPoint,
  ).length;

  if (recentSubmissions > olderSubmissions * 1.2) return "growing";
  if (recentSubmissions < olderSubmissions * 0.8) return "declining";
  return "stable";
}
