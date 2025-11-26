import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

interface AccommodationData {
  city?: string;
  country?: string;
  university?: string;
  accommodationType?: string;
  monthlyRent?: string;
  billsIncluded?: string;
  avgUtilityCost?: string;
  accommodationAddress?: string;
  neighborhood?: string;
  accommodationRating?: string;
  easyToFind?: string;
  wouldRecommend?: string;
  landlordName?: string;
  landlordEmail?: string;
  landlordPhone?: string;
  bookingLink?: string;
  kitchenAccess?: string;
  internetIncluded?: string;
  laundryAccess?: string;
  parkingAvailable?: string;
  nearbyAmenities?: string[];
  transportLinks?: string;
  additionalNotes?: string;
  findingChallenges?: string;
}

interface BasicInfoData {
  hostCity?: string;
  hostCountry?: string;
  hostUniversity?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get accommodation submissions
    const accommodations = await prisma.form_submissions.findMany({
      where: {
        type: "ACCOMMODATION",
        status: "SUBMITTED",
      },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    // Get related basic info for location context
    const accommodationData = await Promise.all(
      accommodations.map(async (accommodation) => {
        const basicInfo = await prisma.form_submissions.findFirst({
          where: {
            userId: accommodation.userId,
            type: "BASIC_INFO",
            status: "SUBMITTED",
          },
        });

        return {
          id: accommodation.id,
          studentName: `${accommodation.user.firstName} ${accommodation.user.lastName}`,
          city:
            (basicInfo?.data as any)?.hostCity ||
            (accommodation.data as AccommodationData).city,
          country:
            (basicInfo?.data as any)?.hostCountry ||
            (accommodation.data as AccommodationData).country,
          university:
            (basicInfo?.data as BasicInfoData)?.hostUniversity ||
            (accommodation.data as AccommodationData).university,
          accommodationType: (accommodation.data as AccommodationData)
            .accommodationType,
          monthlyRent:
            parseFloat(
              (accommodation.data as AccommodationData).monthlyRent || "",
            ) || 0,
          billsIncluded:
            (accommodation.data as AccommodationData).billsIncluded === "yes",
          avgUtilityCost:
            parseFloat(
              (accommodation.data as AccommodationData).avgUtilityCost || "",
            ) || 0,
          address: (accommodation.data as AccommodationData)
            .accommodationAddress,
          neighborhood: (accommodation.data as AccommodationData).neighborhood,
          rating:
            parseInt(
              (accommodation.data as AccommodationData).accommodationRating ||
                "",
            ) || 3,
          easyToFind:
            (accommodation.data as AccommodationData).easyToFind === "yes",
          wouldRecommend:
            (accommodation.data as AccommodationData).wouldRecommend === "yes",
          landlordContact: {
            name: (accommodation.data as AccommodationData).landlordName,
            email: (accommodation.data as AccommodationData).landlordEmail,
            phone: (accommodation.data as AccommodationData).landlordPhone,
            bookingLink: (accommodation.data as AccommodationData).bookingLink,
          },
          facilities: {
            kitchenAccess: (accommodation.data as AccommodationData)
              .kitchenAccess,
            internetIncluded:
              (accommodation.data as AccommodationData).internetIncluded ===
              "yes",
            laundryAccess: (accommodation.data as AccommodationData)
              .laundryAccess,
            parkingAvailable:
              (accommodation.data as AccommodationData).parkingAvailable ===
              "yes",
          },
          nearbyAmenities:
            (accommodation.data as AccommodationData).nearbyAmenities || [],
          transportLinks: (accommodation.data as AccommodationData)
            .transportLinks,
          tips: (accommodation.data as AccommodationData).additionalNotes,
          challenges: (accommodation.data as AccommodationData)
            .findingChallenges,
          createdAt: accommodation.createdAt,
        };
      }),
    );

    // Filter and sort
    const validAccommodations = accommodationData
      .filter((acc) => acc.city && acc.country)
      .sort((a, b) => b.rating - a.rating);

    // Group by destination for summary stats
    const destinationStats = validAccommodations.reduce(
      (acc, accommodation) => {
        const key = `${accommodation.city}, ${accommodation.country}`;
        if (!acc[key]) {
          acc[key] = {
            city: accommodation.city,
            country: accommodation.country,
            accommodationCount: 0,
            avgRent: 0,
            avgRating: 0,
            types: new Set(),
          };
        }

        const stat = acc[key];
        stat.accommodationCount++;
        stat.avgRent =
          (stat.avgRent * (stat.accommodationCount - 1) +
            accommodation.monthlyRent) /
          stat.accommodationCount;
        stat.avgRating =
          (stat.avgRating * (stat.accommodationCount - 1) +
            accommodation.rating) /
          stat.accommodationCount;
        stat.types.add(accommodation.accommodationType);

        return acc;
      },
      {} as any,
    );

    res.status(200).json({
      accommodations: validAccommodations,
      destinationStats: Object.values(destinationStats).map((stat: any) => ({
        ...stat,
        types: Array.from(stat.types),
        avgRent: Math.round(stat.avgRent),
        avgRating: Math.round(stat.avgRating * 10) / 10,
      })),
    });
  } catch (error) {
    console.error("Error fetching accommodations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
