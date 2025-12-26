import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { randomUUID } from "crypto";

import { updateCityStatistics } from "../../src/services/statisticsService";

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

  // Get authenticated user from session
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const userId = session.user.id;

  if (id) {
    // Get specific experience with retry logic
    const experience = await retryDatabaseOperation(() =>
      prisma.erasmusExperience.findUnique({
        where: { id: id as string },
      }),
    );

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    // Ensure user can only access their own experience
    if ((experience as any).userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json(experience);
  } else {
    // Get all experiences for this user with retry logic
    const experiences = await retryDatabaseOperation(() =>
      prisma.erasmusExperience.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    );

    return res.status(200).json(experiences);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.body;

  if (action === "create") {
    try {
      // Get authenticated user from session
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.id) {
        console.error("No session or user ID found");
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = session.user.id;
      const userEmail = session.user.email;
      console.log(`Creating/fetching experience for user: ${userId}`);

      // CRITICAL: Verify the user actually exists in the database
      let userExists = await retryDatabaseOperation(() =>
        prisma.users.findUnique({
          where: { id: userId },
          select: { id: true },
        }),
      );

      // If user doesn't exist by ID, try to find by email and create if needed
      if (!userExists && userEmail) {
        console.log(
          `User ${userId} not found by ID, checking email: ${userEmail}`,
        );

        // Check if user exists by email
        const userByEmail = await retryDatabaseOperation(() =>
          prisma.users.findUnique({
            where: { email: userEmail },
            select: { id: true },
          }),
        );

        if (!userByEmail) {
          // Create the user since they authenticated via OAuth but don't exist in DB
          console.log(`Creating user from session: ${userEmail}`);
          const newUser = await retryDatabaseOperation(() =>
            prisma.users.create({
              data: {
                id: userId,
                email: userEmail,
                firstName: session.user.name?.split(" ")[0] || "",
                lastName:
                  session.user.name?.split(" ").slice(1).join(" ") || "",
                image: session.user.image || null,
                updatedAt: new Date(),
                role: "USER",
              },
            }),
          );
          console.log(`Created user: ${newUser.id}`);
          userExists = { id: newUser.id };
        } else {
          // User exists by email but with different ID - update session won't help here
          console.error(
            `User exists with different ID. Session ID: ${userId}, DB ID: ${userByEmail.id}`,
          );
          return res.status(409).json({
            error: "Session mismatch",
            details: "Please log out and log in again to refresh your session.",
          });
        }
      }

      if (!userExists) {
        console.error(`User ${userId} from session does not exist in database`);
        return res.status(404).json({
          error: "User not found",
          details: "Please log out and log in again to create your account.",
        });
      }

      // Check if this user already has an experience (with retry)
      let existingExperience = await retryDatabaseOperation(() =>
        prisma.erasmusExperience.findUnique({
          where: { userId },
        }),
      );

      if (existingExperience) {
        console.log(
          `Found existing experience: ${(existingExperience as any).id}, resetting to DRAFT`,
        );
        // Reset the existing experience to draft state
        const updatedExperience = await retryDatabaseOperation(() =>
          prisma.erasmusExperience.update({
            where: { id: (existingExperience as any).id },
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
              updatedAt: new Date(),
            },
          }),
        );
        return res.status(200).json(updatedExperience);
      }

      console.log("No existing experience found, creating new one");
      // Create a new draft experience (with retry)
      const newExperience = await retryDatabaseOperation(() =>
        prisma.erasmusExperience.create({
          data: {
            id: randomUUID(),
            userId,
            status: "DRAFT",
            semester: null, // Explicitly set to null
            updatedAt: new Date(),
            // Initialize empty data structures
            basicInfo: {},
            courses: [],
            accommodation: {},
            livingExpenses: {},
            experience: {},
          },
        }),
      );

      console.log(
        `Successfully created experience: ${(newExperience as any).id}`,
      );
      return res.status(201).json(newExperience);
    } catch (error) {
      console.error("Error in handlePost (create):", error);
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace",
      );
      return res.status(500).json({
        error: "Failed to create experience",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  console.log(
    `[API] Invalid action received: "${action}". Falling through to 400.`,
  );
  return res.status(400).json({ error: "Invalid action" });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { id, action, ...updateData } = req.body;

  console.log(`[API] handlePut called. ID: ${id}, Action: ${action}`);

  if (!id) {
    console.error("[API] Error: Experience ID is required");
    return res.status(400).json({ error: "Experience ID is required" });
  }

  // Ensure completedSteps is stringified if it's an array
  if (updateData.completedSteps && Array.isArray(updateData.completedSteps)) {
    updateData.completedSteps = JSON.stringify(updateData.completedSteps);
  }

  // Find the existing experience with retry logic
  const existingExperience: any = await retryDatabaseOperation(() =>
    prisma.erasmusExperience.findUnique({
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
      if ((basicInfo as any).hostCity) {
        (submissionData as any).hostCity = (basicInfo as any).hostCity;
      }
      if ((basicInfo as any).hostCountry) {
        (submissionData as any).hostCountry = (basicInfo as any).hostCountry;
      }
    }

    // --- VALIDATION START ---
    const errors: string[] = [];

    // 1. Basic Info
    const basicInfoVal = submissionData.basicInfo || {};
    console.log(
      "[API] Validating Basic Info:",
      JSON.stringify(basicInfoVal, null, 2),
    );

    if (
      !basicInfoVal.homeUniversity ||
      !basicInfoVal.hostUniversity ||
      !basicInfoVal.semester ||
      !basicInfoVal.year
    ) {
      console.log("[API] Basic Info Validation Failed. Missing fields.");
      errors.push(
        "Basic Information is incomplete (University, Semester, Year required).",
      );
    }

    // 2. Courses
    const coursesVal = submissionData.courses || {};
    const mappingsVal = coursesVal.mappings || [];
    console.log(
      "[API] Validating Courses. Mappings count:",
      mappingsVal.length,
    );

    if (!Array.isArray(mappingsVal) || mappingsVal.length === 0) {
      console.log("[API] Course Validation Failed. No mappings.");
      errors.push("At least one course mapping is required.");
    } else {
      // Check if mappings are valid
      const incompleteMappings = mappingsVal.some(
        (m: any) => !m.homeName?.trim() || !m.hostName?.trim(),
      );
      if (incompleteMappings) {
        errors.push(
          "All course mappings must have both home and host course names.",
        );
      }
    }

    // 3. Accommodation
    const accommodationVal = submissionData.accommodation || {};
    console.log(
      "[API] Validating Accommodation:",
      JSON.stringify(accommodationVal, null, 2),
    );

    if (
      !accommodationVal.type ||
      !accommodationVal.rent ||
      !accommodationVal.rating
    ) {
      console.log("[API] Accommodation Validation Failed. Missing fields.");
      errors.push(
        "Accommodation details are incomplete (Type, Rent, Rating required).",
      );
    }

    // 4. Living Expenses
    const livingExpensesVal = submissionData.livingExpenses || {};
    const expenses = livingExpensesVal.expenses || {};

    if (!livingExpensesVal.expenses) {
      errors.push("Living Expenses are incomplete.");
    } else {
      // Check for core expenses (should be present and ideally numbers)
      if (
        expenses.groceries === undefined ||
        expenses.transportation === undefined
      ) {
        errors.push("Monthly expense estimates are required.");
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation Failed",
        details: errors.join(" "),
      });
    }
    // --- VALIDATION END ---

    const updatedExperience = await retryDatabaseOperation(() =>
      prisma.$transaction(async (tx) => {
        // 1. Update the main experience record
        const experience = await tx.erasmusExperience.update({
          where: { id },
          data: submissionData,
        });

        // 2. Perform data aggregation
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
                status: "APPROVED", // Auto-approve for now
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
                name:
                  accomData.address ||
                  `${accomData.type} in ${experience.hostCity || "City"}`,
                type: accomData.type,
                address: accomData.address || null,
                pricePerMonth: parseFloat(accomData.rent) || 0,
                currency: accomData.currency || "EUR",
                rating: parseInt(accomData.rating) || 0,
                comment: accomData.review || null,
              },
            });
          }
        }

        return experience;
      }),
    );

    // 3. Update City Statistics (Fire and forget)
    if (
      (updatedExperience as any).hostCity &&
      (updatedExperience as any).hostCountry
    ) {
      updateCityStatistics(
        (updatedExperience as any).hostCity,
        (updatedExperience as any).hostCountry,
      ).catch((err) => console.error("Failed to update city stats:", err));
    }

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
      if ((basicInfo as any).hostCity) {
        updateFields.hostCity = (basicInfo as any).hostCity;
      }
      if ((basicInfo as any).hostCountry) {
        updateFields.hostCountry = (basicInfo as any).hostCountry;
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
      prisma.erasmusExperience.update({
        where: { id },
        data: updateFields,
      }),
    );

    return res.status(200).json(updatedExperience);
  }
}
