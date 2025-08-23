import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { ContentManagementService } from "../../../../src/services/contentManagementService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const session = await getServerSession(req, res, authOptions);

  // if (!session || session.user?.role !== "ADMIN") {
  //   return res.status(401).json({ error: "Unauthorized" });
  // }

  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    case "PUT":
      return handlePut(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { includeAggregations = "true" } = req.query;

    // Get all existing destinations with linked submissions
    const destinations = await prisma.destination.findMany({
      include: {
        linkedSubmissions: {
          include: {
            submission: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get unprocessed submissions that could create new destinations
    const unprocessedSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: "PUBLISHED",
        processed: false,
        type: "basic-info",
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

    // Group unprocessed submissions by location
    const locationGroups: Record<string, any[]> = {};
    unprocessedSubmissions.forEach((submission) => {
      if (submission.data) {
        const data = submission.data as any;
        if (data.hostCity && data.hostCountry) {
          const location = `${data.hostCity}, ${data.hostCountry}`;
          if (!locationGroups[location]) {
            locationGroups[location] = [];
          }
          locationGroups[location].push(submission);
        }
      }
    });

    // Create potential destination data from unprocessed submissions
    const potentialDestinations = Object.entries(locationGroups).map(
      ([location, submissions]) => {
        const [city, country] = location.split(", ");

        return {
          id: `potential-${city}-${country}`.toLowerCase().replace(/\s+/g, "-"),
          name: location,
          city,
          country,
          status: "potential",
          description: `Potential destination from ${submissions.length} unprocessed submissions`,
          submissionCount: submissions.length,
          source: "user_generated",
          submissions: submissions.map((s) => ({
            id: s.id,
            title: s.title,
            userId: s.userId,
            createdAt: s.createdAt,
            user: s.user,
          })),
        };
      },
    );

    // Format existing destinations with enhanced data
    const formattedDestinations = await Promise.all(
      destinations.map(async (dest) => {
        let aggregatedData = dest.aggregatedData;

        // Refresh aggregated data if requested and if stale
        if (includeAggregations === "true") {
          const isStale =
            dest.lastDataUpdate < new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
          if (isStale && dest.linkedSubmissions.length > 0) {
            try {
              const submissions = dest.linkedSubmissions.map(
                (link) => link.submission,
              );
              aggregatedData = JSON.parse(
                JSON.stringify(
                  await ContentManagementService.aggregateSubmissionData(
                    submissions,
                  ),
                ),
              );

              // Update in database
              await prisma.destination.update({
                where: { id: dest.id },
                data: {
                  aggregatedData,
                  lastDataUpdate: new Date(),
                },
              });
            } catch (error) {
              console.error("Error refreshing aggregated data:", error);
            }
          }
        }

        return {
          ...dest,
          submissionCount: dest.linkedSubmissions.length,
          lastUpdated: dest.lastDataUpdate,
          hasAggregatedData: !!aggregatedData,
          aggregatedData:
            includeAggregations === "true" ? aggregatedData : undefined,
          linkedSubmissionCount: dest.linkedSubmissions.length,
          linkedSubmissions: dest.linkedSubmissions.map((link) => ({
            id: link.id,
            contributionType: link.contributionType,
            weight: link.weight,
            submission: {
              id: link.submission.id,
              type: link.submission.type,
              title: link.submission.title,
              createdAt: link.submission.createdAt,
              user: link.submission.user,
            },
          })),
        };
      }),
    );

    res.status(200).json({
      destinations: formattedDestinations,
      potentialDestinations,
      stats: {
        total: formattedDestinations.length,
        potential: potentialDestinations.length,
        adminCreated: formattedDestinations.filter(
          (d) => d.source === "admin_created",
        ).length,
        userGenerated: formattedDestinations.filter(
          (d) => d.source === "user_generated",
        ).length,
        hybrid: formattedDestinations.filter((d) => d.source === "hybrid")
          .length,
        needsReview: formattedDestinations.filter(
          (d) => d.status === "under_review",
        ).length,
        published: formattedDestinations.filter((d) => d.status === "published")
          .length,
      },
    });
  } catch (error) {
    console.error("Error fetching enhanced destinations:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      action,
      city,
      country,
      name,
      description,
      imageUrl,
      adminOverrides = {},
      submissionIds = [],
    } = req.body;

    if (action === "create_from_submissions") {
      // Create destination from existing submissions
      if (!city || !country) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "City and country are required",
        });
      }

      try {
        const destination =
          await ContentManagementService.createDestinationFromSubmissions(
            city,
            country,
            {
              name,
              description,
              imageUrl,
              ...adminOverrides,
            },
          );

        return res.status(201).json({
          message: "Destination created successfully from submissions",
          destination,
        });
      } catch (error) {
        return res.status(400).json({
          error: "Failed to create destination",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (action === "create_manual") {
      // Create destination manually
      if (!name || !city || !country) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "Name, city, and country are required",
        });
      }

      // Check if destination already exists
      const existingDestination = await prisma.destination.findFirst({
        where: { city, country },
      });

      if (existingDestination) {
        return res.status(409).json({
          error: "Destination already exists",
          message: `A destination for ${city}, ${country} already exists`,
          existingDestination,
        });
      }

      const destination = await prisma.destination.create({
        data: {
          name,
          city,
          country,
          description:
            description || `Study destination in ${city}, ${country}`,
          imageUrl,
          status: "published",
          source: "admin_created",
          adminOverrides: adminOverrides,
        },
      });

      return res.status(201).json({
        message: "Destination created successfully",
        destination,
      });
    }

    return res.status(400).json({
      error: "Invalid action",
      message: "Action must be 'create_from_submissions' or 'create_manual'",
    });
  } catch (error) {
    console.error("Error creating destination:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { destinationId, adminOverrides, status, featured } = req.body;

    if (!destinationId) {
      return res.status(400).json({
        error: "Missing destination ID",
        message: "Destination ID is required for updates",
      });
    }

    const updateData: any = {};

    if (adminOverrides) {
      updateData.adminOverrides = adminOverrides;
    }

    if (status) {
      updateData.status = status;
    }

    if (featured !== undefined) {
      updateData.featured = featured;
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
    }

    const destination = await prisma.destination.update({
      where: { id: destinationId },
      data: updateData,
    });

    res.status(200).json({
      message: "Destination updated successfully",
      destination,
    });
  } catch (error) {
    console.error("Error updating destination:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
