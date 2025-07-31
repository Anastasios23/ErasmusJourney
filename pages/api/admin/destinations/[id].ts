import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if user is admin
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid destination ID" });
  }

  if (req.method === "PUT") {
    // Update destination
    try {
      const {
        name,
        country,
        description,
        imageUrl,
        featured,
        highlights,
        climate,
        costOfLiving,
      } = req.body;

      // Convert highlights array to string if needed
      const highlightsString = Array.isArray(highlights)
        ? highlights.join(", ")
        : highlights;

      // Update the destination in the main Destination table
      const updatedDestination = await prisma.destination.update({
        where: { id },
        data: {
          name,
          country,
          description,
          imageUrl,
          featured,
          highlights: highlightsString,
          climate,
          costOfLiving,
          updatedAt: new Date(),
        },
      });

      return res.status(200).json({
        success: true,
        destination: updatedDestination,
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
    // Delete destination
    try {
      await prisma.destination.delete({
        where: { id },
      });

      return res.status(200).json({
        success: true,
        message: "Destination deleted successfully",
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
