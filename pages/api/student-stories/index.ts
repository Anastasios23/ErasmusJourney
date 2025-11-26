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
    // Get story submissions and experience submissions that want to help
    const storySubmissions = await prisma.form_submissions.findMany({
      where: {
        OR: [
          {
            type: "EXPERIENCE",
            status: { in: ["SUBMITTED", "PUBLISHED"] },
            data: {
              path: ["wantToHelp"], // Fixed: path should be an array
              string_contains: "yes",
            },
          },
          {
            type: "EXPERIENCE",
            status: { in: ["SUBMITTED", "PUBLISHED"] },
            // Include all experience submissions for now
          },
          {
            type: "STORY",
            status: { in: ["SUBMITTED", "PUBLISHED"] },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get related basic info for each story
    const stories = await Promise.all(
      storySubmissions.map(async (submission) => {
        // Get user data separately to avoid nullable field issues
        const userData = await prisma.user.findUnique({
          where: { id: submission.userId },
          select: { firstName: true, email: true },
        });

        const basicInfo = await prisma.form_submissions.findFirst({
          where: {
            userId: submission.userId,
            type: "BASIC_INFO",
            status: "SUBMITTED",
          },
        });

        const accommodationInfo = await prisma.form_submissions.findFirst({
          where: {
            userId: submission.userId,
            type: "ACCOMMODATION",
            status: "SUBMITTED",
          },
        });

        const expensesInfo = await prisma.form_submissions.findFirst({
          where: {
            userId: submission.userId,
            type: "LIVING_EXPENSES",
            status: "SUBMITTED",
          },
        });

        return {
          id: submission.id,
          studentName:
            (submission.data as any).nickname ||
            userData?.firstName ||
            "Anonymous Student",
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
              ? (submission.data as any).email || userData?.email
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
