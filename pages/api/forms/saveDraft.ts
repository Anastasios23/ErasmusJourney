import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { FormType, SubmissionStatus } from "@prisma/client";

const typeMapping: Record<string, FormType> = {
  "basic-info": "BASIC_INFO",
  "course-matching": "COURSE_MATCHING",
  accommodation: "ACCOMMODATION",
  story: "STORY",
  experience: "EXPERIENCE",
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

  // Verify authentication
  const session = await getServerAuthSession(req, res);
  if (!session?.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please sign in to save drafts",
    });
  }

  try {
    const { type, title, data } = req.body;

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
