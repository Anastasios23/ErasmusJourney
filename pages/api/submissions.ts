import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma"; // adjust path if your prisma client is elsewhere

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
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
