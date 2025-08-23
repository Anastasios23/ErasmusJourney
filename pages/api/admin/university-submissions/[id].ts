import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // Check if user is admin
  // const session = await getSession({ req });
  // if (!session?.user || session.user.role !== "ADMIN") {
  //   return res.status(403).json({ error: "Unauthorized" });
  // }

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const submission = await prisma.formSubmission.findUnique({
        where: { id: id as string },
        include: {
          user: true,
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

  if (req.method === "PUT") {
    try {
      const { status, adminNotes, universityExchangeData } = req.body;

      // If approving and creating university exchange
      if (status === "approved" && universityExchangeData) {
        // For now, just log the data until we have the model working
        console.log(
          "Would create university exchange:",
          universityExchangeData,
        );

        // Could store this in a different way for now
        // or save it to the existing Destination model as a workaround
      }

      // Update submission status
      const updatedSubmission = await prisma.formSubmission.update({
        where: { id: id as string },
        data: {
          status,
        },
      });

      return res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error("Error updating submission:", error);
      return res.status(500).json({ error: "Failed to update submission" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
