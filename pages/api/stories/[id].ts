import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid story ID" });
  }

  try {
    // Fetch specific story from database
    const story = await prisma.formSubmission.findFirst({
      where: {
        id: id,
        type: "STORY",
        status: "PUBLISHED", // Only show published stories
      },
    });

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    const data = story.data as any;

    // Remove any sensitive information
    const {
      grades,
      studentId,
      email,
      phoneNumber,
      address,
      passportNumber,
      personalDocument,
      emergencyContact,
      ...safeData
    } = data || {};

    // Transform to public story format
    const publicStory = {
      id: story.id,
      title: safeData.storyTitle || safeData.title || "Untitled Story",
      content: safeData.overallDescription || safeData.content || "",
      excerpt: safeData.overallDescription
        ? safeData.overallDescription.slice(0, 200) + "..."
        : safeData.content?.slice(0, 200) + "..." || "",
      imageUrl: safeData.imageUrl || safeData.photos?.[0]?.image || null,
      photos: safeData.photos || [],
      location: {
        city: safeData.hostCity || safeData.city,
        country: safeData.hostCountry || safeData.country,
        university: safeData.hostUniversity || safeData.university,
      },
      author: {
        name:
          [safeData.firstName, safeData.lastName].filter(Boolean).join(" ") ||
          "Anonymous",
        university: safeData.universityInCyprus || safeData.homeUniversity,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          [safeData.firstName, safeData.lastName].filter(Boolean).join(" ") ||
            "anonymous",
        )}`,
        bio: safeData.studentBio || "Erasmus student sharing experiences",
        program: safeData.studyProgram || safeData.academicProgram || "Student",
      },
      period: safeData.exchangePeriod || safeData.year,
      tags: safeData.tags || [],
      likes: 0, // Placeholder for future like system
      views: 0, // Placeholder for future view system
      comments: 0, // Placeholder for future comment system
      readingTime: Math.ceil(
        (safeData.overallDescription || safeData.content || "").split(" ")
          .length / 200,
      ), // Estimate reading time
      featured: false, // Could be based on likes/views in the future
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    };

    res.status(200).json(publicStory);
  } catch (error) {
    console.error("Error fetching story:", error);
    res.status(500).json({ error: "Failed to fetch story" });
  }
}
