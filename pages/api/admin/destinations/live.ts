import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";
import { getClientSafeErrorMessage } from "../../../../lib/databaseErrors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const liveDestinations = await prisma.publicDestinationReadModel.findMany({
      select: {
        slug: true,
        city: true,
        country: true,
        submissionCount: true,
        averageRent: true,
        updatedAt: true,
      },
      orderBy: [{ submissionCount: "desc" }, { updatedAt: "desc" }],
    });

    return res.status(200).json(liveDestinations);
  } catch (error) {
    console.error("Error loading live destinations:", error);
    return res.status(500).json({
      error: "Failed to load live destinations",
      details: getClientSafeErrorMessage(
        error,
        "Unable to load live destinations right now.",
      ),
    });
  }
}
