import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";

/**
 * Request Revision on Submission
 *
 * POST /api/admin/submissions/[id]/revise - Request revisions from student
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
        error: "Can only request revisions on PENDING submissions",
        currentStatus: submission.status,
      });
    }

    const { revisionNotes, adminNotes } = req.body;

    if (!revisionNotes) {
      return res.status(400).json({
        error: "revisionNotes is required",
      });
    }

    const revisedSubmission = await prisma.student_submissions.update({
      where: { id },
      data: {
        status: "REVISION_NEEDED",
        reviewedBy: user.id,
        reviewedAt: new Date(),
        revisionNotes,
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
      message: "Revision requested",
      submission: revisedSubmission,
    });
  } catch (error) {
    console.error("Request Revision API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
