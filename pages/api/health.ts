import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Test session
    const session = await getServerSession(req, res, authOptions);
    console.log("Session test:", session ? "Session found" : "No session");

    // Test database connection
    const userCount = await prisma.user.count();
    console.log("Database test - user count:", userCount);

    // Test form submission count
    const submissionCount = await prisma.form_submissions.count();
    console.log("Database test - submission count:", submissionCount);

    res.status(200).json({
      message: "API health check passed",
      session: session
        ? {
            userId: session.user?.id,
            email: session.user?.email,
          }
        : null,
      database: {
        connected: true,
        userCount,
        submissionCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
}
