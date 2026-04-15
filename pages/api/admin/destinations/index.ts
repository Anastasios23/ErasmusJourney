import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../../auth/[...nextauth]";
import { getClientSafeErrorMessage } from "../../../../lib/databaseErrors";
import { prisma } from "../../../../lib/prisma";

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

    const destinations = await prisma.publicDestinationReadModel.findMany({
      select: {
        slug: true,
        city: true,
        country: true,
        submissionCount: true,
        averageRent: true,
        latestReportSubmittedAt: true,
      },
      orderBy: [
        { submissionCount: "desc" },
        { latestReportSubmittedAt: "desc" },
      ],
    });

    return res.status(200).json(destinations);
  } catch (error) {
    console.error("Error loading admin destinations:", error);
    return res.status(500).json({
      error: "Failed to load admin destinations",
      details: getClientSafeErrorMessage(
        error,
        "Unable to load admin destinations right now.",
      ),
    });
  }
}
