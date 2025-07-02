import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface FormSubmission {
  id: string;
  userId: string;
  type:
    | "basic-info"
    | "course-matching"
    | "accommodation"
    | "story"
    | "experience";
  title: string;
  data: any;
  status: "draft" | "submitted" | "published";
  createdAt: string;
  updatedAt: string;
}

// In a real application, this would be stored in a database
// For now, we'll use in-memory storage (this will reset on server restart)
let formSubmissions: FormSubmission[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { type, title, data, status = "submitted" } = req.body;

    if (!type || !title || !data) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const submission: FormSubmission = {
      id: Date.now().toString(), // In production, use proper UUID
      userId: session.user?.email || "unknown",
      type,
      title,
      data,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    formSubmissions.push(submission);

    res.status(201).json({
      message: "Form submitted successfully",
      submissionId: submission.id,
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
