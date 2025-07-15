import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Optionally accept filters from query params
    const { city, country, universityId, accommodationType } = req.query;

    // Build where clause for filtering
    const whereClause: any = {
      type: "ACCOMMODATION",
      status: "PUBLISHED", // Only show published submissions
    };

    // Query all accommodation submissions
    const submissions = await prisma.formSubmission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: false, // Don't expose email
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by query params if provided (since Prisma doesn't support JSON filtering easily)
    let filteredSubmissions = submissions;

    if (city) {
      filteredSubmissions = filteredSubmissions.filter(
        (sub) =>
          sub.data &&
          (sub.data as any).city
            ?.toLowerCase()
            .includes((city as string).toLowerCase()),
      );
    }

    if (country) {
      filteredSubmissions = filteredSubmissions.filter(
        (sub) =>
          sub.data &&
          (sub.data as any).country
            ?.toLowerCase()
            .includes((country as string).toLowerCase()),
      );
    }

    if (accommodationType) {
      filteredSubmissions = filteredSubmissions.filter(
        (sub) =>
          sub.data &&
          (sub.data as any).accommodationType
            ?.toLowerCase()
            .includes((accommodationType as string).toLowerCase()),
      );
    }

    // Format and send only public fields
    const accommodationExperiences = filteredSubmissions.map((sub) => {
      const data = sub.data as any;
      return {
        id: sub.id,
        // Student info (anonymized)
        studentName: sub.user?.firstName
          ? `${sub.user.firstName} ${sub.user.lastName?.charAt(0)}.`
          : "Anonymous Student",

        // Accommodation details
        accommodationType: data.accommodationType || "Not specified",
        address: data.accommodationAddress || data.address,
        neighborhood: data.neighborhood,
        city: data.city,
        country: data.country,

        // Financial details
        monthlyRent: data.monthlyRent || data.monthlyRate,
        billsIncluded: data.billsIncluded,
        utilityCosts: data.utilityCosts || data.monthlyUtilities,
        depositAmount: data.depositAmount,

        // Rating and evaluation
        rating: data.accommodationRating || data.overallRating,
        wouldRecommend: data.wouldRecommend,

        // Experience details
        pros: data.accommodationPros || data.pros,
        cons: data.accommodationCons || data.cons,
        tips: data.accommodationTips || data.tips,
        additionalNotes: data.additionalNotes || data.notes,

        // Practical info
        facilities: data.facilities || [],
        transportLinks: data.transportLinks || data.transport,
        nearbyAmenities: data.nearbyAmenities || data.amenities,
        findingDifficulty: data.findingDifficulty,

        // Academic context
        university: data.hostUniversity || data.university,
        universityInCyprus: data.universityInCyprus,

        // Metadata
        createdAt: sub.createdAt,
        verified: data.verified || false,
      };
    });

    res.status(200).json({
      accommodations: accommodationExperiences,
      total: accommodationExperiences.length,
    });
  } catch (error) {
    console.error("Error fetching accommodation experiences:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch accommodation experiences" });
  }
}
