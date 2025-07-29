import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid story ID" });
  }

  try {
    // Fetch the story
    const submission = await prisma.formSubmission.findFirst({
      where: {
        id: id,
        type: "EXPERIENCE",
        status: { in: ["SUBMITTED", "PUBLISHED"] },
      },
      include: {
        user: {
          select: { firstName: true },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Get basic info for location
    const basicInfo = await prisma.formSubmission.findFirst({
      where: {
        userId: submission.userId,
        type: "BASIC_INFO",
        status: "SUBMITTED",
      },
    });

    const studentName =
      (submission.data as any).nickname ||
      submission.user?.firstName ||
      "Anonymous";
    const city = (basicInfo?.data as any)?.hostCity || "Unknown City";
    const country = (basicInfo?.data as any)?.hostCountry || "Unknown Country";

    // Generate a simple SVG for Open Graph
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#3b82f6"/>
        <rect x="40" y="40" width="1120" height="550" fill="white" rx="20"/>
        
        <!-- Header -->
        <text x="80" y="120" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#1f2937">
          Erasmus Journey Story
        </text>
        
        <!-- Student Name -->
        <text x="80" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#3b82f6">
          ${studentName}'s Experience
        </text>
        
        <!-- Location -->
        <text x="80" y="280" font-family="Arial, sans-serif" font-size="36" fill="#6b7280">
          📍 ${city}, ${country}
        </text>
        
        <!-- Icon -->
        <circle cx="1000" cy="200" r="80" fill="#3b82f6" opacity="0.1"/>
        <text x="960" y="220" font-family="Arial, sans-serif" font-size="60">🎓</text>
        
        <!-- Footer -->
        <text x="80" y="520" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af">
          Read the full story at erasmusjourney.com
        </text>
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.status(200).send(svg);
  } catch (error) {
    console.error("Error generating OG image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
