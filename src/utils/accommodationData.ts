import { prisma } from "../../lib/prisma";

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "yes" || normalized === "true";
  }

  return false;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function formatStudentName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  if (!firstName) {
    return "Anonymous Student";
  }

  const lastInitial = lastName?.charAt(0);
  return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
}

export async function getAccommodationById(id: string) {
  try {
    const experience = await prisma.erasmusExperience.findUnique({
      where: { id },
      include: {
        users: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!experience || !experience.accommodation) {
      return null;
    }

    const accommodationData =
      (experience.accommodation as Record<string, unknown>) ?? {};
    const basicInfoData = (experience.basicInfo as Record<string, unknown>) ?? {};

    return {
      id: experience.id,
      studentName: formatStudentName(
        experience.users?.firstName,
        experience.users?.lastName,
      ),
      city:
        experience.hostCity ||
        (basicInfoData.hostCity as string) ||
        (accommodationData.city as string) ||
        "Unknown City",
      country:
        experience.hostCountry ||
        (basicInfoData.hostCountry as string) ||
        (accommodationData.country as string) ||
        "Unknown Country",
      university:
        (basicInfoData.hostUniversity as string) ||
        (accommodationData.university as string) ||
        "Unknown University",
      neighborhood:
        (accommodationData.neighborhood as string) ||
        (accommodationData.area as string) ||
        "",
      address: "", // Keep private by default
      accommodationType:
        (accommodationData.accommodationType as string) || "Unknown Type",
      monthlyRent: toNumber(accommodationData.monthlyRent),
      billsIncluded: toBoolean(accommodationData.billsIncluded),
      utilityCosts: toNumber(accommodationData.avgUtilityCost),
      rating: toNumber(accommodationData.accommodationRating),
      wouldRecommend: toBoolean(accommodationData.wouldRecommend),
      description:
        (accommodationData.additionalNotes as string) ||
        "No additional details provided.",
      tips: (accommodationData.additionalNotes as string) || "",
      contact: {
        email: null,
        allowContact: false,
      },
      datePosted: (experience.submittedAt || experience.createdAt).toISOString(),
      highlights: [],
      facilities: [],
      nearbyAmenities: toStringArray(accommodationData.nearbyAmenities),
      transportLinks: (accommodationData.transportLinks as string) || "",
      photos: [],
      verified: experience.status === "APPROVED",
      featured: false,
      roomDetails: {
        bedrooms: 1,
        bathrooms: 1,
        totalArea: 0,
        furnished: true,
      },
      evaluation: {
        findingDifficulty: 3,
        wouldRecommend: toBoolean(accommodationData.wouldRecommend),
        tips: (accommodationData.additionalNotes as string) || "",
      },
      landlord: {
        name: "N/A",
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
    const candidates = await prisma.erasmusExperience.findMany({
      where: {
        status: "APPROVED",
        id: { not: excludeId },
      },
      include: {
        users: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: Math.max(limit * 3, limit),
    });

    return candidates
      .filter((experience) => Boolean(experience.accommodation))
      .slice(0, limit)
      .map((experience) => {
        const accommodationData =
          (experience.accommodation as Record<string, unknown>) ?? {};
        const basicInfoData =
          (experience.basicInfo as Record<string, unknown>) ?? {};

        return {
          id: experience.id,
          studentName: formatStudentName(
            experience.users?.firstName,
            experience.users?.lastName,
          ),
          city:
            experience.hostCity ||
            (basicInfoData.hostCity as string) ||
            (accommodationData.city as string) ||
            "Unknown City",
          country:
            experience.hostCountry ||
            (basicInfoData.hostCountry as string) ||
            (accommodationData.country as string) ||
            "Unknown Country",
          accommodationType:
            (accommodationData.accommodationType as string) || "Unknown Type",
          monthlyRent: toNumber(accommodationData.monthlyRent),
          rating: toNumber(accommodationData.accommodationRating),
          billsIncluded: toBoolean(accommodationData.billsIncluded),
          createdAt: (experience.submittedAt || experience.createdAt).toISOString(),
        };
      });
  } catch (error) {
    console.error("Error fetching related accommodations:", error);
    return [];
  }
}
