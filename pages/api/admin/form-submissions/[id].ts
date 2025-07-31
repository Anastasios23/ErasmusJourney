import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if user is admin
  const session = await getSession({ req });
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid submission ID" });
  }

  if (req.method === "PATCH") {
    try {
      const { status, rejectionReason } = req.body;

      const updatedSubmission = await prisma.formSubmission.update({
        where: { id },
        data: {
          status,
          ...(rejectionReason && {
            data: {
              ...(((await prisma.formSubmission.findUnique({ where: { id } }))
                ?.data as object) || {}),
              rejectionReason,
            },
          }),
        },
      });

      return res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error("Error updating submission:", error);
      return res.status(500).json({ error: "Failed to update submission" });
    }
  }

  if (req.method === "GET") {
    try {
      const submission = await prisma.formSubmission.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      return res.status(200).json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      return res.status(500).json({ error: "Failed to fetch submission" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
