import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    try {
      const { featured, visible, adminNotes } = req.body;

      const courseExchange = await prisma.generatedCourseExchange.update({
        where: { id: id as string },
        data: {
          ...(typeof featured === "boolean" && { featured }),
          ...(typeof visible === "boolean" && { visible }),
          ...(adminNotes !== undefined && { adminNotes }),
          updatedAt: new Date(),
        },
      });

      res.status(200).json(courseExchange);
    } catch (error) {
      console.error("Error updating course exchange:", error);
      res.status(500).json({ error: "Failed to update course exchange" });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.generatedCourseExchange.delete({
        where: { id: id as string },
      });

      res.status(200).json({ message: "Course exchange deleted successfully" });
    } catch (error) {
      console.error("Error deleting course exchange:", error);
      res.status(500).json({ error: "Failed to delete course exchange" });
    }
  } else {
    res.setHeader("Allow", ["PATCH", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
