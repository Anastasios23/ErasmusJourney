import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if user is admin
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      // Fetch all destinations with aggregated data
      const destinations = await prisma.destination.findMany({
        orderBy: {
          updatedAt: "desc",
        },
      });

      // For each destination, calculate student count and average rating from form submissions
      const destinationsWithStats = await Promise.all(
        destinations.map(async (destination) => {
          const cityName = destination.name.split(",")[0].trim();

          // Get all approved submissions for this city
          const submissions = await prisma.formSubmission.findMany({
            where: {
              status: "APPROVED",
            },
          });

          // Filter submissions by city (since data is JSON, we need to filter in JS)
          const citySubmissions = submissions.filter((sub) => {
            const data = sub.data as any;
            return data.hostCity?.toLowerCase() === cityName.toLowerCase();
          });

          // Calculate average rating
          const ratings = citySubmissions
            .map((sub) => (sub.data as any)?.overallRating)
            .filter((rating) => rating !== undefined && rating !== null);

          const averageRating =
            ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) /
                ratings.length
              : 0;

          return {
            ...destination,
            studentCount: citySubmissions.length,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            status: destination.featured ? "PUBLISHED" : "DRAFT",
          };
        }),
      );

      return res.status(200).json(destinationsWithStats);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      return res.status(500).json({ error: "Failed to fetch destinations" });
    }
  }

  if (req.method === "POST") {
    try {
      const { destinationData, imageUrl } = req.body;

      if (!destinationData) {
        return res.status(400).json({ error: "Missing destination data" });
      }

      // Get all approved submissions for this city to calculate averages
      const cityName = destinationData.name.split(",")[0].trim();
      const approvedSubmissions = await prisma.formSubmission.findMany({
        where: {
          status: "APPROVED",
        },
      });

      // Filter submissions by city
      const citySubmissions = approvedSubmissions.filter((sub) => {
        const data = sub.data as any;
        return data.hostCity?.toLowerCase() === cityName.toLowerCase();
      });

      // Calculate averages from all submissions for this city
      let avgCostOfLiving = destinationData.costOfLiving;
      let avgRating = destinationData.averageRating || 0;

      if (citySubmissions.length > 0) {
        const costs = citySubmissions
          .map((sub) => sub.data as any)
          .filter(
            (data) =>
              data.monthlyRent ||
              data.foodExpenses ||
              data.transportExpenses ||
              data.totalMonthlyBudget,
          );

        const ratings = citySubmissions
          .map((sub) => (sub.data as any)?.overallRating)
          .filter((rating) => rating !== undefined && rating !== null);

        if (costs.length > 0) {
          avgCostOfLiving = {
            averageRent: Math.round(
              costs.reduce((sum, cost) => sum + (cost.monthlyRent || 0), 0) /
                costs.length,
            ),
            averageFood: Math.round(
              costs.reduce((sum, cost) => sum + (cost.foodExpenses || 0), 0) /
                costs.length,
            ),
            averageTransport: Math.round(
              costs.reduce(
                (sum, cost) => sum + (cost.transportExpenses || 0),
                0,
              ) / costs.length,
            ),
            averageTotal: Math.round(
              costs.reduce(
                (sum, cost) => sum + (cost.totalMonthlyBudget || 0),
                0,
              ) / costs.length,
            ),
          };
        }

        if (ratings.length > 0) {
          avgRating =
            Math.round(
              (ratings.reduce((sum, rating) => sum + rating, 0) /
                ratings.length) *
                10,
            ) / 10;
        }
      }

      // Check if destination already exists
      const existingDestination = await prisma.destination.findFirst({
        where: {
          name: destinationData.name,
          country: destinationData.country,
        },
      });

      let destination;
      if (existingDestination) {
        // Update existing destination with calculated averages
        destination = await prisma.destination.update({
          where: { id: existingDestination.id },
          data: {
            description: destinationData.description,
            ...(imageUrl && { imageUrl }),
            highlights: destinationData.highlights?.join(", "),
            costOfLiving: avgCostOfLiving,
            featured: true, // Auto-publish approved destinations
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new destination with calculated averages
        destination = await prisma.destination.create({
          data: {
            name: destinationData.name,
            country: destinationData.country,
            description: destinationData.description,
            imageUrl: imageUrl || null,
            highlights: destinationData.highlights?.join(", "),
            costOfLiving: avgCostOfLiving,
            featured: true, // Auto-publish approved destinations
          },
        });
      }

      console.log("✅ Destination created/updated with averages:", {
        name: destination.name,
        costOfLiving: avgCostOfLiving,
        avgRating,
        submissionsCount: citySubmissions.length,
      });

      return res.status(200).json({
        ...destination,
        averageRating: avgRating,
        studentCount: citySubmissions.length,
      });
    } catch (error) {
      console.error("Error creating/updating destination:", error);
      return res.status(500).json({ error: "Failed to create destination" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
