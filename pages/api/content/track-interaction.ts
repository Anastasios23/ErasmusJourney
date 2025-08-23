import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { contentId, contentType, action, userId } = req.body;

    if (!contentId || !contentType || !action) {
      return res.status(400).json({
        message: "Missing required fields: contentId, contentType, action"
      });
    }

    // Simple logging for now - no database operations to prevent performance issues
    console.log(`Content interaction tracked: ${action} on ${contentType} ${contentId} by user ${userId || "anonymous"}`);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error tracking content interaction:", error);
    res.status(500).json({
      message: "Failed to track interaction",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
