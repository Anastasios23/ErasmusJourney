import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const destination = await prisma.generatedDestination.findUnique({
        where: { id: id as string },
        include: {
          accommodations: {
            orderBy: { createdAt: "desc" },
          },
          courseExchanges: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!destination) {
        return res.status(404).json({ error: "Destination not found" });
      }

      res.status(200).json(destination);
    } catch (error) {
      console.error("Error fetching destination:", error);
      res.status(500).json({ error: "Failed to fetch destination" });
    }
  } else if (req.method === "PATCH") {
    try {
      const {
        status,
        featured,
        adminTitle,
        adminDescription,
        adminImageUrl,
        adminHighlights,
        adminGeneralInfo,
      } = req.body;

      const destination = await prisma.generatedDestination.update({
        where: { id: id as string },
        data: {
          ...(status && { status }),
          ...(typeof featured === "boolean" && { featured }),
          ...(adminTitle && { adminTitle }),
          ...(adminDescription && { adminDescription }),
          ...(adminImageUrl && { adminImageUrl }),
          ...(adminHighlights && { adminHighlights }),
          ...(adminGeneralInfo && { adminGeneralInfo }),
          updatedAt: new Date(),
        },
        include: {
          accommodations: true,
          courseExchanges: true,
        },
      });

      res.status(200).json(destination);
    } catch (error) {
      console.error("Error updating destination:", error);
      res.status(500).json({ error: "Failed to update destination" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.generatedDestination.delete({
        where: { id: id as string },
      });

      res.status(200).json({ message: "Destination deleted successfully" });
    } catch (error) {
      console.error("Error deleting destination:", error);
      res.status(500).json({ error: "Failed to delete destination" });
    }
  } else {
    res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
