import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("🔍 Testing database access...");

    // Get basic info submissions
    const basicInfoSubmissions = await prisma.form_submissions.findMany({
      where: {
        type: "BASIC_INFO",
      },
      select: {
        id: true,
        data: true,
        createdAt: true,
      },
      take: 5, // Only get first 5 for testing
    });

    console.log(`Found ${basicInfoSubmissions.length} BASIC_INFO submissions`);

    // Extract destinations
    const destinations = basicInfoSubmissions
      .filter((sub) => sub.data && typeof sub.data === "object")
      .map((sub) => {
        const data = sub.data as any;
        return {
          id: sub.id,
          city: data.hostCity,
          country: data.hostCountry,
          university: data.hostUniversity,
          createdAt: sub.createdAt,
        };
      })
      .filter((dest) => dest.city && dest.country);

    console.log("Extracted destinations:", destinations);

    return res.status(200).json({
      success: true,
      submissionCount: basicInfoSubmissions.length,
      destinations,
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
