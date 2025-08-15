import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all existing destinations from Destination table
    const destinations = await prisma.destination.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Get aggregated data from form submissions
    const submissionData = await prisma.formSubmission.findMany({
      where: {
        status: "PUBLISHED",
        type: {
          in: [
            "basic-info",
            "accommodation",
            "living-expenses",
            "help-future-students",
          ],
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Group submissions by location
    const locationGroups: Record<string, any[]> = {};
    submissionData.forEach((submission) => {
      if (submission.type === "basic-info" && submission.data) {
        const data = submission.data as any;
        const location = `${data.hostCity}, ${data.hostCountry}`;
        if (!locationGroups[location]) {
          locationGroups[location] = [];
        }
        locationGroups[location].push(submission);
      }
    });

    // Create aggregated destination data
    const aggregatedDestinations = Object.entries(locationGroups).map(
      ([location, submissions]) => {
        const [city, country] = location.split(", ");

        // Calculate statistics
        const submissionCount = submissions.length;
        const ratings = submissions
          .filter((s) => s.data?.ratings)
          .map((s) => s.data.ratings)
          .filter(Boolean);

        const averageRating =
          ratings.length > 0
            ? ratings.reduce(
                (sum, rating) => sum + (rating.overallRating || 0),
                0,
              ) / ratings.length
            : null;

        const costs = submissions
          .filter((s) => s.data?.totalMonthlyBudget)
          .map((s) => s.data.totalMonthlyBudget)
          .filter(Boolean);

        const averageCost =
          costs.length > 0
            ? costs.reduce((sum, cost) => sum + cost, 0) / costs.length
            : null;

        return {
          id: `aggregated-${city}-${country}`
            .toLowerCase()
            .replace(/\s+/g, "-"),
          name: location,
          city,
          country,
          status: "aggregated",
          description: `Study destination based on ${submissionCount} student submissions`,
          submissionCount,
          averageRating,
          averageCost,
          source: "user_generated",
        };
      },
    );

    // Combine with manually created destinations
    const allDestinations = [
      ...destinations.map((dest) => ({
        ...dest,
        submissionCount: 0, // TODO: Calculate from linked submissions
        source: "admin_created",
      })),
      ...aggregatedDestinations,
    ];

    res.status(200).json({
      destinations: allDestinations,
      stats: {
        total: allDestinations.length,
        adminCreated: destinations.length,
        userGenerated: aggregatedDestinations.length,
      },
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, city, country, description, imageUrl, source, submissionId } =
      req.body;

    if (!name || !city || !country) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Name, city, and country are required",
      });
    }

    // Check if destination already exists
    const existingDestination = await prisma.destination.findFirst({
      where: {
        city: city,
        country: country,
      },
    });

    if (existingDestination) {
      return res.status(409).json({
        error: "Destination already exists",
        message: `A destination for ${city}, ${country} already exists`,
        existingDestination,
      });
    }

    // Create new destination
    const destination = await prisma.destination.create({
      data: {
        name,
        city,
        country,
        description: description || `Study destination in ${city}, ${country}`,
        imageUrl,
        status: "published",
        // Add additional fields as needed based on your schema
      },
    });

    // If this destination was created from a submission, we could link them
    if (submissionId) {
      // Update the submission to mark it as processed
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: {
          status: "PUBLISHED",
          data: {
            ...(typeof req.body.data === "object" ? req.body.data : {}),
            destinationId: destination.id,
          },
        },
      });
    }

    res.status(201).json({
      message: "Destination created successfully",
      destination,
    });
  } catch (error) {
    console.error("Error creating destination:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
