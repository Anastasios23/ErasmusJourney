import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { prisma } from "../../lib/prisma"; // adjust path if your prisma client is elsewhere

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if user is admin (optional - comment out if all authenticated users should access)
  const user = session.user as any;
  if (user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const submissions = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ submissions });
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
