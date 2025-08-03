import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if user is admin
  const session = await getSession({ req });
  if (!session?.user || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const { status } = req.query;

      // Fetch form submissions that have both basic info and course matching data
      const submissions = await prisma.formSubmission.findMany({
        where: {
          ...(status && { status: status as string }),
          type: {
            in: ["basic-information", "course-matching"],
          },
        },
        include: {
          user: {
            select: {
              id: true,
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

      // Transform the data for the admin interface
      const formattedSubmissions = submissions.map((submission: any) => {
        const data = submission.data as any;

        return {
          id: submission.id,
          userId: submission.userId,
          studentName: `${submission.user.firstName} ${submission.user.lastName}`,
          email: submission.user.email,
          status: submission.status,
          createdAt: submission.createdAt.toISOString(),

          basicInfo: {
            universityInCyprus: data.universityInCyprus || "",
            hostUniversity: data.hostUniversity || "",
            hostCity: data.hostCity || "",
            hostCountry: data.hostCountry || "",
            studyLevel: data.studyLevel || "BACHELOR",
            fieldOfStudy: data.fieldOfStudy || data.department || "",
            studyPeriod: data.studyPeriod || "",
          },

          courseMatching: {
            availableCourses: data.courseMatching?.availableCourses || [],
            totalEcts: data.courseMatching?.totalEcts || 0,
            academicYear: data.courseMatching?.academicYear || "",
            language: data.courseMatching?.language || "English",
            specialRequirements: data.courseMatching?.specialRequirements || "",
            applicationDeadline: data.courseMatching?.applicationDeadline || "",
          },
        };
      });

      return res.status(200).json(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching university submissions:", error);
      return res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
