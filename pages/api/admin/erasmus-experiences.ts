import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is admin (you might want to adjust this check)
  if (!session?.user?.email?.includes("admin")) {
    return res.status(403).json({ error: "Admin access required" });
  }

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
    const { status = "COMPLETED" } = req.query;

    // Fetch submitted experiences that are ready for admin review
    const experiences = await prisma.erasmusExperience.findMany({
      where: {
        status: status as string,
        isComplete: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    // Transform data for admin interface compatibility
    const transformedExperiences = experiences.map((experience) => {
      const basicInfo = experience.basicInfo as any;
      const courses = experience.courses as any;
      const accommodation = experience.accommodation as any;
      const livingExpenses = experience.livingExpenses as any;

      return {
        id: experience.id,
        userId: experience.userId,
        type: "consolidated",
        status: experience.status,
        createdAt: experience.createdAt,
        updatedAt: experience.updatedAt,
        submittedAt: experience.submittedAt,
        user: experience.user,
        adminApproved: experience.adminApproved,
        isPublic: experience.isPublic,
        data: {
          // Basic Information
          firstName: basicInfo?.firstName,
          lastName: basicInfo?.lastName,
          email: basicInfo?.email,
          university: basicInfo?.universityInCyprus,
          hostUniversity: basicInfo?.hostUniversity,
          hostCity: basicInfo?.hostCity,
          hostCountry: basicInfo?.hostCountry,
          hostDepartment: basicInfo?.hostDepartment,
          levelOfStudy: basicInfo?.levelOfStudy,
          exchangePeriod: basicInfo?.exchangePeriod,
          exchangeStartDate: basicInfo?.exchangeStartDate,
          exchangeEndDate: basicInfo?.exchangeEndDate,

          // Course Information
          courses: courses?.hostCourses || [],
          equivalentCourses: courses?.equivalentCourses || [],

          // Accommodation
          accommodationAddress: accommodation?.accommodationAddress,
          accommodationType: accommodation?.accommodationType,
          monthlyRent: accommodation?.monthlyRent,
          billsIncluded: accommodation?.billsIncluded,
          accommodationRating: accommodation?.accommodationRating,
          wouldRecommend: accommodation?.wouldRecommend,

          // Living Expenses
          expenses: livingExpenses?.expenses || {},

          // Complete data objects for detailed view
          basicInfoData: basicInfo,
          coursesData: courses,
          accommodationData: accommodation,
          livingExpensesData: livingExpenses,

          // Metadata
          submissionMeta: {
            completedSteps: JSON.parse(experience.completedSteps || "[]")
              .length,
            isComplete: experience.isComplete,
            currentStep: experience.currentStep,
            submittedAt: experience.submittedAt,
            lastSavedAt: experience.lastSavedAt,
          },
        },
      };
    });

    return res.json(transformedExperiences);
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
