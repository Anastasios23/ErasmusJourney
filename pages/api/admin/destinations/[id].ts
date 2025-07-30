import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (req.method === "PUT") {
    // Update destination
    try {
      const destinationData = req.body;

      // For now, we'll store custom destination data in a separate table
      // This allows admins to override the auto-generated data
      const customDestination = await prisma.customDestination.upsert({
        where: { destinationId: id as string },
        update: {
          data: destinationData,
          updatedAt: new Date(),
        },
        create: {
          destinationId: id as string,
          data: destinationData,
        },
      });

      return res.status(200).json({
        success: true,
        destination: customDestination,
      });
    } catch (error) {
      console.error("Error updating destination:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update destination",
      });
    }
  }

  if (req.method === "DELETE") {
    // Delete custom destination data (revert to auto-generated)
    try {
      await prisma.customDestination.delete({
        where: { destinationId: id as string },
      });

      return res.status(200).json({
        success: true,
        message: "Custom destination data deleted",
      });
    } catch (error) {
      console.error("Error deleting destination:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to delete destination",
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
