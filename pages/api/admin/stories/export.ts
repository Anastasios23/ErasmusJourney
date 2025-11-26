import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // In a real app, you'd verify admin authentication here

    const stories = await prisma.form_submissions.findMany({
      where: {
        type: "EXPERIENCE",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for CSV export
    const csvData = await Promise.all(
      stories.map(async (submission) => {
        const basicInfo = await prisma.form_submissions.findFirst({
          where: {
            userId: submission.userId,
            type: "BASIC_INFO",
            status: "SUBMITTED",
          },
        });

        const data = submission.data as any;
        const basicData = basicInfo?.data as any;

        return {
          ID: submission.id,
          "Student Name":
            data.nickname || submission.user?.firstName || "Anonymous",
          "User Email": submission.user?.email || "N/A",
          University: basicData?.hostUniversity || "Unknown University",
          City: basicData?.hostCity || "Unknown City",
          Country: basicData?.hostCountry || "Unknown Country",
          Department: basicData?.department || "Unknown Department",
          "Level of Study": basicData?.levelOfStudy || "Unknown",
          "Exchange Period": basicData?.exchangePeriod || "Unknown",
          Story:
            data.experienceDescription || data.story || "No story provided",
          Tips: Array.isArray(data.tips)
            ? data.tips.join("; ")
            : data.tips || "",
          "Help Topics": Array.isArray(data.helpTopics)
            ? data.helpTopics.join("; ")
            : data.helpTopics || "",
          "Contact Method": data.contactPreference || "None",
          "Contact Info": data.contactInfo || "N/A",
          "Accommodation Tips": data.accommodationTips || "N/A",
          "Budget Tips": data.budgetTips
            ? JSON.stringify(data.budgetTips)
            : "N/A",
          Status: submission.status || "PENDING",
          "Is Public": data.sharePublicly === true ? "Yes" : "No",
          "Created At": submission.createdAt.toISOString(),
          "Updated At": submission.updatedAt.toISOString(),
          "Moderator Notes": data.moderatorNotes || "None",
        };
      }),
    );

    // Convert to CSV format
    if (csvData.length === 0) {
      return res.status(200).send("No data available");
    }

    const headers = Object.keys(csvData[0]);
    const csvRows = [
      headers.join(","), // Header row
      ...csvData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row] || "";
            // Escape commas and quotes in CSV
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(","),
      ),
    ];

    const csvContent = csvRows.join("\n");

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="student-stories-export-${new Date().toISOString().split("T")[0]}.csv"`,
    );

    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting stories:", error);
    res.status(500).json({
      error: "Failed to export stories",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
