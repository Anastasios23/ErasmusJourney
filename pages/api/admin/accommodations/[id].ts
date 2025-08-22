import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    try {
      const { featured, visible, adminNotes } = req.body;

      const accommodation = await prisma.generatedAccommodation.update({
        where: { id: id as string },
        data: {
          ...(typeof featured === "boolean" && { featured }),
          ...(typeof visible === "boolean" && { visible }),
          ...(adminNotes !== undefined && { adminNotes }),
          updatedAt: new Date(),
        },
      });

      res.status(200).json(accommodation);
    } catch (error) {
      console.error("Error updating accommodation:", error);
      res.status(500).json({ error: "Failed to update accommodation" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.generatedAccommodation.delete({
        where: { id: id as string },
      });

      res.status(200).json({ message: "Accommodation deleted successfully" });
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      res.status(500).json({ error: "Failed to delete accommodation" });
    }
  } else {
    res.setHeader("Allow", ["PATCH", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
