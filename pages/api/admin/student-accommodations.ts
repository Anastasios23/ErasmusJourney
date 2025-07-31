import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if user is admin
  const session = await getSession({ req });
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      // Fetch published accommodations from the Accommodation model
      const accommodations = await prisma.accommodation.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform for admin view
      const formattedAccommodations = accommodations.map((accommodation) => ({
        id: accommodation.id,
        title: accommodation.name,
        location: `${accommodation.city}, ${accommodation.country}`,
        rent: accommodation.pricePerMonth,
        type: accommodation.type,
        description: accommodation.description,
        updatedAt: accommodation.updatedAt.toISOString(),
        isActive: accommodation.isActive,
      }));

      return res.status(200).json(formattedAccommodations);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      return res.status(500).json({ error: "Failed to fetch accommodations" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
