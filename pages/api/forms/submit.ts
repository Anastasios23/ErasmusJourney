import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import { FormType, SubmissionStatus } from "@prisma/client";

const typeMapping: Record<string, FormType> = {
  "basic-info": "BASIC_INFO",
  "course-matching": "COURSE_MATCHING",
  accommodation: "ACCOMMODATION",
  story: "STORY",
  experience: "EXPERIENCE",
};

const statusMapping: Record<string, SubmissionStatus> = {
  draft: "DRAFT",
  submitted: "SUBMITTED",
  published: "PUBLISHED",
  rejected: "ARCHIVED",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Get session directly using NextAuth
  const session = await getServerSession(req, res, authOptions);

  console.log("Session in API:", session); // Debug log

  if (!session?.user?.id) {
    console.log("No session or user ID found"); // Debug log
    return res.status(401).json({
      error: "Authentication required",
      message: "Please sign in to submit forms",
    });
  }

  try {
    const { type, title, data, status = "submitted", basicInfoId } = req.body;

    if (!type || !title || !data) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Map string types to enum values
    const formType = typeMapping[type];
    const submissionStatus = statusMapping[status];

    if (!formType) {
      return res.status(400).json({ message: "Invalid form type" });
    }

    if (!submissionStatus) {
      return res.status(400).json({ message: "Invalid status" });
    }

    console.log("Creating submission for user:", session.user.id); // Debug log
    
    // Prepare submission data
    const submissionData: any = {
      userId: session.user.id,
      type: formType,
      title,
      data,
      status: submissionStatus,
    };
    
    // If this is not a basic-info submission and we have a basicInfoId, include it in the data
    if (type !== "basic-info" && basicInfoId) {
      console.log(`Including basicInfoId: ${basicInfoId} for ${type} submission`);
      // Store the basicInfoId in the data field for now
      // In a production app, you would add a proper relation in the database schema
      submissionData.data = {
        ...data,
        _basicInfoId: basicInfoId // Add a special field to track the relationship
      };
    }

    // Create form submission in database
    const submission = await prisma.formSubmission.create({
      data: submissionData,
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
      },
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
