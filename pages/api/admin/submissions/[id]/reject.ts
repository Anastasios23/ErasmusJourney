import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";

/**
 * Reject Submission
 *
 * POST /api/admin/submissions/[id]/reject - Reject a submission with reason
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

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const submission = await prisma.student_submissions.findUnique({
      where: { id },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.status !== "PENDING") {
      return res.status(400).json({
        error: "Can only reject PENDING submissions",
        currentStatus: submission.status,
      });
    }

    const { rejectionReason, adminNotes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        error: "rejectionReason is required",
      });
    }

    const rejectedSubmission = await prisma.student_submissions.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedBy: user.id,
        reviewedAt: new Date(),
        rejectionReason,
        adminNotes: adminNotes || null,
        isPublic: false,
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
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Submission rejected",
      submission: rejectedSubmission,
    });
  } catch (error) {
    console.error("Reject Submission API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
