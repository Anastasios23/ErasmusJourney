import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

type SubmissionStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REVISION_NEEDED"
  | "ARCHIVED";

/**
 * Submission Detail API
 *
 * GET    /api/submissions/[id] - Get submission details
 * PUT    /api/submissions/[id] - Update submission (save progress)
 * DELETE /api/submissions/[id] - Delete submission (draft only)
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid submission ID" });
  }

  try {
    if (req.method === "GET") {
      return await handleGet(req, res, session.user.email, id);
    } else if (req.method === "PUT") {
      return await handlePut(req, res, session.user.email, id);
    } else if (req.method === "DELETE") {
      return await handleDelete(req, res, session.user.email, id);
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res
        .status(405)
        .json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Submission Detail API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string,
  id: string,
) {
  const user = await prisma.users.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const submission = await prisma.student_submissions.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  // Check if user owns this submission (or is admin)
  if (submission.userId !== user.id && user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  return res.status(200).json(submission);
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string,
  id: string,
) {
  const user = await prisma.users.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const existingSubmission = await prisma.student_submissions.findUnique({
    where: { id },
  });

  if (!existingSubmission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  // Check ownership
  if (existingSubmission.userId !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Can only edit DRAFT or REVISION_NEEDED submissions
  if (
    existingSubmission.status !== "DRAFT" &&
    existingSubmission.status !== "REVISION_NEEDED"
  ) {
    return res.status(400).json({
      error: "Can only edit DRAFT or REVISION_NEEDED submissions",
    });
  }

  const {
    data,
    title,
    hostCity,
    hostCountry,
    hostUniversity,
    semester,
    academicYear,
    formStep,
  } = req.body;

  // Merge data if provided (don't replace entirely)
  const updatedData = data
    ? { ...(existingSubmission.data as any), ...data }
    : existingSubmission.data;

  const updatedSubmission = await prisma.student_submissions.update({
    where: { id },
    data: {
      data: updatedData,
      title: title !== undefined ? title : existingSubmission.title,
      hostCity: hostCity !== undefined ? hostCity : existingSubmission.hostCity,
      hostCountry:
        hostCountry !== undefined
          ? hostCountry
          : existingSubmission.hostCountry,
      hostUniversity:
        hostUniversity !== undefined
          ? hostUniversity
          : existingSubmission.hostUniversity,
      semester: semester !== undefined ? semester : existingSubmission.semester,
      academicYear:
        academicYear !== undefined
          ? academicYear
          : existingSubmission.academicYear,
      formStep: formStep !== undefined ? formStep : existingSubmission.formStep,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return res.status(200).json(updatedSubmission);
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userEmail: string,
  id: string,
) {
  const user = await prisma.users.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const existingSubmission = await prisma.student_submissions.findUnique({
    where: { id },
  });

  if (!existingSubmission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  // Check ownership
  if (existingSubmission.userId !== user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Can only delete DRAFT submissions
  if (existingSubmission.status !== "DRAFT") {
    return res.status(400).json({
      error: "Can only delete DRAFT submissions",
    });
  }

  await prisma.student_submissions.delete({
    where: { id },
  });

  return res.status(200).json({ message: "Submission deleted successfully" });
}
