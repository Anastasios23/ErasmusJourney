import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      case "PUT":
        return await handlePut(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT"]);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (id) {
    // Get specific experience
    const experience = await prisma.erasmusExperience.findUnique({
      where: { id: id as string },
    });

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    return res.status(200).json(experience);
  } else {
    // Get all experiences (for admin or debugging)
    const experiences = await prisma.erasmusExperience.findMany({
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json(experiences);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.body;

  if (action === "create") {
    // First, ensure we have a test user or create one
    let testUser = await prisma.user.findFirst({
      where: { email: "test@erasmus.local" },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: "test@erasmus.local",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        },
      });
    }

    // Check if this user already has an experience
    let existingExperience = await prisma.erasmusExperience.findUnique({
      where: { userId: testUser.id },
    });

    if (existingExperience) {
      // Reset the existing experience to draft state for testing
      existingExperience = await prisma.erasmusExperience.update({
        where: { id: existingExperience.id },
        data: {
          status: "DRAFT",
          isComplete: false,
          submittedAt: null,
          basicInfo: {},
          courses: [],
          accommodation: {},
          livingExpenses: {},
          experience: {},
          lastSavedAt: new Date(),
        },
      });
      return res.status(200).json(existingExperience);
    }

    // Create a new draft experience
    const newExperience = await prisma.erasmusExperience.create({
      data: {
        userId: testUser.id,
        status: "DRAFT",
        // Initialize empty data structures
        basicInfo: {},
        courses: [],
        accommodation: {},
        livingExpenses: {},
        experience: {},
      },
    });

    return res.status(201).json(newExperience);
  }

  return res.status(400).json({ error: "Invalid action" });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id, action, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Experience ID is required" });
  }

  // Find the existing experience
  const existingExperience = await prisma.erasmusExperience.findUnique({
    where: { id },
  });

  if (!existingExperience) {
    return res.status(404).json({ error: "Experience not found" });
  }

  if (action === "submit") {
    // Final submission - mark as submitted and populate all required fields
    const submissionData: any = {
      status: "SUBMITTED",
      submittedAt: new Date(),
      isComplete: true,
    };

    // Handle overallReflection -> experience mapping
    if (updateData.overallReflection) {
      const existingExperienceData =
        typeof existingExperience.experience === "object" &&
        existingExperience.experience !== null
          ? (existingExperience.experience as any)
          : {};
      submissionData.experience = {
        ...existingExperienceData,
        ...updateData.overallReflection,
      };
      delete updateData.overallReflection; // Remove it from updateData to avoid conflict
    }

    // Merge helpForStudents into experience.helpForStudents if present
    if (
      (updateData as any).experience?.helpForStudents ||
      (existingExperience as any).experience
    ) {
      const existingExp =
        typeof existingExperience.experience === "object" &&
        existingExperience.experience !== null
          ? (existingExperience.experience as any)
          : {};
      const incomingExp = (updateData as any).experience || {};
      submissionData.experience = {
        ...existingExp,
        ...incomingExp,
        helpForStudents: {
          ...(existingExp.helpForStudents || {}),
          ...(incomingExp.helpForStudents || {}),
        },
      };
    }

    // Include other fields except overallReflection
    Object.keys(updateData).forEach((key) => {
      if (key !== "overallReflection") {
        submissionData[key] = updateData[key];
      }
    });

    // Extract key fields from basicInfo for top-level access if needed
    if (updateData.basicInfo || existingExperience.basicInfo) {
      const basicInfo =
        typeof existingExperience.basicInfo === "object" &&
        existingExperience.basicInfo !== null
          ? {
              ...(existingExperience.basicInfo as any),
              ...updateData.basicInfo,
            }
          : updateData.basicInfo || {};

      submissionData.basicInfo = basicInfo;
    }

    const updatedExperience = await prisma.erasmusExperience.update({
      where: { id },
      data: submissionData,
    });

    return res.status(200).json(updatedExperience);
  } else {
    // Regular update (save progress)
    const updateFields: any = {
      lastSavedAt: new Date(),
      ...updateData,
    };

    // Merge nested experience.helpForStudents correctly
    if ((updateData as any).experience?.helpForStudents) {
      const existingExp =
        typeof existingExperience.experience === "object" &&
        existingExperience.experience !== null
          ? (existingExperience.experience as any)
          : {};
      updateFields.experience = {
        ...existingExp,
        ...(updateData as any).experience,
        helpForStudents: {
          ...(existingExp.helpForStudents || {}),
          ...(updateData as any).experience.helpForStudents,
        },
      };
    }

    const updatedExperience = await prisma.erasmusExperience.update({
      where: { id },
      data: updateFields,
    });

    return res.status(200).json(updatedExperience);
  }
}
