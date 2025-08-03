import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if user is admin
  const session = await getSession({ req });
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { status } = req.query;

      // Fetch form submissions that have accommodation data
      const submissions = await prisma.formSubmission.findMany({
        where: {
          ...(status && { status: status as string }),
          type: "accommodation",
        },
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
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform the data for the admin interface
      const formattedSubmissions = submissions.map((submission: any) => {
        const data = submission.data as any;

        return {
          id: submission.id,
          userId: submission.userId,
          student: {
            name: `${submission.user.firstName} ${submission.user.lastName}`,
            email: submission.user.email,
            homeUniversity: data.homeUniversity || "",
            studyPeriod: data.studyPeriod || "",
          },
          location: {
            hostCity: data.hostCity || "",
            hostCountry: data.hostCountry || "",
            hostUniversity: data.hostUniversity || "",
            neighborhood: data.neighborhood || "",
            distanceToUniversity: data.distanceToUniversity || 0,
          },
          accommodationDetails: {
            housingType: data.housingType || "APARTMENT",
            monthlyRent: data.monthlyRent || 0,
            roomType: data.roomType || "SINGLE",
            privateBathroom: data.privateBathroom || false,
            amenities: data.amenities || [],
            furnished: data.furnished || false,
            utilitiesIncluded: data.utilitiesIncluded || false,
          },
          contactInfo: {
            landlordContact: data.landlordContact || "",
            deposit: data.deposit || 0,
            contractLength: data.contractLength || "",
          },
          studentExperience: {
            overallRating: data.overallRating || 0,
            cleanlinessRating: data.cleanlinessRating || 0,
            locationRating: data.locationRating || 0,
            valueRating: data.valueRating || 0,
            noiseLevel: data.noiseLevel || 0,
            safetyRating: data.safetyRating || 0,
            experienceDescription: data.experienceDescription || "",
            pros: data.pros || [],
            cons: data.cons || [],
            wouldRecommend: data.wouldRecommend || false,
          },
          submittedAt: submission.createdAt.toISOString(),
          status: submission.status,
        };
      });

      return res.status(200).json(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching accommodation submissions:", error);
      return res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
