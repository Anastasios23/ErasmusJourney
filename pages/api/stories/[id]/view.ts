import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { id: storyId } = req.query;

  if (!storyId || typeof storyId !== "string") {
    return res.status(400).json({ error: "Story ID is required" });
  }

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  try {
    // Check if the story (form submission) exists
    const story = await prisma.formSubmission.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    // For anonymous users, we can still track views but without user association
    if (!userId) {
      // For now, just return success for anonymous views
      // In a real app, you might want to track anonymous views differently
      return res.status(200).json({ success: true });
    }

    // Check if user already has an engagement record for this story
    const existingEngagement = await prisma.engagement.findFirst({
      where: {
        storyId,
        userId,
      },
    });

    if (existingEngagement) {
      // Increment view count and update last viewed
      const updatedEngagement = await prisma.engagement.update({
        where: { id: existingEngagement.id },
        data: {
          views: { increment: 1 },
          lastViewed: new Date(),
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({ 
        success: true, 
        views: updatedEngagement.views 
      });
    } else {
      // Create new engagement record with first view
      const newEngagement = await prisma.engagement.create({
        data: {
          storyId,
          userId,
          liked: false,
          bookmarked: false,
          views: 1,
          rating: 0,
          lastViewed: new Date(),
        },
      });

      return res.status(200).json({ 
        success: true, 
        views: newEngagement.views 
      });
    }
  } catch (error) {
    console.error("Error incrementing story view:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
