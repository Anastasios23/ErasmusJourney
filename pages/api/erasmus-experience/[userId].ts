import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { updateCityStatistics } from "../../../src/services/statisticsService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { userId } = req.query;

  if (userId !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  switch (req.method) {
    case "GET":
      return handleGet(res, userId as string);
    case "PUT":
      return handlePut(req, res, userId as string);
    case "DELETE":
      return handleDelete(res, userId as string);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGet(res: NextApiResponse, userId: string) {
  try {
    const experience = await prisma.erasmusExperience.findUnique({
      where: { userId },
    });

    if (!experience) {
      return res.json({
        currentStep: 1,
        completedSteps: [],
        formData: {},
        status: "DRAFT",
        isComplete: false,
      });
    }

    return res.json({
      currentStep: experience.currentStep,
      completedSteps: JSON.parse(experience.completedSteps || "[]"),
      formData: {
        basicInfo: experience.basicInfo,
        courses: experience.courses,
        accommodation: experience.accommodation,
        livingExpenses: experience.livingExpenses,
        experience: experience.experience,
      },
      status: experience.status,
      isComplete: experience.isComplete,
      lastSavedAt: experience.lastSavedAt,
    });
  } catch (error) {
    console.error("Error fetching Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  try {
    const { formData, currentStep, completedSteps } = req.body;
    const completed: number[] = completedSteps || [];
    const step = currentStep || 1;
    const isComplete = completed.length >= 5;
    const status = isComplete
      ? "COMPLETED"
      : step > 1
        ? "IN_PROGRESS"
        : "DRAFT";

    const data: any = {
      currentStep: step,
      completedSteps: JSON.stringify(completed),
      isComplete,
      status,
      lastSavedAt: new Date(),
    };

    if (formData) {
      if (formData.basicInfo !== undefined) {
        data.basicInfo = formData.basicInfo;
        
        // Extract top-level fields for efficient querying
        if (formData.basicInfo.homeUniversityId) data.homeUniversityId = formData.basicInfo.homeUniversityId;
        if (formData.basicInfo.hostUniversityId) data.hostUniversityId = formData.basicInfo.hostUniversityId;
        if (formData.basicInfo.hostCity) data.hostCity = formData.basicInfo.hostCity;
        if (formData.basicInfo.hostCountry) data.hostCountry = formData.basicInfo.hostCountry;
        if (formData.basicInfo.exchangePeriod) data.semester = formData.basicInfo.exchangePeriod;
      }
      if (formData.courses !== undefined) data.courses = formData.courses;
      if (formData.accommodation !== undefined)
        data.accommodation = formData.accommodation;
      if (formData.livingExpenses !== undefined)
        data.livingExpenses = formData.livingExpenses;
      if (formData.experience !== undefined) data.experience = formData.experience;
    }

    // Use a transaction to handle the update and potential aggregation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the main experience record
      const experience = await tx.erasmusExperience.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
      });

      // 2. If the form is complete, perform data aggregation
      if (isComplete) {
        // A. Aggregate Course Mappings
        if (experience.courses && experience.hostUniversityId) {
          const coursesData = experience.courses as any;
          const mappings = coursesData.mappings || [];

          // Delete existing mappings for this experience to avoid duplicates/stale data
          await tx.courseMapping.deleteMany({
            where: { experienceId: experience.id },
          });

          // Create new mappings
          if (mappings.length > 0) {
            await tx.courseMapping.createMany({
              data: mappings.map((m: any) => ({
                experienceId: experience.id,
                universityId: experience.hostUniversityId!, // Host University
                homeCourseCode: m.homeCode || null,
                homeCourseName: m.homeName,
                homeCredits: parseFloat(m.homeEcts) || 0,
                hostCourseCode: m.hostCode || null,
                hostCourseName: m.hostName,
                hostCredits: parseFloat(m.hostEcts) || 0,
                status: "APPROVED", // Auto-approve for now, or set to PENDING if moderation is needed
              })),
            });
          }
        }

        // B. Aggregate Accommodation Review
        if (experience.accommodation) {
          const accomData = experience.accommodation as any;
          
          // Delete existing review for this experience
          await tx.accommodationReview.deleteMany({
            where: { experienceId: experience.id },
          });

          // Create new review
          if (accomData.type && accomData.rent) {
             await tx.accommodationReview.create({
              data: {
                experienceId: experience.id,
                name: accomData.address || `${accomData.type} in ${experience.hostCity || 'City'}`,
                type: accomData.type,
                address: accomData.address || null,
                pricePerMonth: parseFloat(accomData.rent) || 0,
                currency: accomData.currency || "EUR",
                rating: parseInt(accomData.rating) || 0,
                comment: accomData.review || null,
                // Optional: Map other fields if schema supports them
              },
            });
          }
        }
      }

      return experience;
    });

    // 3. Update City Statistics (Fire and forget)
    if (isComplete && result.hostCity && result.hostCountry) {
      updateCityStatistics(result.hostCity, result.hostCountry).catch(err => 
        console.error("Failed to update city stats:", err)
      );
    }

    return res.json({
      currentStep: result.currentStep,
      completedSteps: JSON.parse(result.completedSteps),
      status: result.status,
      isComplete: result.isComplete,
      lastSavedAt: result.lastSavedAt,
    });
  } catch (error) {
    console.error("Error saving Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleDelete(res: NextApiResponse, userId: string) {
  try {
    await prisma.erasmusExperience.deleteMany({
      where: { userId },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
