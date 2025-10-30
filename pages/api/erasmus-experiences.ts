import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Retry helper for database operations
async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError =
        error?.code === "P1001" ||
        error?.message?.includes("Can't reach database") ||
        error?.name === "PrismaClientInitializationError";

      if (isConnectionError && attempt < maxRetries) {
        console.log(
          `Database connection failed, retrying (${attempt}/${maxRetries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

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
    // Get specific experience with retry logic
    const experience = await retryDatabaseOperation(() =>
      prisma.erasmus_experiences.findUnique({
        where: { id: id as string },
      }),
    );

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    return res.status(200).json(experience);
  } else {
    // Get all experiences (for admin or debugging) with retry logic
    const experiences = await retryDatabaseOperation(() =>
      prisma.erasmus_experiences.findMany({
        orderBy: { updatedAt: "desc" },
      }),
    );

    return res.status(200).json(experiences);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.body;

  if (action === "create") {
    // First, ensure we have a test user or create one
    let testUser = await prisma.users.findFirst({
      where: { email: "test@erasmus.local" },
    });

    if (!testUser) {
      testUser = await prisma.users.create({
        data: {
          email: "test@erasmus.local",
          firstName: "Test",
          lastName: "User",
          role: "USER",
        },
      });
    }

    // Check if this user already has an experience
    let existingExperience = await prisma.erasmus_experiences.findUnique({
      where: { userId: testUser.id },
    });

    if (existingExperience) {
      // Reset the existing experience to draft state for testing
      existingExperience = await prisma.erasmus_experiences.update({
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
    const newExperience = await prisma.erasmus_experiences.create({
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

  // Find the existing experience with retry logic
  const existingExperience: any = await retryDatabaseOperation(() =>
    prisma.erasmus_experiences.findUnique({
      where: { id },
    }),
  );

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

      // Extract top-level fields for querying (only fields that exist in form)
      if (basicInfo.hostCity) {
        submissionData.hostCity = basicInfo.hostCity;
      }
      if (basicInfo.hostCountry) {
        submissionData.hostCountry = basicInfo.hostCountry;
      }
    }

    const updatedExperience = await retryDatabaseOperation(() =>
      prisma.erasmus_experiences.update({
        where: { id },
        data: submissionData,
      }),
    );

    return res.status(200).json(updatedExperience);
  } else {
    // Regular update (save progress)
    const updateFields: any = {
      lastSavedAt: new Date(),
      ...updateData,
    };

    // Extract top-level fields from basicInfo if present
    if (updateData.basicInfo) {
      const basicInfo = updateData.basicInfo;

      // Extract hostCity and hostCountry to top level for querying
      if (basicInfo.hostCity) {
        updateFields.hostCity = basicInfo.hostCity;
      }
      if (basicInfo.hostCountry) {
        updateFields.hostCountry = basicInfo.hostCountry;
      }
    }

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

    const updatedExperience = await retryDatabaseOperation(() =>
      prisma.erasmus_experiences.update({
        where: { id },
        data: updateFields,
      }),
    );

    return res.status(200).json(updatedExperience);
  }
}
