import { NextApiRequest, NextApiResponse } from "next";
import { ContentIntegrationService } from "../../../src/services/contentIntegrationService";

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

    await ContentIntegrationService.trackContentInteraction(
      contentId,
      contentType,
      action,
      userId,
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error tracking content interaction:", error);
    res.status(500).json({ 
      message: "Failed to track interaction",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
