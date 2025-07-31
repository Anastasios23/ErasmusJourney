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

      console.log("🔍 Received data:", {
        destinationData: JSON.stringify(destinationData, null, 2),
        imageUrl: imageUrl?.substring(0, 50) + "...",
      });

      if (!destinationData) {
        console.error("❌ Missing destination data");
        return res.status(400).json({ error: "Missing destination data" });
      }

      // Validate required fields
      if (!destinationData.name || !destinationData.country) {
        console.error("❌ Missing required fields:", {
          name: destinationData.name,
          country: destinationData.country,
        });
        return res
          .status(400)
          .json({ error: "Missing required fields: name and country" });
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
      let avgCostOfLiving = destinationData.costOfLiving || {
        averageRent: 0,
        averageFood: 0,
        averageTransport: 0,
        averageTotal: 0,
      };
      let avgRating = destinationData.averageRating || 0;

      console.log("🔢 Initial cost data:", avgCostOfLiving);

      if (citySubmissions.length > 0) {
        // Enhanced cost calculation from all submissions
        const allCostData = citySubmissions
          .map((sub) => sub.data as any)
          .filter(
            (data) =>
              data.monthlyRent ||
              data.foodExpenses ||
              data.transportExpenses ||
              data.totalMonthlyBudget,
          );

        const allRatings = citySubmissions
          .map((sub) => (sub.data as any)?.overallRating)
          .filter(
            (rating) => rating !== undefined && rating !== null && rating > 0,
          );

        console.log(
          `🔢 Found ${allCostData.length} cost submissions and ${allRatings.length} ratings for ${cityName}`,
        );

        if (allCostData.length > 0) {
          // Calculate more detailed averages
          const rentValues = allCostData
            .map((d) => d.monthlyRent || 0)
            .filter((v) => v > 0);
          const foodValues = allCostData
            .map((d) => d.foodExpenses || 0)
            .filter((v) => v > 0);
          const transportValues = allCostData
            .map((d) => d.transportExpenses || 0)
            .filter((v) => v > 0);
          const totalValues = allCostData
            .map((d) => d.totalMonthlyBudget || 0)
            .filter((v) => v > 0);

          avgCostOfLiving = {
            averageRent:
              rentValues.length > 0
                ? Math.round(
                    rentValues.reduce((sum, val) => sum + val, 0) /
                      rentValues.length,
                  )
                : 0,
            averageFood:
              foodValues.length > 0
                ? Math.round(
                    foodValues.reduce((sum, val) => sum + val, 0) /
                      foodValues.length,
                  )
                : 0,
            averageTransport:
              transportValues.length > 0
                ? Math.round(
                    transportValues.reduce((sum, val) => sum + val, 0) /
                      transportValues.length,
                  )
                : 0,
            averageTotal:
              totalValues.length > 0
                ? Math.round(
                    totalValues.reduce((sum, val) => sum + val, 0) /
                      totalValues.length,
                  )
                : 0,
            // Add metadata about the calculation
            studentCount: citySubmissions.length,
            dataPoints: {
              rent: rentValues.length,
              food: foodValues.length,
              transport: transportValues.length,
              total: totalValues.length,
            },
            lastUpdated: new Date().toISOString(),
          };

          console.log("📊 Calculated cost averages:", avgCostOfLiving);
        }

        if (allRatings.length > 0) {
          avgRating =
            Math.round(
              (allRatings.reduce((sum, rating) => sum + rating, 0) /
                allRatings.length) *
                10,
            ) / 10;
          console.log(
            `⭐ Calculated average rating: ${avgRating} from ${allRatings.length} ratings`,
          );
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
        // Smart update existing destination - merge data intelligently
        let existingHighlights: any = {};
        try {
          existingHighlights = existingDestination.highlights
            ? JSON.parse(existingDestination.highlights)
            : {};
        } catch {
          existingHighlights = {
            highlights: existingDestination.highlights || "",
            photos: [],
            generalInfo: {},
          };
        }

        const existingPhotos = existingHighlights.photos || [];
        const newPhotos = destinationData.photos || [];

        // Accumulate photos - ADD all new photos, ensuring no duplicates based on URL
        const mergedPhotos = [...existingPhotos];
        newPhotos.forEach((newPhoto: any) => {
          const exists = existingPhotos.some(
            (existing: any) => existing.url === newPhoto.url,
          );
          if (!exists) {
            // Add student information to photo for attribution
            mergedPhotos.push({
              ...newPhoto,
              addedBy: destinationData.studentName || "Student",
              addedDate: new Date().toISOString(),
            });
          }
        });

        console.log(
          `📸 Photo accumulation: ${existingPhotos.length} existing + ${newPhotos.filter((newPhoto: any) => !existingPhotos.some((existing: any) => existing.url === newPhoto.url)).length} new = ${mergedPhotos.length} total`,
        );

        const existingGeneralInfo = existingHighlights.generalInfo || {};
        const newGeneralInfo = destinationData.generalInfo || {};

        // Smart merge general info - keep existing if new is empty, update if new has content
        const mergedGeneralInfo = { ...existingGeneralInfo };
        Object.keys(newGeneralInfo).forEach((key) => {
          if (newGeneralInfo[key] && newGeneralInfo[key].trim()) {
            mergedGeneralInfo[key] = newGeneralInfo[key];
          }
        });

        console.log("🔄 Updating existing destination:", {
          id: existingDestination.id,
          name: destinationData.name,
          description: destinationData.description,
          costOfLiving: avgCostOfLiving,
        });

        destination = await prisma.destination.update({
          where: { id: existingDestination.id },
          data: {
            // Update description only if new one is provided and different
            ...(destinationData.description &&
              destinationData.description !==
                existingDestination.description && {
                description: destinationData.description,
              }),
            // Update image only if new one is provided
            ...(imageUrl &&
              imageUrl !== existingDestination.imageUrl && { imageUrl }),
            // Store all data in highlights field as JSON for now
            highlights: JSON.stringify({
              highlights: Array.isArray(destinationData.highlights)
                ? destinationData.highlights.join(", ")
                : destinationData.highlights ||
                  existingHighlights.highlights ||
                  "",
              photos: mergedPhotos,
              generalInfo: mergedGeneralInfo,
            }),
            costOfLiving: avgCostOfLiving,
            featured: true,
            updatedAt: new Date(),
          },
        });

        console.log("✅ Updated existing destination with smart merge:", {
          name: destination.name,
          photosCount: mergedPhotos.length,
          generalInfoKeys: Object.keys(mergedGeneralInfo),
          submissionsCount: citySubmissions.length,
        });
      } else {
        console.log("✨ Creating new destination:", {
          name: destinationData.name,
          country: destinationData.country,
          description: destinationData.description,
          costOfLiving: avgCostOfLiving,
        });

        // Create new destination
        destination = await prisma.destination.create({
          data: {
            name: destinationData.name,
            country: destinationData.country,
            description: destinationData.description,
            imageUrl: imageUrl || null,
            highlights: JSON.stringify({
              highlights: Array.isArray(destinationData.highlights)
                ? destinationData.highlights.join(", ")
                : destinationData.highlights || "",
              photos: destinationData.photos || [],
              generalInfo: destinationData.generalInfo || {},
            }),
            costOfLiving: avgCostOfLiving,
            featured: true,
          },
        });

        console.log("✅ Created new destination:", {
          name: destination.name,
          submissionsCount: citySubmissions.length,
        });
      }

      console.log("✅ Destination created/updated with comprehensive data:", {
        name: destination.name,
        costOfLiving: avgCostOfLiving,
        avgRating,
        submissionsCount: citySubmissions.length,
        photosCount: destination.highlights
          ? JSON.parse(destination.highlights).photos?.length || 0
          : 0,
      });

      return res.status(200).json({
        ...destination,
        averageRating: avgRating,
        studentCount: citySubmissions.length,
        // Parse and return the structured data for the frontend
        photos: destination.highlights
          ? JSON.parse(destination.highlights).photos || []
          : [],
        generalInfo: destination.highlights
          ? JSON.parse(destination.highlights).generalInfo || {}
          : {},
        costBreakdown: avgCostOfLiving,
      });
    } catch (error) {
      console.error("❌ Error creating/updating destination:", error);

      // More specific error handling
      if (error.code === "P2002") {
        console.error("Unique constraint violation:", error.meta);
        return res
          .status(400)
          .json({ error: "Destination already exists with this name" });
      }

      if (error.code === "P2025") {
        console.error("Record not found:", error.meta);
        return res.status(404).json({ error: "Record not found" });
      }

      // Log the full error for debugging
      console.error("Full error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta,
      });

      return res.status(500).json({
        error: "Failed to create destination",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
