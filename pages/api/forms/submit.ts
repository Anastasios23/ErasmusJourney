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

const statusMapping: Record<string, SubmissionStatus> = {
  draft: "DRAFT",
  submitted: "SUBMITTED",
  published: "PUBLISHED",
  rejected: "REJECTED",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerAuthSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { type, title, data, status = "submitted" } = req.body;

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

    // Create form submission in database
    const submission = await prisma.formSubmission.create({
      data: {
        userId: session.user.id,
        type: formType,
        title,
        data,
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
