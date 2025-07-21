import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch all story submissions from database
    const stories = await prisma.formSubmission.findMany({
      where: {
        type: "STORY",
        status: "PUBLISHED", // Only show published stories
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to public story format, removing sensitive data
    const publicStories = stories.map((story) => {
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

      return {
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
        },
        period: safeData.exchangePeriod || safeData.year,
        tags: safeData.tags || [],
        likes: 0, // Placeholder for future like system
        views: 0, // Placeholder for future view system
        createdAt: story.createdAt.toISOString(),
        updatedAt: story.updatedAt.toISOString(),
      };
    });

    res.status(200).json({
      stories: publicStories,
      total: publicStories.length,
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
}
