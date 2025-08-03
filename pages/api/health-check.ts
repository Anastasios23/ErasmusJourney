import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

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
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} users in database`);

    // Test form submissions
    const submissionCount = await prisma.formSubmission.count();
    console.log(`Found ${submissionCount} form submissions in database`);

    // Test destinations
    const destinationCount = await prisma.destination.count();
    console.log(`Found ${destinationCount} destinations in database`);

    // Test custom destinations
    const customDestinationCount = await prisma.customDestination.count();
    console.log(`Found ${customDestinationCount} custom destinations in database`);

    res.status(200).json({
      status: "healthy",
      database: "connected",
      counts: {
        users: userCount,
        submissions: submissionCount,
        destinations: destinationCount,
        customDestinations: customDestinationCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
