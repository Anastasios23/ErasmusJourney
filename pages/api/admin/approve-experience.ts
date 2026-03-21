import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import {
  getAccommodationTypeLabel,
  getBillsIncludedLabel,
  getDifficultyFindingAccommodationLabel,
  getHowFoundAccommodationLabel,
  sanitizeAccommodationStepData,
} from "../../../src/lib/accommodation";

interface AdminActionRequest {
  experienceId: string;
  action: "approve" | "reject";
  adminNotes?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { experienceId, action, adminNotes }: AdminActionRequest = req.body;

    if (!experienceId || !action) {
      return res
        .status(400)
        .json({ error: "Experience ID and action are required" });
    }

    // Get the experience
    const experience = await prisma.erasmusExperience.findUnique({
      where: { id: experienceId },
      include: { user: true },
    });

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    if (experience.status !== "SUBMITTED") {
      return res
        .status(400)
        .json({ error: "Experience must be submitted before admin action" });
    }

    if (action === "approve") {
      // Update experience to approved status
      const updatedExperience = await prisma.erasmusExperience.update({
        where: { id: experienceId },
        data: {
          adminApproved: true,
          adminNotes,
          status: "PUBLISHED", // Change status to published when approved
          publishedAt: new Date(),
        },
      });

      // Generate destination content automatically
      try {
        await generateDestinationContent(experienceId);

        return res.status(200).json({
          success: true,
          experience: updatedExperience,
          message: "Experience approved and destination content generated",
        });
      } catch (generateError) {
        console.error("Error generating destination content:", generateError);

        // Still return success for the approval, but note the generation error
        return res.status(200).json({
          success: true,
          experience: updatedExperience,
          message: "Experience approved but destination generation failed",
          generationError:
            generateError instanceof Error
              ? generateError.message
              : "Unknown error",
        });
      }
    } else if (action === "reject") {
      // Update experience to rejected status
      const updatedExperience = await prisma.erasmusExperience.update({
        where: { id: experienceId },
        data: {
          adminApproved: false,
          adminNotes,
          status: "REJECTED",
        },
      });

      return res.status(200).json({
        success: true,
        experience: updatedExperience,
        message: "Experience rejected",
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("Error handling admin action:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Function to generate destination content (calls the generate API internally)
async function generateDestinationContent(experienceId: string) {
  // Get the approved experience
  const experience = await prisma.erasmusExperience.findUnique({
    where: { id: experienceId },
    include: { user: true },
  });

  if (!experience) {
    throw new Error("Experience not found");
  }

  // Extract basic info for destination matching
  const basicInfo = experience.basicInfo as any;
  const city = basicInfo?.hostCity;
  const country = basicInfo?.hostCountry;

  if (!city || !country) {
    throw new Error("City and country information required");
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
        totalSubmissions: 0, // Will be updated below
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

  return destination;
}

async function generateAccommodationExperience(
  destinationId: string,
  experience: any,
  accommodationData: any,
) {
  const basicInfo = experience.basicInfo as any;
  const livingExpenses = experience.livingExpenses as any;
  const accommodation = sanitizeAccommodationStepData(accommodationData);

  // Extract accommodation details
  const accommodationType = accommodation.accommodationType
    ? getAccommodationTypeLabel(accommodation.accommodationType)
    : "Unknown";
  const neighborhood = accommodation.areaOrNeighborhood;
  const monthlyRent =
    accommodation.monthlyRent ||
    livingExpenses?.expenses?.accommodation;
  const structuredTips = [
    accommodation.billsIncluded
      ? `Bills included: ${getBillsIncludedLabel(accommodation.billsIncluded)}`
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
    typeof accommodation.wouldRecommend === "boolean"
      ? accommodation.wouldRecommend
        ? "Student would recommend it"
        : "Student would not recommend it"
      : null,
  ].filter(Boolean);

  // Create accommodation experience
  await prisma.generatedAccommodation.create({
    data: {
      destinationId,
      sourceExperienceId: experience.id,
      studentName: experience.user?.firstName || "Anonymous",
      accommodationType,
      neighborhood,
      monthlyRent: monthlyRent ? parseFloat(String(monthlyRent)) : null,
      title: `${accommodationType} in ${neighborhood || basicInfo?.hostCity}`,
      description:
        accommodation.accommodationReview || "Anonymous student accommodation snapshot",
      pros: null,
      cons: null,
      tips: structuredTips.length > 0 ? JSON.stringify(structuredTips) : null,
      bookingAdvice: null,
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
        coursesData.experience ||
        "Academic exchange experience",
      courseQuality: coursesData.courseQualityRating
        ? parseInt(coursesData.courseQualityRating)
        : null,
      professorQuality: coursesData.professorQualityRating
        ? parseInt(coursesData.professorQualityRating)
        : null,
      facilityQuality: coursesData.facilityQualityRating
        ? parseInt(coursesData.facilityQualityRating)
        : null,
      coursesEnrolled: coursesData.coursesEnrolled
        ? JSON.stringify(coursesData.coursesEnrolled)
        : null,
      creditsEarned: coursesData.creditsEarned
        ? parseInt(coursesData.creditsEarned)
        : null,
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
  const totalSubmissions = accommodations.length;

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
