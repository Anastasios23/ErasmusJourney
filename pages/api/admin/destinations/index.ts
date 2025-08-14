import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where = status ? { status: status as string } : {};

      const [destinations, total] = await Promise.all([
        prisma.generatedDestination.findMany({
          where,
          include: {
            accommodations: {
              take: 3, // Preview of accommodations
              orderBy: { createdAt: "desc" },
            },
            courseExchanges: {
              take: 3, // Preview of course exchanges
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: Number(limit),
        }),
        prisma.generatedDestination.count({ where }),
      ]);

      res.status(200).json({
        destinations,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching admin destinations:", error);
      res.status(500).json({ error: "Failed to fetch destinations" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
