import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please sign in to view submissions",
    });
  }

  try {
    const { basicInfoId } = req.query;

    let whereClause: any = {
      userId: session.user.id,
    };

    // If basicInfoId is provided, get all submissions linked to it
    if (basicInfoId && typeof basicInfoId === "string") {
      whereClause = {
        OR: [
          // The basic info submission itself
          {
            id: basicInfoId,
            userId: session.user.id,
            type: "BASIC_INFO",
          },
          // Submissions linked to this basic info
          {
            userId: session.user.id,
            data: {
              path: ["_basicInfoId"],
              equals: basicInfoId,
            },
          },
        ],
      };
    }

    const submissions = await prisma.formSubmission.findMany({
      where: whereClause,
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

    // Group submissions by basic info ID for easier processing
    const groupedSubmissions: Record<string, any[]> = {};
    const standaloneSubmissions: any[] = [];

    submissions.forEach((submission) => {
      const basicInfoRef = (submission.data as any)?._basicInfoId;

      if (submission.type === "BASIC_INFO") {
        // This is a basic info submission - create a group for it
        if (!groupedSubmissions[submission.id]) {
          groupedSubmissions[submission.id] = [];
        }
        groupedSubmissions[submission.id].unshift(submission); // Put basic info first
      } else if (basicInfoRef) {
        // This submission is linked to a basic info
        if (!groupedSubmissions[basicInfoRef]) {
          groupedSubmissions[basicInfoRef] = [];
        }
        groupedSubmissions[basicInfoRef].push(submission);
      } else {
        // Standalone submission
        standaloneSubmissions.push(submission);
      }
    });

    // Calculate completion status for each group
    const submissionGroups = Object.entries(groupedSubmissions).map(
      ([basicInfoId, submissions]) => {
        const basicInfo = submissions.find((s) => s.type === "BASIC_INFO");
        const linkedSubmissions = submissions.filter(
          (s) => s.type !== "BASIC_INFO",
        );

        const formTypes = [
          "LIVING_EXPENSES",
          "ACCOMMODATION",
          "COURSE_MATCHING",
          "EXPERIENCE",
        ];
        const completedTypes = linkedSubmissions.map((s) => s.type);
        const completionPercentage =
          (completedTypes.length / formTypes.length) * 100;

        return {
          basicInfoId,
          basicInfo,
          linkedSubmissions,
          completedFormTypes: completedTypes,
          totalFormTypes: formTypes,
          completionPercentage: Math.round(completionPercentage),
          isComplete: completedTypes.length === formTypes.length,
        };
      },
    );

    res.status(200).json({
      submissionGroups,
      standaloneSubmissions,
      totalSubmissions: submissions.length,
      completedGroups: submissionGroups.filter((g) => g.isComplete).length,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
