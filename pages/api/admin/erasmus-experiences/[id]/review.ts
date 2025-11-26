import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Admin Review API Endpoint
 * POST /api/admin/erasmus-experiences/[id]/review
 *
 * Actions:
 * - APPROVED: Approve submission, trigger stats calculation
 * - REJECTED: Reject submission with feedback
 * - REVISION_REQUESTED: Request revisions from student (max 1 revision)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: (session.user as any).id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Forbidden: Admin access required" });
    }

    const { id } = req.query;
    const { action, feedback } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Experience ID required" });
    }

    if (
      !action ||
      !["APPROVED", "REJECTED", "REVISION_REQUESTED"].includes(action)
    ) {
      return res.status(400).json({
        error:
          "Valid action required: APPROVED, REJECTED, or REVISION_REQUESTED",
      });
    }

    // Fetch the experience
    const experience = await prisma.erasmusExperience.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    // Check if already reviewed
    if (experience.status === "APPROVED") {
      return res.status(400).json({ error: "Experience already approved" });
    }

    // Check revision limit
    if (action === "REVISION_REQUESTED" && experience.revisionCount >= 1) {
      return res.status(400).json({
        error: "Maximum revision limit reached. Please approve or reject.",
      });
    }

    // Prepare update data
    const updateData: any = {
      reviewedAt: new Date(),
      reviewedBy: (session.user as any).id,
      reviewFeedback: feedback || null,
    };

    let newStatus = experience.status;

    switch (action) {
      case "APPROVED":
        newStatus = "APPROVED";
        updateData.status = "APPROVED";
        break;

      case "REJECTED":
        newStatus = "REJECTED";
        updateData.status = "REJECTED";
        if (!feedback) {
          return res.status(400).json({
            error: "Feedback required for rejection",
          });
        }
        break;

      case "REVISION_REQUESTED":
        newStatus = "REVISION_NEEDED";
        updateData.status = "REVISION_NEEDED";
        updateData.revisionCount = experience.revisionCount + 1;
        if (!feedback) {
          return res.status(400).json({
            error: "Feedback required for revision request",
          });
        }
        break;
    }

    // Update experience in a transaction
    const [updatedExperience, reviewAction] = await prisma.$transaction([
      // Update experience
      prisma.erasmusExperience.update({
        where: { id },
        data: updateData,
      }),

      // Create review action audit log
      prisma.reviewAction.create({
        data: {
          experienceId: id,
          adminId: (session.user as any).id,
          action: action as "APPROVED" | "REJECTED" | "REVISION_REQUESTED",
          feedback: feedback || null,
        },
      }),
    ]);

    // If approved and has required data, trigger stats calculation
    if (
      action === "APPROVED" &&
      experience.hostCity &&
      experience.hostCountry &&
      experience.semester
    ) {
      try {
        // Trigger stats calculation asynchronously
        calculateCityStats(
          experience.hostCity,
          experience.hostCountry,
          experience.semester,
        );
      } catch (error) {
        console.error("Error triggering stats calculation:", error);
        // Don't fail the request if stats calculation fails
      }
    }

    return res.status(200).json({
      success: true,
      experience: updatedExperience,
      reviewAction,
      message: getSuccessMessage(action),
    });
  } catch (error) {
    console.error("Error reviewing experience:", error);
    return res.status(500).json({
      error: "Failed to review experience",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Calculate statistics for a city/country/semester combination
 * This runs asynchronously and doesn't block the response
 */
async function calculateCityStats(
  city: string,
  country: string,
  semester: string,
) {
  try {
    // Get all APPROVED experiences for this city/country/semester
    const experiences = await prisma.erasmusExperience.findMany({
      where: {
        hostCity: city,
        hostCountry: country,
        semester: semester,
        status: "APPROVED",
      },
    });

    // Need minimum 5 submissions for statistics
    if (experiences.length < 5) {
      console.log(
        `Not enough data for ${city}, ${country} (${semester}): ${experiences.length} submissions`,
      );
      return;
    }

    // Extract accommodation costs
    const accommodationCosts: number[] = [];
    experiences.forEach((exp) => {
      const accommodation = exp.accommodation as any;
      if (
        accommodation?.monthlyRent &&
        !isNaN(parseFloat(accommodation.monthlyRent))
      ) {
        accommodationCosts.push(parseFloat(accommodation.monthlyRent));
      }
    });

    // Extract living expenses
    const groceriesCosts: number[] = [];
    const transportationCosts: number[] = [];
    const eatingOutCosts: number[] = [];
    const socialLifeCosts: number[] = [];

    experiences.forEach((exp) => {
      const expenses = (exp.livingExpenses as any)?.expenses;
      if (expenses) {
        if (expenses.groceries && !isNaN(parseFloat(expenses.groceries))) {
          groceriesCosts.push(parseFloat(expenses.groceries));
        }
        if (
          expenses.transportation &&
          !isNaN(parseFloat(expenses.transportation))
        ) {
          transportationCosts.push(parseFloat(expenses.transportation));
        }
        if (expenses.eatingOut && !isNaN(parseFloat(expenses.eatingOut))) {
          eatingOutCosts.push(parseFloat(expenses.eatingOut));
        }
        if (expenses.socialLife && !isNaN(parseFloat(expenses.socialLife))) {
          socialLifeCosts.push(parseFloat(expenses.socialLife));
        }
      }
    });

    // Calculate statistics with outlier removal
    const rentStats = calculateStats(accommodationCosts);
    const groceriesStats = calculateStats(groceriesCosts);
    const transportStats = calculateStats(transportationCosts);
    const eatingOutStats = calculateStats(eatingOutCosts);
    const socialStats = calculateStats(socialLifeCosts);

    // Upsert city statistics
    await prisma.cityStatistics.upsert({
      where: {
        city_country_semester: {
          city,
          country,
          semester,
        },
      },
      update: {
        totalSubmissions: experiences.length,
        avgRent: rentStats.avg,
        minRent: rentStats.min,
        maxRent: rentStats.max,
        avgGroceries: groceriesStats.avg,
        avgTransportation: transportStats.avg,
        avgEatingOut: eatingOutStats.avg,
        avgSocialLife: socialStats.avg,
        lastCalculated: new Date(),
      },
      create: {
        city,
        country,
        semester,
        totalSubmissions: experiences.length,
        avgRent: rentStats.avg,
        minRent: rentStats.min,
        maxRent: rentStats.max,
        avgGroceries: groceriesStats.avg,
        avgTransportation: transportStats.avg,
        avgEatingOut: eatingOutStats.avg,
        avgSocialLife: socialStats.avg,
      },
    });

    console.log(
      `✅ Stats calculated for ${city}, ${country} (${semester}): ${experiences.length} submissions`,
    );
  } catch (error) {
    console.error("Error calculating city stats:", error);
    throw error;
  }
}

/**
 * Calculate statistics with outlier removal (remove top/bottom 5%)
 */
function calculateStats(values: number[]): {
  avg: number | null;
  min: number | null;
  max: number | null;
} {
  if (values.length === 0) {
    return { avg: null, min: null, max: null };
  }

  if (values.length < 10) {
    // For small datasets, don't remove outliers
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      avg: Math.round(avg * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  // Sort values
  const sorted = [...values].sort((a, b) => a - b);

  // Remove top and bottom 5%
  const removeCount = Math.floor(sorted.length * 0.05);
  const filtered = sorted.slice(removeCount, sorted.length - removeCount);

  const avg = filtered.reduce((a, b) => a + b, 0) / filtered.length;

  return {
    avg: Math.round(avg * 100) / 100,
    min: Math.min(...filtered),
    max: Math.max(...filtered),
  };
}

/**
 * Get success message based on action
 */
function getSuccessMessage(action: string): string {
  switch (action) {
    case "APPROVED":
      return "Experience approved successfully! Statistics have been updated.";
    case "REJECTED":
      return "Experience rejected. Student has been notified.";
    case "REVISION_REQUESTED":
      return "Revision requested. Student can resubmit after making changes.";
    default:
      return "Review completed successfully.";
  }
}
