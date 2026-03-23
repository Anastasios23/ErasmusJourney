import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { randomUUID } from "crypto";

import {
  createEmptyAccommodationStepData,
  getAccommodationTypeLabel,
  getBillsIncludedLabel,
  getDifficultyFindingAccommodationLabel,
  getHowFoundAccommodationLabel,
  sanitizeAccommodationStepData,
} from "../../src/lib/accommodation";
import { updateCityStatistics } from "../../src/services/statisticsService";
import {
  buildExperienceSemester,
  sanitizeBasicInformationData,
} from "../../src/lib/basicInformation";
import {
  hasCompleteCourseMatchingData,
  sanitizeCourseMappingsData,
} from "../../src/lib/courseMatching";
import { getCyprusUniversityByEmail } from "../../lib/authUtils";
import { prisma } from "../../lib/prisma";
import { CYPRUS_UNIVERSITIES } from "../../src/data/universityAgreements";

class Step1ValidationError extends Error {
  statusCode: number;
  validationCode:
    | "MISSING_HOME_UNIVERSITY_CODE"
    | "INVALID_HOME_UNIVERSITY_CODE";

  constructor(
    statusCode: number,
    validationCode:
      | "MISSING_HOME_UNIVERSITY_CODE"
      | "INVALID_HOME_UNIVERSITY_CODE",
    message: string,
  ) {
    super(message);
    this.name = "Step1ValidationError";
    this.statusCode = statusCode;
    this.validationCode = validationCode;
  }
}

function normalizeKey(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

const CANONICAL_UNIVERSITIES_BY_CODE = new Map(
  CYPRUS_UNIVERSITIES.map((university) => [
    normalizeKey(university.code),
    university,
  ]),
);

function getCanonicalUniversityByCode(code?: string | null) {
  if (!code) {
    return null;
  }

  return CANONICAL_UNIVERSITIES_BY_CODE.get(normalizeKey(code)) || null;
}

function getSupportedUniversityCodesMessage(): string {
  return CYPRUS_UNIVERSITIES.map((university) => university.code).join(", ");
}

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

async function resolveUniversityByReference(
  reference?: string | null,
  name?: string | null,
) {
  const normalizedReference = reference?.trim();
  const normalizedName = name?.trim();

  if (!normalizedReference && !normalizedName) {
    return null;
  }

  return prisma.universities.findFirst({
    where: {
      OR: [
        ...(normalizedReference
          ? [{ id: normalizedReference }, { code: normalizedReference }]
          : []),
        ...(normalizedName ? [{ name: normalizedName }] : []),
      ],
    },
    select: {
      id: true,
      name: true,
      city: true,
      country: true,
    },
  });
}

async function buildBasicInfoPersistenceData(
  incomingBasicInfo: any,
  existingBasicInfo: any,
  signedInEmail?: string | null,
) {
  if (!incomingBasicInfo && !existingBasicInfo) {
    return null;
  }

  const mergedBasicInfo = sanitizeBasicInformationData({
    ...sanitizeBasicInformationData(existingBasicInfo),
    ...(incomingBasicInfo || {}),
  });
  const derivedHomeUniversity = getCyprusUniversityByEmail(signedInEmail);
  const submittedFallbackCode = mergedBasicInfo.homeUniversityId?.trim();

  let canonicalHomeUniversityCode = "";
  let canonicalHomeUniversityName = "";

  if (derivedHomeUniversity?.code) {
    const canonicalFromEmail = getCanonicalUniversityByCode(
      derivedHomeUniversity.code,
    );

    if (!canonicalFromEmail) {
      throw new Step1ValidationError(
        422,
        "INVALID_HOME_UNIVERSITY_CODE",
        "Your authenticated university is not in the supported MVP scope.",
      );
    }

    canonicalHomeUniversityCode = canonicalFromEmail.code;
    canonicalHomeUniversityName = canonicalFromEmail.name;
  } else {
    if (!submittedFallbackCode) {
      throw new Step1ValidationError(
        400,
        "MISSING_HOME_UNIVERSITY_CODE",
        "Home university code is required when your email domain is not recognized. Please select one of the supported universities.",
      );
    }

    const canonicalFallbackUniversity = getCanonicalUniversityByCode(
      submittedFallbackCode,
    );

    if (!canonicalFallbackUniversity) {
      throw new Step1ValidationError(
        422,
        "INVALID_HOME_UNIVERSITY_CODE",
        `Invalid home university code '${submittedFallbackCode}'. Supported universities are: ${getSupportedUniversityCodesMessage()}.`,
      );
    }

    canonicalHomeUniversityCode = canonicalFallbackUniversity.code;
    canonicalHomeUniversityName = canonicalFallbackUniversity.name;
  }

  const [homeUniversity, hostUniversity] = await Promise.all([
    resolveUniversityByReference(
      canonicalHomeUniversityCode,
      canonicalHomeUniversityName,
    ),
    resolveUniversityByReference(
      mergedBasicInfo.hostUniversityId,
      mergedBasicInfo.hostUniversity,
    ),
  ]);

  const persistedBasicInfo = sanitizeBasicInformationData({
    ...mergedBasicInfo,
    homeUniversity: homeUniversity?.name || canonicalHomeUniversityName,
    homeUniversityId: canonicalHomeUniversityCode,
    hostUniversity:
      mergedBasicInfo.hostUniversity || hostUniversity?.name || "",
    hostUniversityId: hostUniversity?.id || "",
    hostCity: mergedBasicInfo.hostCity || hostUniversity?.city || "",
    hostCountry: mergedBasicInfo.hostCountry || hostUniversity?.country || "",
  });

  return {
    basicInfo: persistedBasicInfo,
    homeUniversityId: homeUniversity?.id || null,
    hostUniversityId: hostUniversity?.id || null,
    hostCity: persistedBasicInfo.hostCity || null,
    hostCountry: persistedBasicInfo.hostCountry || null,
    semester: buildExperienceSemester(persistedBasicInfo),
  };
}

function serializeExperienceForClient<T extends Record<string, any>>(
  experience: T,
): T {
  return {
    ...experience,
    basicInfo: sanitizeBasicInformationData(experience.basicInfo),
    accommodation: sanitizeAccommodationStepData(experience.accommodation),
    courses: sanitizeCourseMappingsData(experience.courses),
  };
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

    return res
      .status(200)
      .json(serializeExperienceForClient(experience as any));
  } else {
    // Get all experiences for this user with retry logic
    const experiences = await retryDatabaseOperation(() =>
      prisma.erasmusExperience.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    );

    return res
      .status(200)
      .json(
        experiences.map((experience) =>
          serializeExperienceForClient(experience as any),
        ),
      );
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
          const newUser = (await retryDatabaseOperation(() =>
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
          )) as { id: string };
          console.log(`Created user: ${newUser.id}`);
          userExists = { id: newUser.id };
        } else {
          // User exists by email but with different ID - update session won't help here
          const existingUser = userByEmail as { id: string };
          console.error(
            `User exists with different ID. Session ID: ${userId}, DB ID: ${existingUser.id}`,
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
              accommodation: createEmptyAccommodationStepData(),
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
            accommodation: createEmptyAccommodationStepData(),
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

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Ensure completedSteps is stringified if it's an array
  if (updateData.completedSteps && Array.isArray(updateData.completedSteps)) {
    updateData.completedSteps = JSON.stringify(updateData.completedSteps);
  }

  if (updateData.courses !== undefined) {
    updateData.courses = sanitizeCourseMappingsData(updateData.courses);
  }

  if (updateData.accommodation !== undefined) {
    updateData.accommodation = sanitizeAccommodationStepData(
      updateData.accommodation,
    );
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

  if ((existingExperience as any).userId !== session.user.id) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (action === "submit") {
    // Final submission - mark as submitted and populate all required fields
    const submissionData: any = {
      status: "SUBMITTED",
      submittedAt: new Date(),
      isComplete: true,
    };
    const normalizedCourseMappings = sanitizeCourseMappingsData(
      updateData.courses ?? existingExperience.courses,
    );

    submissionData.courses = normalizedCourseMappings;

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

    let basicInfoContext = null;

    try {
      basicInfoContext = await buildBasicInfoPersistenceData(
        updateData.basicInfo,
        existingExperience.basicInfo,
        session.user.email,
      );
    } catch (error) {
      if (error instanceof Step1ValidationError) {
        return res.status(error.statusCode).json({
          error: "Basic information validation failed",
          code: error.validationCode,
          message: error.message,
        });
      }

      throw error;
    }

    if (basicInfoContext) {
      submissionData.basicInfo = basicInfoContext.basicInfo;
      submissionData.homeUniversityId = basicInfoContext.homeUniversityId;
      submissionData.hostUniversityId = basicInfoContext.hostUniversityId;
      submissionData.hostCity = basicInfoContext.hostCity;
      submissionData.hostCountry = basicInfoContext.hostCountry;
      submissionData.semester = basicInfoContext.semester;
    }

    submissionData.accommodation = sanitizeAccommodationStepData(
      updateData.accommodation ?? existingExperience.accommodation,
    );

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
      !basicInfoVal.homeDepartment ||
      !basicInfoVal.levelOfStudy ||
      !basicInfoVal.hostUniversity ||
      !basicInfoVal.exchangeAcademicYear ||
      !basicInfoVal.exchangePeriod
    ) {
      console.log("[API] Basic Info Validation Failed. Missing fields.");
      errors.push(
        "Basic Information is incomplete (home university, department, level, host university, academic year, and period are required).",
      );
    }

    // 2. Courses
    const mappingsVal = sanitizeCourseMappingsData(submissionData.courses);
    console.log(
      "[API] Validating Courses. Mappings count:",
      mappingsVal.length,
    );

    if (!Array.isArray(mappingsVal) || mappingsVal.length === 0) {
      console.log("[API] Course Validation Failed. No mappings.");
      errors.push("At least one course mapping is required.");
    } else if (!hasCompleteCourseMatchingData(mappingsVal)) {
      errors.push(
        "All course mappings must include home course name, host course name, home ECTS, host ECTS, and recognition type.",
      );
    }

    // 3. Accommodation
    const accommodationVal = submissionData.accommodation || {};
    console.log(
      "[API] Validating Accommodation:",
      JSON.stringify(accommodationVal, null, 2),
    );

    if (
      !accommodationVal.accommodationType ||
      typeof accommodationVal.monthlyRent !== "number" ||
      !accommodationVal.billsIncluded ||
      typeof accommodationVal.accommodationRating !== "number" ||
      typeof accommodationVal.wouldRecommend !== "boolean"
    ) {
      console.log("[API] Accommodation Validation Failed. Missing fields.");
      errors.push(
        "Accommodation details are incomplete (type, monthly rent, bills included, rating, and recommendation are required).",
      );
    }

    // 4. Living Expenses
    const livingExpensesVal = submissionData.livingExpenses || {};
    const hasCurrentStepShape =
      livingExpensesVal.food &&
      livingExpensesVal.transport &&
      livingExpensesVal.social &&
      livingExpensesVal.travel;
    const expenses = livingExpensesVal.expenses || {};

    if (
      !hasCurrentStepShape &&
      (expenses.groceries === undefined ||
        expenses.transportation === undefined ||
        expenses.socialLife === undefined ||
        expenses.travel === undefined)
    ) {
      errors.push("Living Expenses are incomplete.");
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
          const mappings = sanitizeCourseMappingsData(experience.courses);

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
                homeCourseCode: m.homeCourseCode || null,
                homeCourseName: m.homeCourseName || "",
                homeCredits: m.homeECTS || 0,
                hostCourseCode: m.hostCourseCode || null,
                hostCourseName: m.hostCourseName || "",
                hostCredits: m.hostECTS || 0,
                status: "APPROVED", // Auto-approve for now
              })),
            });
          }
        }

        // B. Aggregate Accommodation Review
        if (experience.accommodation) {
          const accomData = sanitizeAccommodationStepData(
            experience.accommodation as any,
          );

          // Delete existing review for this experience
          await tx.accommodationReview.deleteMany({
            where: { experienceId: experience.id },
          });

          // Create new review
          if (
            accomData.accommodationType &&
            typeof accomData.monthlyRent === "number" &&
            typeof accomData.accommodationRating === "number"
          ) {
            const structuredNotes = [
              accomData.billsIncluded
                ? `Bills included: ${getBillsIncludedLabel(accomData.billsIncluded)}`
                : null,
              accomData.minutesToUniversity !== undefined
                ? `${accomData.minutesToUniversity} minutes to university`
                : null,
              accomData.howFoundAccommodation
                ? `Found via ${getHowFoundAccommodationLabel(
                    accomData.howFoundAccommodation,
                  )}`
                : null,
              accomData.difficultyFindingAccommodation
                ? `Finding difficulty: ${getDifficultyFindingAccommodationLabel(
                    accomData.difficultyFindingAccommodation,
                  )}`
                : null,
              typeof accomData.wouldRecommend === "boolean"
                ? accomData.wouldRecommend
                  ? "Student would recommend it"
                  : "Student would not recommend it"
                : null,
            ].filter(Boolean);

            await tx.accommodationReview.create({
              data: {
                experienceId: experience.id,
                name: `${getAccommodationTypeLabel(accomData.accommodationType)} in ${
                  accomData.areaOrNeighborhood || experience.hostCity || "City"
                }`,
                type: accomData.accommodationType,
                neighborhood: accomData.areaOrNeighborhood || null,
                pricePerMonth: accomData.monthlyRent,
                currency: accomData.currency || "EUR",
                rating: accomData.accommodationRating,
                comment:
                  accomData.accommodationReview ||
                  (structuredNotes.length > 0
                    ? structuredNotes.join(". ")
                    : null),
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

    return res
      .status(200)
      .json(serializeExperienceForClient(updatedExperience as any));
  } else {
    // Regular update (save progress)
    const updateFields: any = {
      lastSavedAt: new Date(),
      ...updateData,
    };

    let basicInfoContext = null;

    try {
      basicInfoContext = await buildBasicInfoPersistenceData(
        updateData.basicInfo,
        existingExperience.basicInfo,
        session.user.email,
      );
    } catch (error) {
      if (error instanceof Step1ValidationError) {
        return res.status(error.statusCode).json({
          error: "Basic information validation failed",
          code: error.validationCode,
          message: error.message,
        });
      }

      throw error;
    }

    if (basicInfoContext) {
      updateFields.basicInfo = basicInfoContext.basicInfo;
      updateFields.homeUniversityId = basicInfoContext.homeUniversityId;
      updateFields.hostUniversityId = basicInfoContext.hostUniversityId;
      updateFields.hostCity = basicInfoContext.hostCity;
      updateFields.hostCountry = basicInfoContext.hostCountry;
      updateFields.semester = basicInfoContext.semester;
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

    return res
      .status(200)
      .json(serializeExperienceForClient(updatedExperience as any));
  }
}
