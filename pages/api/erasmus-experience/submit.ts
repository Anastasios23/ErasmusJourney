import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { userId, formData } = req.body;

    if (userId !== session.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Create or update form submissions for all sections
    const formSubmissions = [];

    if (formData?.basicInfo) {
      formSubmissions.push({
        userId,
        type: "BASIC_INFO",
        title: "Basic Information",
        data: formData.basicInfo,
      });
    }

    if (formData?.courses) {
      formSubmissions.push({
        userId,
        type: "COURSE_MATCHING",
        title: "Course Matching",
        data: formData.courses,
      });
    }

    if (formData?.accommodation) {
      formSubmissions.push({
        userId,
        type: "ACCOMMODATION",
        title: "Accommodation",
        data: formData.accommodation,
      });
    }

    if (formData?.livingExpenses) {
      formSubmissions.push({
        userId,
        type: "LIVING_EXPENSES",
        title: "Living Expenses",
        data: formData.livingExpenses,
      });
    }

    if (formData?.experience) {
      formSubmissions.push({
        userId,
        type: "EXPERIENCE",
        title: "Experience Story",
        data: formData.experience,
      });
    }

    // Create all form submissions for backward compatibility
    for (const submission of formSubmissions) {
      try {
        // Try to find existing submission
        const existing = await prisma.formSubmission.findFirst({
          where: {
            userId: submission.userId,
            type: submission.type,
          },
        });

        if (existing) {
          // Update existing
          await prisma.formSubmission.update({
            where: { id: existing.id },
            data: {
              data: submission.data,
              status: "SUBMITTED",
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new
          await prisma.formSubmission.create({
            data: {
              ...submission,
              status: "SUBMITTED",
            },
          });
        }
      } catch (error) {
        console.error(
          `Error creating/updating form submission ${submission.type}:`,
          error,
        );
        // Continue with other submissions even if one fails
      }
    }

    return res.json({
      success: true,
      submittedAt: new Date(),
      submissionsCount: formSubmissions.length,
    });
  } catch (error) {
    console.error("Error submitting Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
