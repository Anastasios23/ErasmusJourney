import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

/**
 * Submit Submission for Review
 *
 * POST /api/submissions/[id]/submit - Submit a DRAFT submission for admin review
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid submission ID" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const submission = await prisma.student_submissions.findUnique({
      where: { id },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Check ownership
    if (submission.userId !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Can only submit DRAFT or REVISION_NEEDED
    if (
      submission.status !== "DRAFT" &&
      submission.status !== "REVISION_NEEDED"
    ) {
      return res.status(400).json({
        error: "Can only submit DRAFT or REVISION_NEEDED submissions",
        currentStatus: submission.status,
      });
    }

    // Validate required fields based on submission type
    const data = submission.data as any;

    if (submission.submissionType === "FULL_EXPERIENCE") {
      const requiredFields = ["hostCity", "hostCountry", "hostUniversity"];
      const missing = requiredFields.filter(
        (field) => !submission[field as keyof typeof submission],
      );

      if (missing.length > 0) {
        return res.status(400).json({
          error: "Missing required fields",
          missingFields: missing,
        });
      }
    }

    // Update to PENDING status
    const updatedSubmission = await prisma.student_submissions.update({
      where: { id },
      data: {
        status: "PENDING",
        submittedAt: new Date(),
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

    return res.status(200).json({
      message: "Submission sent for review",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Submit API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
