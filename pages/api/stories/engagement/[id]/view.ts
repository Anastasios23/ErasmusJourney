import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { getSession } from "next-auth/react";

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

  const session = await getSession({ req });
  const userEmail = session?.user?.email;

  try {
    // Increment view count for the story
    await prisma.story.update({
      where: { id: storyId },
      data: {
        views: { increment: 1 },
      },
    });

    // If user is authenticated, track their view engagement
    if (userEmail) {
      // Find user first
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (user) {
        const existingEngagement = await prisma.engagement.findFirst({
          where: {
            storyId,
            userId: user.id,
          },
        });

        if (existingEngagement) {
          // Update existing engagement
          await prisma.engagement.update({
            where: { id: existingEngagement.id },
            data: {
              views: { increment: 1 },
              lastViewed: new Date(),
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new engagement
          await prisma.engagement.create({
            data: {
              storyId,
              userId: user.id,
              views: 1,
              likes: 0,
              comments: 0,
              rating: 0,
              liked: false,
              bookmarked: false,
              lastViewed: new Date(),
            },
          });
        }
      }
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error incrementing view:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
