import { NextApiRequest, NextApiResponse } from "next";
import { TEST_FORM_SUBMISSIONS } from "./test-data/form-submissions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const { city, type } = req.query;

    let submissions = TEST_FORM_SUBMISSIONS;

    // Filter by city if specified
    if (city && typeof city === "string") {
      submissions = submissions.filter(
        (submission) =>
          submission.data.hostCity?.toLowerCase() === city.toLowerCase(),
      );
    }

    // Filter by type if specified
    if (type && typeof type === "string") {
      submissions = submissions.filter(
        (submission) => submission.type === type,
      );
    }

    return res.status(200).json(submissions);
  }

  if (req.method === "POST") {
    // Simulate adding a new submission
    const newSubmission = {
      id: `submission_${Date.now()}`,
      userId: "current_user",
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real app, you would save this to a database
    console.log("New submission received:", newSubmission);

    return res.status(201).json(newSubmission);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
