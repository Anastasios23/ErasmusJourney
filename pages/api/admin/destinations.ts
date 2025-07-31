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

      // Check if destination already exists
      const existingDestination = await prisma.destination.findFirst({
        where: {
          name: destinationData.name,
          country: destinationData.country,
        },
      });

      let destination;
      if (existingDestination) {
        // Update existing destination
        destination = await prisma.destination.update({
          where: { id: existingDestination.id },
          data: {
            description: destinationData.description,
            ...(imageUrl && { imageUrl }),
            highlights: destinationData.highlights?.join(", "),
            costOfLiving: destinationData.costOfLiving,
            featured: true, // Auto-publish approved destinations
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new destination
        destination = await prisma.destination.create({
          data: {
            name: destinationData.name,
            country: destinationData.country,
            description: destinationData.description,
            imageUrl: imageUrl || null,
            highlights: destinationData.highlights?.join(", "),
            costOfLiving: destinationData.costOfLiving,
            featured: true, // Auto-publish approved destinations
          },
        });
      }

      return res.status(200).json(destination);
    } catch (error) {
      console.error("Error creating/updating destination:", error);
      return res.status(500).json({ error: "Failed to create destination" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
