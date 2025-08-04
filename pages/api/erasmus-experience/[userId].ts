import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { userId } = req.query;

  if (userId !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  switch (req.method) {
    case "GET":
      return handleGet(req, res, userId as string);
    case "PUT":
      return handlePut(req, res, userId as string);
    case "DELETE":
      return handleDelete(req, res, userId as string);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  try {
    // Use existing FormSubmission model to get user's form data
    const submissions = await prisma.formSubmission.findMany({
      where: {
        userId,
        type: {
          in: [
            "BASIC_INFO",
            "COURSE_MATCHING",
            "ACCOMMODATION",
            "LIVING_EXPENSES",
            "EXPERIENCE",
          ],
        },
      },
    });

    if (submissions.length === 0) {
      // Return default structure for new users
      return res.json({
        currentStep: 1,
        completedSteps: [],
        formData: {},
        status: "DRAFT",
        isComplete: false,
      });
    }

    // Combine submissions into formData
    const formData: any = {};
    const completedSteps: number[] = [];

    submissions.forEach((submission) => {
      switch (submission.type) {
        case "BASIC_INFO":
          formData.basicInfo = submission.data;
          completedSteps.push(1);
          break;
        case "COURSE_MATCHING":
          formData.courses = submission.data;
          completedSteps.push(2);
          break;
        case "ACCOMMODATION":
          formData.accommodation = submission.data;
          completedSteps.push(3);
          break;
        case "LIVING_EXPENSES":
          formData.livingExpenses = submission.data;
          completedSteps.push(4);
          break;
        case "EXPERIENCE":
          formData.experience = submission.data;
          completedSteps.push(5);
          break;
      }
    });

    const currentStep = Math.max(...completedSteps, 1);
    const isComplete = completedSteps.length >= 5;

    return res.json({
      currentStep,
      completedSteps: completedSteps.sort(),
      formData,
      status: isComplete
        ? "COMPLETED"
        : currentStep > 1
          ? "IN_PROGRESS"
          : "DRAFT",
      isComplete,
      lastSavedAt: Math.max(
        ...submissions.map((s) => new Date(s.updatedAt).getTime()),
      ),
    });
  } catch (error) {
    console.error("Error fetching Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  try {
    const { formData, currentStep, completedSteps } = req.body;

    // Create or update individual form submissions
    const promises = [];

    if (formData?.basicInfo) {
      promises.push(
        prisma.formSubmission
          .upsert({
            where: {
              id: await getSubmissionId(userId, "BASIC_INFO"),
            },
            update: {
              data: formData.basicInfo,
              updatedAt: new Date(),
            },
            create: {
              userId,
              type: "BASIC_INFO",
              title: "Basic Information",
              data: formData.basicInfo,
            },
          })
          .catch(() =>
            prisma.formSubmission.create({
              data: {
                userId,
                type: "BASIC_INFO",
                title: "Basic Information",
                data: formData.basicInfo,
              },
            }),
          ),
      );
    }

    if (formData?.courses) {
      promises.push(
        prisma.formSubmission
          .upsert({
            where: {
              id: await getSubmissionId(userId, "COURSE_MATCHING"),
            },
            update: {
              data: formData.courses,
              updatedAt: new Date(),
            },
            create: {
              userId,
              type: "COURSE_MATCHING",
              title: "Course Matching",
              data: formData.courses,
            },
          })
          .catch(() =>
            prisma.formSubmission.create({
              data: {
                userId,
                type: "COURSE_MATCHING",
                title: "Course Matching",
                data: formData.courses,
              },
            }),
          ),
      );
    }

    if (formData?.accommodation) {
      promises.push(
        prisma.formSubmission
          .upsert({
            where: {
              id: await getSubmissionId(userId, "ACCOMMODATION"),
            },
            update: {
              data: formData.accommodation,
              updatedAt: new Date(),
            },
            create: {
              userId,
              type: "ACCOMMODATION",
              title: "Accommodation",
              data: formData.accommodation,
            },
          })
          .catch(() =>
            prisma.formSubmission.create({
              data: {
                userId,
                type: "ACCOMMODATION",
                title: "Accommodation",
                data: formData.accommodation,
              },
            }),
          ),
      );
    }

    if (formData?.livingExpenses) {
      promises.push(
        prisma.formSubmission
          .upsert({
            where: {
              id: await getSubmissionId(userId, "LIVING_EXPENSES"),
            },
            update: {
              data: formData.livingExpenses,
              updatedAt: new Date(),
            },
            create: {
              userId,
              type: "LIVING_EXPENSES",
              title: "Living Expenses",
              data: formData.livingExpenses,
            },
          })
          .catch(() =>
            prisma.formSubmission.create({
              data: {
                userId,
                type: "LIVING_EXPENSES",
                title: "Living Expenses",
                data: formData.livingExpenses,
              },
            }),
          ),
      );
    }

    if (formData?.experience) {
      promises.push(
        prisma.formSubmission
          .upsert({
            where: {
              id: await getSubmissionId(userId, "EXPERIENCE"),
            },
            update: {
              data: formData.experience,
              updatedAt: new Date(),
            },
            create: {
              userId,
              type: "EXPERIENCE",
              title: "Experience Story",
              data: formData.experience,
            },
          })
          .catch(() =>
            prisma.formSubmission.create({
              data: {
                userId,
                type: "EXPERIENCE",
                title: "Experience Story",
                data: formData.experience,
              },
            }),
          ),
      );
    }

    await Promise.all(promises);

    // Determine completion status
    const isComplete = completedSteps?.length >= 5;
    const status = isComplete
      ? "COMPLETED"
      : currentStep > 1
        ? "IN_PROGRESS"
        : "DRAFT";

    return res.json({
      currentStep: currentStep || 1,
      completedSteps: completedSteps || [],
      status,
      isComplete,
      lastSavedAt: new Date(),
    });
  } catch (error) {
    console.error("Error saving Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Helper function to get submission ID
async function getSubmissionId(userId: string, type: string): Promise<string> {
  const submission = await prisma.formSubmission.findFirst({
    where: { userId, type },
    select: { id: true },
  });
  return submission?.id || "non-existent-id";
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  try {
    // Delete all form submissions for this user
    await prisma.formSubmission.deleteMany({
      where: {
        userId,
        type: {
          in: [
            "BASIC_INFO",
            "COURSE_MATCHING",
            "ACCOMMODATION",
            "LIVING_EXPENSES",
            "EXPERIENCE",
          ],
        },
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting Erasmus experience:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
