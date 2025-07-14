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
    // Fetch all mentorship submissions from database - use EXPERIENCE type for now
    const allSubmissions = await prisma.formSubmission.findMany({
      where: {
        type: "EXPERIENCE",
        status: "PUBLISHED", // Only show public mentors
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            universityInCyprus: true,
            studyProgram: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter to only mentorship submissions
    const mentorshipSubmissions = allSubmissions.filter((submission) => {
      const data = submission.data as any;
      return data.submissionType === "mentorship";
    });

    // Transform to public mentor format, removing sensitive data
    const publicMentors = mentorshipSubmissions.map((submission) => {
      const data = submission.data as any;

      // Only include mentors who want to help and have public profiles
      if (data.wantToHelp !== "yes" || data.publicProfile !== "yes") {
        return null;
      }

      // Remove any sensitive information
      const {
        phoneNumber, // Keep private unless specifically allowed
        personalWebsite,
        ...safeContactData
      } = data;

      const contactInfo: any = {
        email: data.allowPublicContact === "yes" ? data.email : null,
      };

      // Add social media links if provided
      if (data.instagramUsername)
        contactInfo.instagram = data.instagramUsername;
      if (data.facebookLink) contactInfo.facebook = data.facebookLink;
      if (data.linkedinProfile) contactInfo.linkedin = data.linkedinProfile;
      if (data.personalWebsite) contactInfo.website = data.personalWebsite;

      // Add phone if they allow public contact
      if (data.allowPublicContact === "yes" && data.phoneNumber) {
        contactInfo.phone = data.phoneNumber;
      }

      return {
        id: submission.id,
        name:
          data.nickname ||
          [submission.user?.firstName, submission.user?.lastName]
            .filter(Boolean)
            .join(" ") ||
          "Anonymous Mentor",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          submission.id,
        )}`,
        bio:
          data.additionalAdvice || "Experienced Erasmus student ready to help!",
        funFact: data.funFact || null,

        // Academic information
        universityInCyprus:
          submission.user?.universityInCyprus || "University in Cyprus",
        studyProgram:
          submission.user?.studyProgram ||
          data.specializations?.[0] ||
          "Student",

        // Host experience information - extract from form data or user profile
        hostUniversity: data.hostUniversity || "Various Universities",
        hostCity: data.hostCity || "Multiple Cities",
        hostCountry: data.hostCountry || "Europe",
        exchangePeriod: data.exchangePeriod || "Recent",

        // Mentor specializations
        specializations: data.specializations || [],
        helpTopics: data.helpTopics || [],
        languagesSpoken: data.languagesSpoken || ["English"],

        // Availability
        availabilityLevel: data.availabilityLevel || "moderate",
        responseTime: data.responseTime || "within-week",
        preferredContactTime: data.preferredContactTime || "flexible",

        // Contact information (filtered)
        contactInfo,
        contactMethod: data.contactMethod || "email",

        // Mentor experience
        mentorshipExperience: data.mentorshipExperience || null,

        // Metadata
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
      };
    });

    // Filter out null entries (mentors who don't want public profiles)
    const activeMentors = publicMentors.filter((mentor) => mentor !== null);

    res.status(200).json({
      mentors: activeMentors,
      total: activeMentors.length,
    });
  } catch (error) {
    console.error("Error fetching mentorship members:", error);
    res.status(500).json({ error: "Failed to fetch mentorship members" });
  }
}
