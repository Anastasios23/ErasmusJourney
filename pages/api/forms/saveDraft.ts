import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { FormType } from "../../../src/types/forms";
import { livingExpensesSchema } from "../../../src/lib/formSchemas";

const typeMapping: Record<string, FormType> = {
  "basic-info": "basic-info",
  "course-matching": "course-matching",
  accommodation: "accommodation",
  "living-expenses": "living-expenses",
  "help-future-students": "help-future-students",
};

const validateFormType = (type: string): type is FormType => {
  return [
    "basic-info",
    "course-matching",
    "accommodation",
    "living-expenses",
    "help-future-students",
  ].includes(type);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only POST requests are supported",
    });
  }

  // Verify authentication using NextAuth directly
  const session = await getServerSession(req, res, authOptions);

  console.log("Session in saveDraft API:", session); // Debug log

  if (!session?.user?.id) {
    console.log("No session or user ID found in saveDraft"); // Debug log
    return res.status(401).json({
      error: "Authentication required",
      message: "Please sign in to save drafts",
    });
  }

  try {
    const { type, title, data } = req.body;

    const hostCity = data.hostCity || data.basicInfo?.hostCity || null;
    const hostCountry = data.hostCountry || data.basicInfo?.hostCountry || null;

    if (!type || !title || !data) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Missing required fields: type, title, or data",
      });
    }

    // Map string types to enum values
    const formType = typeMapping[type];
    if (!formType) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Invalid form type",
      });
    }

    // Validate form type
    if (!validateFormType(type)) {
      return res.status(400).json({
        error: "Validation failed",
        message: `Invalid form type: ${type}`,
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

    // Validate living expenses form data specifically
    if (type === "living-expenses") {
      try {
        livingExpensesSchema.parse(req.body);
      } catch (error) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Invalid living expenses form data",
        });
      }
    }

    // Check if draft already exists
    const existingDraft = await prisma.formSubmission.findFirst({
      where: {
        userId: session.user.id,
        type: formType,
        status: "DRAFT",
      },
    });

    let submission;
    if (existingDraft) {
      // Update existing draft
      submission = await prisma.formSubmission.update({
        where: { id: existingDraft.id },
        data: {
          title,
          data,
          updatedAt: new Date(),
          hostCity,
          hostCountry,
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
    } else {
      // Create new draft
      submission = await prisma.formSubmission.create({
        data: {
          userId: session.user.id,
          type: formType,
          title,
          data,
          status: "DRAFT",
          hostCity,
          hostCountry,
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
    }

    res.status(200).json({
      message: "Draft saved successfully",
      draftId: submission.id,
      submission: {
        id: submission.id,
        type: submission.type,
        title: submission.title,
        status: submission.status,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        user: submission.user,
      },
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to save draft. Please try again.",
    });
  }
}
