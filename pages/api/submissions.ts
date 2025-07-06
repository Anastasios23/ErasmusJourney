import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession, isAdmin } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only GET requests are supported",
    });
  }

  // Check authentication
  const session = await getServerAuthSession(req, res);
  if (!session?.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please sign in to access submissions",
    });
  }

  // Check if user is admin - only admins can view all submissions
  if (!isAdmin(session)) {
    return res.status(403).json({
      error: "Authorization failed",
      message: "Admin access required to view all submissions",
    });
  }

  try {
    const submissions = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ submissions });
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch submissions. Please try again.",
    });
  }
}
