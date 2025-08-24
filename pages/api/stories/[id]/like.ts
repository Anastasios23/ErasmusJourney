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

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // Check if the story (form submission) exists
    const story = await prisma.formSubmission.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    // Check if user already has an engagement record for this story
    const existingEngagement = await prisma.storyEngagement.findFirst({
      where: {
        storyId,
        userId,
      },
    });

    if (existingEngagement) {
      // Toggle like status
      const updatedEngagement = await prisma.storyEngagement.update({
        where: { id: existingEngagement.id },
        data: {
          liked: !existingEngagement.liked,
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({ 
        success: true, 
        liked: updatedEngagement.liked 
      });
    } else {
      // Create new engagement record with like
      const newEngagement = await prisma.storyEngagement.create({
        data: {
          storyId,
          userId,
          liked: true,
          bookmarked: false,
          views: 0,
          rating: 0,
          lastViewed: new Date(),
        },
      });

      return res.status(200).json({ 
        success: true, 
        liked: newEngagement.liked 
      });
    }
  } catch (error) {
    console.error("Error toggling story like:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
