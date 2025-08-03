import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { getSession } from "next-auth/react";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { id: storyId } = req.query;

  if (!storyId || typeof storyId !== "string") {
    return res.status(400).json({ error: "Story ID is required" });
  }

  const session = await getSession({ req });
  const userEmail = session?.user?.email;

  try {
    // Check if this is a FormSubmission ID, not a Story ID
    const formSubmission = await prisma.formSubmission.findUnique({
      where: { id: storyId },
    });

    if (!formSubmission) {
      return res.status(404).json({ error: "Story not found" });
    }

    let engagement = null;

    // If user is authenticated, get their engagement
    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (user) {
        // For now, return default engagement since FormSubmissions don't have engagement tracking
        engagement = {
          views: 0,
          likes: 0,
          comments: 0,
          rating: 0,
          liked: false,
          bookmarked: false,
        };
      }
    }

    return res.status(200).json({
      engagement: engagement || {
        views: 0,
        likes: 0,
        comments: 0,
        rating: 0,
        liked: false,
        bookmarked: false,
      },
    });
  } catch (error) {
    console.error("Error getting engagement:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
