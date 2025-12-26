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
    const whereClause: any = {};

    if (city) {
      whereClause.experience = {
        hostCity: {
          contains: city as string,
          mode: "insensitive",
        },
      };
    }

    if (country) {
      whereClause.experience = {
        ...whereClause.experience,
        hostCountry: {
          contains: country as string,
          mode: "insensitive",
        },
      };
    }

    if (universityId) {
      whereClause.universityId = universityId as string;
    }

    if (accommodationType) {
      whereClause.type = {
        contains: accommodationType as string,
        mode: "insensitive",
      };
    }

    // Query accommodation reviews with relations
    const reviews = await prisma.accommodationReview.findMany({
      where: whereClause,
      include: {
        experience: {
          include: {
            users: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            hostUniversity: {
              select: {
                name: true,
              },
            },
            homeUniversity: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format and send only public fields
    const accommodationExperiences = reviews.map((review) => {
      const experience = review.experience;
      const expData = (experience.experience as any) || {};
      const accomData = (experience.accommodation as any) || {};

      return {
        id: review.id,
        // Student info (anonymized)
        studentName: experience.users?.firstName
          ? `${experience.users.firstName} ${experience.users.lastName?.charAt(0)}.`
          : "Anonymous Student",

        // Accommodation details
        accommodationType: review.type || "Not specified",
        address: review.address || accomData.address,
        neighborhood: review.neighborhood || accomData.neighborhood,
        city: experience.hostCity || "Unknown City",
        country: experience.hostCountry || "Unknown Country",

        // Financial details
        monthlyRent: review.pricePerMonth || 0,
        billsIncluded: accomData.billsIncluded, // Still from JSON if not in model
        utilityCosts: accomData.utilityCosts || accomData.monthlyUtilities,
        depositAmount: accomData.depositAmount,

        // Rating and evaluation
        rating: review.rating || 0,
        wouldRecommend: accomData.wouldRecommend, // Still from JSON

        // Experience details - mapped from general experience if specific fields missing
        pros: accomData.pros
          ? [accomData.pros]
          : expData.bestExperience
            ? [expData.bestExperience]
            : [],
        cons: accomData.cons
          ? [accomData.cons]
          : expData.worstExperience
            ? [expData.worstExperience]
            : [],
        tips: expData.generalTips || accomData.tips,
        additionalNotes: review.comment || expData.generalTips,

        // Practical info
        facilities: accomData.facilities || {},
        transportLinks: accomData.transportLinks || accomData.transport,
        nearbyAmenities: accomData.nearbyAmenities || accomData.amenities || [],
        findingDifficulty: accomData.findingDifficulty,

        // Academic context
        university: experience.hostUniversity?.name || "Unknown University",
        universityInCyprus:
          experience.homeUniversity?.name || "Unknown University",

        // Metadata
        createdAt: review.createdAt,
        verified: true, // Assumed verified if it's in the review table
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
