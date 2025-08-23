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
      const { status, adminContent, createAccommodationListing } = req.body;

      // If approving and creating accommodation listing
      if (status === "approved" && createAccommodationListing && adminContent) {
        // Get the original submission
        const submission = await prisma.formSubmission.findUnique({
          where: { id: id as string },
        });

        if (!submission) {
          return res.status(404).json({ error: "Submission not found" });
        }

        const submissionData = submission.data as any;

        // Create accommodation listing using existing Accommodation model
        await prisma.accommodation.create({
          data: {
            name: adminContent.title,
            type: submissionData.housingType,
            description: adminContent.professionalDescription,
            address: `${submissionData.neighborhood}, ${submissionData.hostCity}`,
            city: submissionData.hostCity,
            country: submissionData.hostCountry,
            pricePerMonth: submissionData.monthlyRent,
            currency: "EUR",
            imageUrl: adminContent.adminPhotos[0] || null,
            amenities: submissionData.amenities,
            contactInfo: {
              verified: adminContent.priceVerified,
              contact: adminContent.verifiedContact,
              website: adminContent.officialWebsite,
              deposit: submissionData.deposit,
              contractLength: submissionData.contractLength,
            },
            isActive: true,
          },
        });
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
