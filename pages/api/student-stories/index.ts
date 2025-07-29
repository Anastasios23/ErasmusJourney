import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get help-future-students submissions (mentorship data)
    const mentorshipSubmissions = await prisma.formSubmission.findMany({
      where: {
        type: "EXPERIENCE",
        status: { in: ["SUBMITTED", "PUBLISHED"] },
        data: {
          path: "wantToHelp",
          string_contains: "yes",
        },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get related basic info for each mentor
    const stories = await Promise.all(
      mentorshipSubmissions.map(async (submission) => {
        // Type assertion to include the user property
        const submissionWithUser = submission as typeof submission & {
          user?: { firstName: string; lastName: string; email: string };
        };

        const basicInfo = await prisma.formSubmission.findFirst({
          where: {
            userId: submission.userId,
            type: "BASIC_INFO",
            status: "SUBMITTED",
          },
        });

        const accommodationInfo = await prisma.formSubmission.findFirst({
          where: {
            userId: submission.userId,
            type: "ACCOMMODATION",
            status: "SUBMITTED",
          },
        });

        const expensesInfo = await prisma.formSubmission.findFirst({
          where: {
            userId: submission.userId,
            type: "LIVING_EXPENSES",
            status: "SUBMITTED",
          },
        });

        return {
          id: submission.id,
          studentName:
            (submission.data as any).nickname || submission.user?.firstName,
          university:
            (basicInfo?.data as any)?.hostUniversity || "Unknown University",
          city: (basicInfo?.data as any)?.hostCity || "Unknown City",
          country: (basicInfo?.data as any)?.hostCountry || "Unknown Country",
          department:
            (basicInfo?.data as any)?.departmentInCyprus ||
            "Unknown Department",
          levelOfStudy:
            (basicInfo?.data as any)?.levelOfStudy || "Unknown Level",
          exchangePeriod:
            (basicInfo?.data as any)?.exchangePeriod || "Unknown Period",
          story:
            (submission.data as any).personalExperience ||
            (submission.data as any).adviceForFutureStudents ||
            "No story provided",
          tips:
            (submission.data as any).budgetTips ||
            (expensesInfo?.data as any)?.overallBudgetAdvice ||
            [],
          helpTopics: (submission.data as any).helpTopics || [],
          contactMethod:
            (submission.data as any).publicProfile === "yes"
              ? (submission.data as any).contactMethod
              : null,
          contactInfo:
            (submission.data as any).publicProfile === "yes" &&
            (submission.data as any).contactMethod === "email"
              ? (submission.data as any).email
              : null,
          accommodationTips:
            (accommodationInfo?.data as any)?.additionalNotes || null,
          budgetTips: expensesInfo?.data
            ? {
                cheapGroceries: (expensesInfo.data as any).cheapGroceryPlaces,
                cheapEating: (expensesInfo.data as any).cheapEatingPlaces,
                transportation: (expensesInfo.data as any).transportationTips,
                socialLife: (expensesInfo.data as any).socialLifeTips,
                travel: (expensesInfo.data as any).travelTips,
                overall: (expensesInfo.data as any).overallBudgetAdvice,
              }
            : null,
          createdAt: submission.createdAt,
          isPublic: (submission.data as any).publicProfile === "yes",
        };
      }),
    );

    // Filter out stories without basic destination info
    const validStories = stories.filter(
      (story) =>
        story.city !== "Unknown City" && story.country !== "Unknown Country",
    );

    res.status(200).json({ stories: validStories });
  } catch (error) {
    console.error("Error fetching student stories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
