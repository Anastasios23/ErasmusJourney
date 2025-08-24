import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userId = session.user.id;

    // Check if user already has a completed submission
    const existingExperience = await prisma.erasmusExperience.findUnique({
      where: { userId },
    });

    if (existingExperience && existingExperience.status === "COMPLETED") {
      return res.status(400).json({
        error: "You have already submitted your Erasmus experience",
      });
    }

    if (!existingExperience || !existingExperience.isComplete) {
      return res.status(400).json({
        error: "Please complete all form steps before submitting",
      });
    }

    // Validate that all required sections are present
    if (
      !existingExperience.basicInfo ||
      !existingExperience.courses ||
      !existingExperience.accommodation ||
      !existingExperience.livingExpenses
    ) {
      return res.status(400).json({
        error: "All form sections must be completed before submission",
      });
    }

    // Update experience to completed status
    const submittedExperience = await prisma.erasmusExperience.update({
      where: { userId },
      data: {
        status: "COMPLETED",
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create a single FormSubmission record for admin review (backwards compatibility)
    const consolidatedData = {
      basicInfo: existingExperience.basicInfo,
      courses: existingExperience.courses,
      accommodation: existingExperience.accommodation,
      livingExpenses: existingExperience.livingExpenses,
      experience: existingExperience.experience,
      submissionType: "consolidated",
      completedSteps: 4,
      totalSteps: 4,
    };

    const hostCity = (existingExperience.basicInfo as any)?.hostCity || null;
    const hostCountry =
      (existingExperience.basicInfo as any)?.hostCountry || null;

    await prisma.formSubmission.create({
      data: {
        userId,
        type: "consolidated",
        title: "Complete Erasmus Experience",
        data: consolidatedData,
        status: "SUBMITTED",
        hostCity,
        hostCountry,
      },
    });

    return res.json({
      success: true,
      submittedAt: submittedExperience.submittedAt,
      message: "Your Erasmus experience has been submitted successfully!",
    });
  } catch (error) {
    console.error("Error submitting Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
