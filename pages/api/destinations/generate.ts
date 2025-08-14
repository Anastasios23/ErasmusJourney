import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface GenerateDestinationRequest {
  experienceId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { experienceId }: GenerateDestinationRequest = req.body;

    if (!experienceId) {
      return res.status(400).json({ error: "Experience ID is required" });
    }

    // Get the approved experience
    const experience = await prisma.erasmusExperience.findUnique({
      where: { id: experienceId },
      include: { user: true },
    });

    if (!experience || experience.status !== "SUBMITTED") {
      return res
        .status(400)
        .json({ error: "Experience not found or not submitted" });
    }

    // Extract basic info for destination matching
    const basicInfo = experience.basicInfo as any;
    const city = basicInfo?.hostCity;
    const country = basicInfo?.hostCountry;

    if (!city || !country) {
      return res
        .status(400)
        .json({ error: "City and country information required" });
    }

    // Generate slug for URLs
    const slug = `${city.toLowerCase().replace(/\s+/g, "-")}-${country.toLowerCase().replace(/\s+/g, "-")}`;

    // Find or create GeneratedDestination
    let destination = await prisma.generatedDestination.findUnique({
      where: { slug },
    });

    if (!destination) {
      // Create new destination
      destination = await prisma.generatedDestination.create({
        data: {
          slug,
          city,
          country,
          totalSubmissions: 1,
          status: "PUBLISHED", // Auto-publish with first submission
        },
      });
    }

    // Generate accommodation experience if data exists
    const accommodationData = experience.accommodation as any;
    if (accommodationData && Object.keys(accommodationData).length > 0) {
      await generateAccommodationExperience(
        destination.id,
        experience,
        accommodationData,
      );
    }

    // Generate course exchange experience if data exists
    const coursesData = experience.courses as any;
    if (coursesData && Object.keys(coursesData).length > 0) {
      await generateCourseExchangeExperience(
        destination.id,
        experience,
        coursesData,
      );
    }

    // Update destination aggregated data
    await updateDestinationAggregates(destination.id);

    // Update partnership tracking
    await updatePartnershipTracking(experience);

    return res.status(200).json({
      success: true,
      destination,
      message: "Destination content generated successfully",
    });
  } catch (error) {
    console.error("Error generating destination content:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function generateAccommodationExperience(
  destinationId: string,
  experience: any,
  accommodationData: any,
) {
  const basicInfo = experience.basicInfo as any;
  const livingExpenses = experience.livingExpenses as any;

  // Extract accommodation details
  const accommodationType = accommodationData.accommodationType || "Unknown";
  const neighborhood = accommodationData.location || accommodationData.area;
  const monthlyRent =
    accommodationData.monthlyRent || livingExpenses?.expenses?.accommodation;

  // Create accommodation experience
  await prisma.generatedAccommodation.create({
    data: {
      destinationId,
      sourceExperienceId: experience.id,
      studentName: experience.user?.firstName || "Anonymous",
      accommodationType,
      neighborhood,
      monthlyRent: monthlyRent ? parseFloat(monthlyRent) : null,
      title: `${accommodationType} in ${neighborhood || basicInfo?.hostCity}`,
      description:
        accommodationData.personalExperience ||
        accommodationData.description ||
        "Student accommodation experience",
      pros: accommodationData.positiveAspects
        ? JSON.stringify(accommodationData.positiveAspects)
        : null,
      cons: accommodationData.negativeAspects
        ? JSON.stringify(accommodationData.negativeAspects)
        : null,
      tips: accommodationData.tips
        ? JSON.stringify(accommodationData.tips)
        : null,
      bookingAdvice:
        accommodationData.bookingProcess || accommodationData.howToBook,
    },
  });
}

async function generateCourseExchangeExperience(
  destinationId: string,
  experience: any,
  coursesData: any,
) {
  const basicInfo = experience.basicInfo as any;

  // Extract course details
  const hostUniversity = basicInfo?.hostUniversity || "Unknown University";
  const fieldOfStudy = basicInfo?.fieldOfStudy || coursesData.fieldOfStudy;
  const studyLevel = basicInfo?.studyLevel || coursesData.studyLevel;

  // Create course exchange experience
  await prisma.generatedCourseExchange.create({
    data: {
      destinationId,
      sourceExperienceId: experience.id,
      studentName: experience.user?.firstName || "Anonymous",
      hostUniversity,
      fieldOfStudy,
      studyLevel,
      semester: basicInfo?.semester,
      title: `${fieldOfStudy || "Exchange"} at ${hostUniversity}`,
      description:
        coursesData.academicExperience ||
        coursesData.overallExperience ||
        "Academic exchange experience",
      courseQuality: coursesData.courseQualityRating,
      professorQuality: coursesData.professorQualityRating,
      facilityQuality: coursesData.facilityQualityRating,
      coursesEnrolled: coursesData.coursesEnrolled
        ? JSON.stringify(coursesData.coursesEnrolled)
        : null,
      creditsEarned: coursesData.creditsEarned,
      language: coursesData.languageOfInstruction || "English",
      academicChallenges: coursesData.challenges,
      academicHighlights: coursesData.highlights,
      tips: coursesData.academicTips
        ? JSON.stringify(coursesData.academicTips)
        : null,
    },
  });
}

async function updateDestinationAggregates(destinationId: string) {
  // Get all experiences for this destination
  const accommodations = await prisma.generatedAccommodation.findMany({
    where: { destinationId },
  });

  const courseExchanges = await prisma.generatedCourseExchange.findMany({
    where: { destinationId },
  });

  // Calculate averages
  const totalSubmissions = accommodations.length + courseExchanges.length;

  const averageRent =
    accommodations.length > 0
      ? accommodations
          .filter((acc) => acc.monthlyRent)
          .reduce((sum, acc) => sum + (acc.monthlyRent || 0), 0) /
        accommodations.filter((acc) => acc.monthlyRent).length
      : null;

  const averageCourseQuality =
    courseExchanges.length > 0
      ? courseExchanges
          .filter((course) => course.courseQuality)
          .reduce((sum, course) => sum + (course.courseQuality || 0), 0) /
        courseExchanges.filter((course) => course.courseQuality).length
      : null;

  // Update destination with calculated data
  await prisma.generatedDestination.update({
    where: { id: destinationId },
    data: {
      totalSubmissions,
      averageAccommodationCost: averageRent,
      averageRating: averageCourseQuality,
      lastCalculated: new Date(),
    },
  });
}

async function updatePartnershipTracking(experience: any) {
  const basicInfo = experience.basicInfo as any;

  const homeUniversity = basicInfo?.homeUniversity || "Unknown";
  const partnerUniversity = basicInfo?.hostUniversity || "Unknown";
  const partnerCity = basicInfo?.hostCity || "Unknown";
  const partnerCountry = basicInfo?.hostCountry || "Unknown";

  // Find or create partnership tracking record
  const existing = await prisma.partnershipTracking.findUnique({
    where: {
      homeUniversityName_partnerUniversityName_partnerCity: {
        homeUniversityName: homeUniversity,
        partnerUniversityName: partnerUniversity,
        partnerCity: partnerCity,
      },
    },
  });

  if (existing) {
    // Update existing tracking
    await prisma.partnershipTracking.update({
      where: { id: existing.id },
      data: {
        totalSubmissions: existing.totalSubmissions + 1,
        lastSubmissionDate: new Date(),
      },
    });
  } else {
    // Create new tracking record
    await prisma.partnershipTracking.create({
      data: {
        homeUniversityName: homeUniversity,
        partnerUniversityName: partnerUniversity,
        partnerCity,
        partnerCountry,
        totalSubmissions: 1,
        lastSubmissionDate: new Date(),
      },
    });
  }
}
