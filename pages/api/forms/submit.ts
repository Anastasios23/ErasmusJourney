import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { validateFormData } from "../../../src/lib/formSchemas";

// Define the correct types based on your Prisma schema
type FormType =
  | "BASIC_INFO"
  | "COURSE_MATCHING"
  | "ACCOMMODATION"
  | "LIVING_EXPENSES"
  | "STORY"
  | "EXPERIENCE";

type SubmissionStatus = "DRAFT" | "SUBMITTED" | "PUBLISHED" | "ARCHIVED";

const typeMapping: Record<string, FormType> = {
  "basic-info": "BASIC_INFO",
  "course-matching": "COURSE_MATCHING",
  accommodation: "ACCOMMODATION",
  "living-expenses": "LIVING_EXPENSES",
  story: "STORY",
  experience: "EXPERIENCE",
};

const statusMapping: Record<string, SubmissionStatus> = {
  draft: "DRAFT",
  submitted: "SUBMITTED",
  published: "PUBLISHED",
  rejected: "ARCHIVED",
};

// Helper function to ensure numeric fields are properly converted
function convertNumericFields(data: any, type: string): any {
  if (type === "LIVING_EXPENSES" || type === "living-expenses") {
    return {
      ...data,
      monthlyRent: data.monthlyRent
        ? parseFloat(data.monthlyRent) || 0
        : undefined,
      monthlyFood: data.monthlyFood
        ? parseFloat(data.monthlyFood) || 0
        : undefined,
      monthlyTransport: data.monthlyTransport
        ? parseFloat(data.monthlyTransport) || 0
        : undefined,
      monthlyEntertainment: data.monthlyEntertainment
        ? parseFloat(data.monthlyEntertainment) || 0
        : undefined,
      monthlyUtilities: data.monthlyUtilities
        ? parseFloat(data.monthlyUtilities) || 0
        : undefined,
      monthlyOther: data.monthlyOther
        ? parseFloat(data.monthlyOther) || 0
        : undefined,
      totalMonthlyBudget: data.totalMonthlyBudget
        ? parseFloat(data.totalMonthlyBudget) || 0
        : undefined,
      monthlyIncomeAmount: data.monthlyIncomeAmount
        ? parseFloat(data.monthlyIncomeAmount) || 0
        : undefined,
      expenses: data.expenses
        ? Object.fromEntries(
            Object.entries(data.expenses).map(([key, value]) => [
              key,
              parseFloat(value as string) || 0,
            ]),
          )
        : undefined,
    };
  }

  if (type === "ACCOMMODATION" || type === "accommodation") {
    return {
      ...data,
      monthlyRent: data.monthlyRent ? parseFloat(data.monthlyRent) || 0 : 0,
      avgUtilityCost: data.avgUtilityCost
        ? parseFloat(data.avgUtilityCost) || 0
        : undefined,
      accommodationRating: data.accommodationRating
        ? parseFloat(data.accommodationRating) || 0
        : 0,
    };
  }

  if (type === "COURSE_MATCHING" || type === "course-matching") {
    return {
      ...data,
      hostCourseCount: data.hostCourseCount
        ? parseInt(data.hostCourseCount) || 0
        : 0,
      homeCourseCount: data.homeCourseCount
        ? parseInt(data.homeCourseCount) || 0
        : 0,
      hostCourses: data.hostCourses
        ? data.hostCourses.map((course: any) => ({
            ...course,
            ects: parseFloat(course.ects) || 0,
          }))
        : [],
      equivalentCourses: data.equivalentCourses
        ? data.equivalentCourses.map((course: any) => ({
            ...course,
            ects: parseFloat(course.ects) || 0,
          }))
        : [],
    };
  }

  if (type === "EXPERIENCE" || type === "experience" || type === "story") {
    return {
      ...data,
      academicRating: data.academicRating
        ? parseFloat(data.academicRating) || 0
        : undefined,
      socialLifeRating: data.socialLifeRating
        ? parseFloat(data.socialLifeRating) || 0
        : undefined,
      culturalImmersionRating: data.culturalImmersionRating
        ? parseFloat(data.culturalImmersionRating) || 0
        : undefined,
      costOfLivingRating: data.costOfLivingRating
        ? parseFloat(data.costOfLivingRating) || 0
        : undefined,
      accommodationRating: data.accommodationRating
        ? parseFloat(data.accommodationRating) || 0
        : undefined,
      overallRating: data.overallRating
        ? parseFloat(data.overallRating) || 0
        : undefined,
    };
  }

  return data;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get session directly using NextAuth
    const session = await getServerSession(req, res, authOptions);

    console.log("Session in API:", session ? "Session found" : "No session"); // Debug log

    if (!session?.user?.id) {
      console.log("No session or user ID found"); // Debug log
      return res.status(401).json({
        error: "Authentication required",
        message: "Please sign in to submit forms",
      });
    }

    const { type, title, data, status = "published", basicInfoId } = req.body;

    console.log("Form submission request:", {
      type,
      title,
      hasData: !!data,
      status,
      basicInfoId,
    }); // Debug log

    if (!type || !title || !data) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Type, title, and data are required",
        received: { type: !!type, title: !!title, data: !!data },
      });
    }

    // Check if user exists in database, create if missing
    let userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userExists) {
      console.log(
        "User not found in database, attempting to create:",
        session.user.id,
      );

      try {
        // Create the user based on session data
        userExists = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email || "",
            firstName: session.user.name?.split(" ")[0] || "Unknown",
            lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
            role: session.user.role || "USER",
          },
        });
        console.log("Successfully created user account:", userExists.id);
      } catch (createError) {
        console.error("Failed to create user account:", createError);
        return res.status(401).json({
          error: "User account creation failed",
          message:
            "Could not create your user account. Please sign out and sign in again.",
          action: "REAUTHENTICATE",
        });
      }
    }

    // Map string types to enum values
    const formType = typeMapping[type];
    const submissionStatus = statusMapping[status];

    if (!formType) {
      return res.status(400).json({
        error: "Invalid form type",
        message: `Type '${type}' is not supported`,
        supportedTypes: Object.keys(typeMapping),
      });
    }

    if (!submissionStatus) {
      return res.status(400).json({
        error: "Invalid status",
        message: `Status '${status}' is not supported`,
        supportedStatuses: Object.keys(statusMapping),
      });
    }

    console.log("Creating submission for user:", session.user.id); // Debug log

    // Convert numeric fields appropriately
    const processedData = convertNumericFields(data, type);

    // Validate data based on form type (optional - can be skipped for backward compatibility)
    try {
      validateFormData(type, processedData);
      console.log("Form validation passed");
    } catch (validationError) {
      console.warn("Form validation warning:", validationError);
      // Don't fail submission for validation errors - just log them
    }

    // For BASIC_INFO submissions, this will be the foundational submission
    // For other types, link them to the basic info submission
    let linkingData = processedData;

    if (type !== "basic-info" && basicInfoId) {
      console.log(`Linking ${type} submission to basicInfoId: ${basicInfoId}`);

      try {
        // Verify the basic info submission exists and belongs to the user
        const basicInfoSubmission = await prisma.formSubmission.findFirst({
          where: {
            id: basicInfoId,
            userId: session.user.id,
            type: "BASIC_INFO",
          },
        });

        if (basicInfoSubmission) {
          linkingData = {
            ...processedData,
            _basicInfoId: basicInfoId, // Store reference in data
            _linkedSubmission: true,
          };
          console.log(
            `Successfully linked to basic info submission: ${basicInfoId}`,
          );
        } else {
          console.warn(
            `Basic info submission ${basicInfoId} not found for user ${session.user.id}`,
          );
        }
      } catch (linkingError) {
        console.error("Error during linking verification:", linkingError);
        // Continue without linking if there's an error
      }
    }

    console.log("About to create form submission:", {
      userId: session.user.id,
      type: formType,
      title,
      hasData: !!linkingData,
      status: submissionStatus,
    });

    // Create form submission in database
    const submission = await prisma.formSubmission.create({
      data: {
        userId: session.user.id,
        type: formType,
        title,
        data: linkingData,
        status: submissionStatus,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log(`Successfully created ${type} submission:`, submission.id);

    res.status(201).json({
      message: "Form submitted successfully",
      submissionId: submission.id,
      submission: {
        id: submission.id,
        type: submission.type,
        title: submission.title,
        status: submission.status,
        createdAt: submission.createdAt,
        user: submission.user,
        isLinked: !!basicInfoId,
      },
    });
  } catch (error) {
    console.error("Error submitting form:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        message: error.errors[0].message,
        details: error.errors,
      });
    }

    // Enhanced error reporting for debugging
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Form submission error details:", {
      message: errorMessage,
      stack: errorStack,
      requestBody: req.body,
      userAgent: req.headers["user-agent"],
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Internal server error",
      message: errorMessage, // Send the actual error message for debugging
      details:
        process.env.NODE_ENV === "development"
          ? {
              stack: errorStack,
              timestamp: new Date().toISOString(),
            }
          : undefined,
    });
  }
}
