import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

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
      return handleGet(req, res, userId as string);
    case "PUT":
      return handlePut(req, res, userId as string);
    case "DELETE":
      return handleDelete(req, res, userId as string);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  try {
    const experience = await prisma.erasmusExperience.findUnique({
      where: { userId },
    });

    if (!experience) {
      // Return default structure for new users
      return res.json({
        currentStep: 1,
        completedSteps: [],
        basicInfo: null,
        courses: null,
        accommodation: null,
        livingExpenses: null,
        experience: null,
        status: "DRAFT",
        isComplete: false,
        hasSubmitted: false,
      });
    }

    // Parse completedSteps JSON
    const completedSteps = JSON.parse(experience.completedSteps || "[]");

    return res.json({
      currentStep: experience.currentStep,
      completedSteps,
      basicInfo: experience.basicInfo,
      courses: experience.courses,
      accommodation: experience.accommodation,
      livingExpenses: experience.livingExpenses,
      experience: experience.experience,
      status: experience.status,
      isComplete: experience.isComplete,
      hasSubmitted: experience.status === "COMPLETED",
      lastSavedAt: experience.lastSavedAt,
      submittedAt: experience.submittedAt,
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
    const {
      currentStep,
      completedSteps,
      basicInfo,
      courses,
      accommodation,
      livingExpenses,
      experience,
    } = req.body;

    // Check if user has already submitted
    const existingExperience = await prisma.erasmusExperience.findUnique({
      where: { userId },
    });

    if (existingExperience && existingExperience.status === "COMPLETED") {
      return res.status(400).json({
        error: "Experience has already been submitted and cannot be modified",
      });
    }

    const isComplete = completedSteps?.length >= 4; // All 4 steps completed
    const status = isComplete ? "IN_PROGRESS" : "DRAFT"; // IN_PROGRESS means ready for final review/submit

    const data = {
      currentStep: currentStep || 1,
      completedSteps: JSON.stringify(completedSteps || []),
      isComplete,
      status,
      lastSavedAt: new Date(),
      basicInfo: basicInfo || undefined,
      courses: courses || undefined,
      accommodation: accommodation || undefined,
      livingExpenses: livingExpenses || undefined,
      experience: experience || undefined,
    };

    const erasmusExperience = await prisma.erasmusExperience.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });

    return res.json({
      success: true,
      experience: erasmusExperience,
      message: "Progress saved successfully",
    });
  } catch (error) {
    console.error("Error updating Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  try {
    // Check if user has already submitted
    const existingExperience = await prisma.erasmusExperience.findUnique({
      where: { userId },
    });

    if (existingExperience && existingExperience.status === "COMPLETED") {
      return res.status(400).json({
        error: "Submitted experience cannot be deleted",
      });
    }

    await prisma.erasmusExperience.delete({
      where: { userId },
    });

    return res.json({
      success: true,
      message: "Draft deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
