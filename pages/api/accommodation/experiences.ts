import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import {
  getAccommodationTypeLabel,
  getBillsIncludedLabel,
  getDifficultyFindingAccommodationLabel,
  getHowFoundAccommodationLabel,
  sanitizeAccommodationStepData,
} from "../../../src/lib/accommodation";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { city, country, universityId, accommodationType } = req.query;
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

    const accommodationExperiences = reviews.map((review) => {
      const experience = review.experience;
      const expData = (experience.experience as any) || {};
      const accommodation = sanitizeAccommodationStepData(
        experience.accommodation as any,
      );
      const accommodationTypeCode =
        review.type || accommodation.accommodationType;
      const structuredTips = [
        accommodation.billsIncluded
          ? `Bills included: ${getBillsIncludedLabel(
              accommodation.billsIncluded,
            )}`
          : null,
        accommodation.minutesToUniversity !== undefined
          ? `${accommodation.minutesToUniversity} minutes to university`
          : null,
        accommodation.howFoundAccommodation
          ? `Found via ${getHowFoundAccommodationLabel(
              accommodation.howFoundAccommodation,
            )}`
          : null,
        accommodation.difficultyFindingAccommodation
          ? `Finding difficulty: ${getDifficultyFindingAccommodationLabel(
              accommodation.difficultyFindingAccommodation,
            )}`
          : null,
      ]
        .filter(Boolean)
        .join(" | ");

      return {
        id: review.id,
        studentName: experience.users?.firstName
          ? `${experience.users.firstName} ${experience.users.lastName?.charAt(0)}.`
          : "Anonymous Student",
        accommodationType: accommodationTypeCode
          ? getAccommodationTypeLabel(accommodationTypeCode)
          : "Not specified",
        accommodationTypeCode: accommodationTypeCode || null,
        neighborhood: review.neighborhood || accommodation.areaOrNeighborhood,
        city: experience.hostCity || "Unknown City",
        country: experience.hostCountry || "Unknown Country",
        monthlyRent: review.pricePerMonth || accommodation.monthlyRent || 0,
        currency: review.currency || accommodation.currency || "EUR",
        billsIncluded: accommodation.billsIncluded,
        minutesToUniversity: accommodation.minutesToUniversity,
        howFoundAccommodation: accommodation.howFoundAccommodation,
        difficultyFindingAccommodation:
          accommodation.difficultyFindingAccommodation,
        rating: review.rating || accommodation.accommodationRating || 0,
        wouldRecommend: accommodation.wouldRecommend,
        pros: expData.bestExperience ? [expData.bestExperience] : [],
        cons: expData.worstExperience ? [expData.worstExperience] : [],
        tips: expData.generalTips || structuredTips || undefined,
        additionalNotes:
          accommodation.accommodationReview ||
          review.comment ||
          structuredTips ||
          expData.generalTips,
        findingDifficulty: accommodation.difficultyFindingAccommodation,
        university: experience.hostUniversity?.name || "Unknown University",
        universityInCyprus:
          experience.homeUniversity?.name || "Unknown University",
        createdAt: review.createdAt,
        verified: true,
      };
    });

    return res.status(200).json({
      accommodations: accommodationExperiences,
      total: accommodationExperiences.length,
    });
  } catch (error) {
    console.error("Error fetching accommodation experiences:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch accommodation experiences" });
  }
}
