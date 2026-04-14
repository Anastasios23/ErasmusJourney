import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { getClientSafeErrorMessage } from "@/lib/databaseErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Test database connection
    console.log("Testing database connection...");

    // Test basic query
    const userCount = await prisma.users.count();
    console.log(`Found ${userCount} users in database`);

    // Canonical write model health
    const experienceCount = await prisma.erasmusExperience.count();
    console.log(`Found ${experienceCount} Erasmus experiences in database`);

    // Canonical public read model health
    const publicDestinationCount = await prisma.publicDestinationReadModel.count();
    console.log(
      `Found ${publicDestinationCount} public destination read-model rows in database`,
    );

    res.status(200).json({
      status: "healthy",
      database: "connected",
      counts: {
        users: userCount,
        erasmusExperiences: experienceCount,
        publicDestinationReadModel: publicDestinationCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      error: getClientSafeErrorMessage(error, "Service unavailable"),
      timestamp: new Date().toISOString(),
    });
  }
}
