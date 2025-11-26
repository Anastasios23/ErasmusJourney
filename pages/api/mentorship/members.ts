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
    // Fetch all mentorship submissions from database
    const submissions = await prisma.form_submissions.findMany({
      where: {
        type: "MENTORSHIP",
        status: "PUBLISHED", // Only show public mentors
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform submissions into a public mentor format
    const mentors = submissions.map((submission) => {
      const data = submission.data as any;
      return {
        id: submission.id,
        userId: submission.userId,
        name:
          [submission.user.firstName, submission.user.lastName]
            .filter(Boolean)
            .join(" ") || "Anonymous Mentor",
        email: submission.user.email,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          [submission.user.firstName, submission.user.lastName]
            .filter(Boolean)
            .join(" ") || "Anonymous",
        )}`,
        tagline: data.funFact || "Eager to help the next generation!",
        specializations: data.specializations || [],
        languages: data.languagesSpoken || [],
        helpTopics: data.helpTopics || [],
        availability: data.availabilityLevel || "Medium",
        joinedAt: submission.createdAt.toISOString(),
      };
    });

    res.status(200).json({ mentors });
  } catch (error) {
    console.error("Error fetching mentorship members:", error);
    res.status(500).json({ error: "Failed to fetch mentorship members" });
  }
}
