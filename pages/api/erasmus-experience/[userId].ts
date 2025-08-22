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
      if (formData.basicInfo !== undefined) data.basicInfo = formData.basicInfo;
      if (formData.courses !== undefined) data.courses = formData.courses;
      if (formData.accommodation !== undefined)
        data.accommodation = formData.accommodation;
      if (formData.livingExpenses !== undefined)
        data.livingExpenses = formData.livingExpenses;
      if (formData.experience !== undefined) data.experience = formData.experience;
    }

    const experience = await prisma.erasmusExperience.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    return res.json({
      currentStep: experience.currentStep,
      completedSteps: JSON.parse(experience.completedSteps),
      status: experience.status,
      isComplete: experience.isComplete,
      lastSavedAt: experience.lastSavedAt,
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
