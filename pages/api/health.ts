import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma";

interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  message: string;
  timestamp: string;
  session?: {
    userId: string;
    email: string;
  } | null;
  database: {
    connected: boolean;
    latency?: number;
    error?: string;
    tables?: {
      users: number;
      universities: number;
      erasmusExperiences: number;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: "unhealthy",
      message: "Method not allowed",
      timestamp: new Date().toISOString(),
      database: { connected: false },
    });
  }

  const startTime = Date.now();

  try {
    // Test session
    const session = await getServerSession(req, res, authOptions);

    // Test database connection with a simple raw query first
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;

    // Get table counts to verify tables exist
    const [userCount, universityCount, experienceCount] = await Promise.all([
      prisma.users.count(),
      prisma.universities.count(),
      prisma.erasmusExperience.count(),
    ]);

    res.status(200).json({
      status: "healthy",
      message: "API health check passed",
      session: session
        ? {
            userId: session.user?.id || "",
            email: session.user?.email || "",
          }
        : null,
      database: {
        connected: true,
        latency,
        tables: {
          users: userCount,
          universities: universityCount,
          erasmusExperiences: experienceCount,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      message: "Health check failed",
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        latency,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
