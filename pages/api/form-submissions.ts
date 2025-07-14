import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const { city, type } = req.query;

    try {
      // Fetch from real database
      let whereClause: any = {};

      // Filter by type if specified
      if (type && typeof type === "string") {
        whereClause.type = type;
      }

      let submissions = await prisma.formSubmission.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      });

      // Filter by city if specified (since this is JSON field, do it after fetch)
      if (city && typeof city === "string") {
        submissions = submissions.filter((submission) => {
          const data = submission.data as any;
          return data.hostCity?.toLowerCase() === city.toLowerCase();
        });
      }

      // Convert to format expected by frontend
      const formattedSubmissions = submissions.map((sub) => ({
        id: sub.id,
        userId: sub.userId,
        type: sub.type,
        title: sub.title,
        data: sub.data,
        status: sub.status,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString(),
      }));

      return res.status(200).json(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching form submissions:", error);
      return res.status(500).json({ error: "Failed to fetch submissions" });
    }
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
