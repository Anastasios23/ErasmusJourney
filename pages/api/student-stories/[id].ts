import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid story ID" });
  }

  try {
    // Get the mentorship submission by ID
    const submission = await prisma.form_submissions.findFirst({
      where: {
        id: id,
        type: "EXPERIENCE",
        status: { in: ["SUBMITTED", "PUBLISHED"] },
        data: {
          path: ["wantToHelp"], // Fixed: path should be an array
          string_contains: "yes",
        },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Get related basic info
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

    const story = {
      id: submission.id,
      studentName:
        (submission.data as any).nickname || submission.user?.firstName,
      university:
        (basicInfo?.data as any)?.hostUniversity || "Unknown University",
      city: (basicInfo?.data as any)?.hostCity || "Unknown City",
      country: (basicInfo?.data as any)?.hostCountry || "Unknown Country",
      department:
        (basicInfo?.data as any)?.departmentInCyprus || "Unknown Department",
      levelOfStudy: (basicInfo?.data as any)?.levelOfStudy || "Unknown Level",
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

    res.status(200).json(story);
  } catch (error) {
    console.error("Error fetching student story:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
