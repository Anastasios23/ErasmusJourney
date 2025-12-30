import { prisma } from "../../lib/prisma";

export async function getAccommodationById(id: string) {
  try {
    // Fetch the accommodation submission from the database
    const submission = await prisma.form_submissions.findUnique({
      where: {
        id: id,
      },
      include: {
        users: {
          select: { firstName: true, lastName: true, email: false },
        },
      },
    });

    if (!submission || submission.type !== "ACCOMMODATION") {
      return null;
    }

    // Get related basic info for this user
    const basicInfo = await prisma.form_submissions.findFirst({
      where: {
        userId: submission.userId,
        type: "BASIC_INFO",
        status: "SUBMITTED",
      },
    });

    const accommodationData = submission.data as any;
    const basicInfoData = basicInfo?.data as any;

    // Format the accommodation data for the page
    return {
      id: submission.id,
      studentName: (submission as any).users?.firstName
        ? `${(submission as any).users.firstName} ${(submission as any).users.lastName?.charAt(0)}.`
        : "Anonymous Student",

      // Location info
      city:
        basicInfoData?.hostCity || accommodationData?.city || "Unknown City",
      country:
        basicInfoData?.hostCountry ||
        accommodationData?.country ||
        "Unknown Country",
      university:
        basicInfoData?.hostUniversity || accommodationData?.university,
      neighborhood: accommodationData?.neighborhood || "",
      address:
        accommodationData?.accommodationAddress ||
        accommodationData?.address ||
        "",

      // Accommodation details
      accommodationType: accommodationData?.accommodationType || "Unknown Type",
      monthlyRent: parseFloat(accommodationData?.monthlyRent) || 0,
      billsIncluded:
        accommodationData?.billsIncluded === "Yes" ||
        accommodationData?.billsIncluded === true,
      utilityCosts: parseFloat(accommodationData?.avgUtilityCost) || 0,

      // Ratings and evaluation
      rating: parseFloat(accommodationData?.accommodationRating) || 0,
      wouldRecommend:
        accommodationData?.wouldRecommend === "Yes" ||
        accommodationData?.wouldRecommend === true,

      // Experience details
      description:
        accommodationData?.additionalNotes || "No additional details provided.",
      tips: accommodationData?.additionalNotes || "",

      // Contact info (sanitized)
      contact: {
        email: null, // Don't expose emails directly
        allowContact: false,
      },

      // Required fields to match existing interface
      datePosted: submission.createdAt.toISOString(),
      highlights: [],
      facilities: [],
      nearbyAmenities: accommodationData?.nearbyAmenities || [],
      transportLinks: accommodationData?.transportLinks || "",
      photos: [],
      verified: false,
      featured: false,
      roomDetails: {
        bedrooms: 1,
        bathrooms: 1,
        totalArea: 0,
        furnished: true,
      },
      evaluation: {
        findingDifficulty: 3,
        wouldRecommend:
          accommodationData?.wouldRecommend === "Yes" ||
          accommodationData?.wouldRecommend === true,
        tips: accommodationData?.additionalNotes || "",
      },
      landlord: {
        name: accommodationData?.landlordName || "N/A",
        email: "Contact through platform",
        phone: "Contact through platform",
      },
    };
  } catch (error) {
    console.error("Error fetching accommodation:", error);
    return null;
  }
}

export async function getRelatedAccommodations(
  excludeId: string,
  limit: number = 3,
) {
  try {
    const relatedSubmissions = await prisma.form_submissions.findMany({
      where: {
        type: "ACCOMMODATION",
        status: "PUBLISHED",
        id: { not: excludeId },
      },
      include: {
        users: {
          select: { firstName: true, lastName: true },
        },
      },
      take: limit,
    });

    return await Promise.all(
      relatedSubmissions.map(async (sub) => {
        const relBasicInfo = await prisma.form_submissions.findFirst({
          where: {
            userId: sub.userId,
            type: "BASIC_INFO",
            status: "SUBMITTED",
          },
        });

        const relData = sub.data as any;
        const relBasicData = relBasicInfo?.data as any;

        return {
          id: sub.id,
          studentName: (sub as any).users?.firstName
            ? `${(sub as any).users.firstName} ${(sub as any).users.lastName?.charAt(0)}.`
            : "Anonymous Student",
          city: relBasicData?.hostCity || relData?.city || "Unknown City",
          country:
            relBasicData?.hostCountry || relData?.country || "Unknown Country",
          accommodationType: relData?.accommodationType || "Unknown Type",
          monthlyRent: parseFloat(relData?.monthlyRent) || 0,
          rating: parseFloat(relData?.accommodationRating) || 0,
          billsIncluded: relData?.billsIncluded,
          createdAt: sub.createdAt.toISOString(),
        };
      }),
    );
  } catch (error) {
    console.error("Error fetching related accommodations:", error);
    return [];
  }
}
