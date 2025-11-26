import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid story ID" });
  }

  if (req.method === "PATCH") {
    return handleUpdateStory(req, res, id);
  }

  if (req.method === "DELETE") {
    return handleDeleteStory(req, res, id);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleUpdateStory(
  req: NextApiRequest,
  res: NextApiResponse,
  storyId: string,
) {
  try {
    // In a real app, you'd verify admin authentication here
    const { status, moderatorNotes } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Validate status
    const validStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "PUBLISHED",
      "SUBMITTED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find the submission
    const submission = await prisma.form_submissions.findFirst({
      where: {
        id: storyId,
        type: "EXPERIENCE",
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Update the submission
    const updatedData = { ...(submission.data as any) };
    if (moderatorNotes) {
      updatedData.moderatorNotes = moderatorNotes;
    }

    const updatedSubmission = await prisma.form_submissions.update({
      where: {
        id: storyId,
      },
      data: {
        status: status,
        data: updatedData,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Story updated successfully",
      story: {
        id: updatedSubmission.id,
        status: updatedSubmission.status,
        moderatorNotes,
      },
    });
  } catch (error) {
    console.error("Error updating story:", error);
    res.status(500).json({
      error: "Failed to update story",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function handleDeleteStory(
  req: NextApiRequest,
  res: NextApiResponse,
  storyId: string,
) {
  try {
    // In a real app, you'd verify admin authentication here

    // Find the submission
    const submission = await prisma.form_submissions.findFirst({
      where: {
        id: storyId,
        type: "EXPERIENCE",
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Soft delete by updating status instead of actually deleting
    await prisma.form_submissions.update({
      where: {
        id: storyId,
      },
      data: {
        status: "DELETED",
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({
      error: "Failed to delete story",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
