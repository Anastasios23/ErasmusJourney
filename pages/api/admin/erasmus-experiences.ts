import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const session = await getServerSession(req, res, authOptions);

  // Check if user is admin (you might want to adjust this check)
  // if (!session?.user?.email?.includes("admin")) {
  //   return res.status(403).json({ error: "Admin access required" });
  // }

  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "PUT":
      return handlePut(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status } = req.query;

    // Build where clause
    const where: any = {
      isComplete: true,
    };

    // Filter by status if provided
    if (status && typeof status === "string") {
      where.status = status;
    }

    // Fetch experiences
    const experiences = await prisma.erasmus_experiences.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        hostUniversity: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
        homeUniversity: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return res.json(experiences);
  } catch (error) {
    console.error("Error fetching erasmus experiences:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { experienceId, action, adminNotes } = req.body;

    if (!experienceId || !action) {
      return res
        .status(400)
        .json({ error: "experienceId and action are required" });
    }

    let updateData: any = {
      adminNotes: adminNotes || undefined,
    };

    switch (action) {
      case "approve":
        updateData.adminApproved = true;
        updateData.isPublic = true;
        updateData.status = "PUBLISHED";
        updateData.publishedAt = new Date();
        break;
      case "reject":
        updateData.adminApproved = false;
        updateData.isPublic = false;
        updateData.status = "COMPLETED"; // Keep as completed but not approved
        break;
      case "unpublish":
        updateData.isPublic = false;
        updateData.status = "COMPLETED";
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    const updatedExperience = await prisma.erasmusExperience.update({
      where: { id: experienceId },
      data: updateData,
    });

    return res.json({
      success: true,
      experience: updatedExperience,
      message: `Experience ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Error updating erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
