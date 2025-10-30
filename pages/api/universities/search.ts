import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { q, type, country } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query required" });
    }

    // Build filter conditions
    const where: any = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { shortName: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ],
    };

    // Filter by country if provided
    if (country && typeof country === "string") {
      where.country = country;
    }

    // Filter by type if provided (Cyprus universities vs international)
    if (type === "cyprus") {
      where.country = "Cyprus";
    } else if (type === "international") {
      where.country = { not: "Cyprus" };
    }

    const universities = await prisma.universities.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        shortName: true,
        city: true,
        country: true,
        type: true,
      },
      take: 20, // Limit results
      orderBy: [{ country: "asc" }, { name: "asc" }],
    });

    return res.status(200).json(universities);
  } catch (error) {
    console.error("Error searching universities:", error);
    return res.status(500).json({ error: "Failed to search universities" });
  }
}
