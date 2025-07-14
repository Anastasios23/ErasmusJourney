import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

interface UniversitySubmissionsResponse {
  submissions: Array<{
    id: string;
    userId: string;
    type: string;
    title: string;
    data: any; // Filtered data without sensitive information
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  university: {
    id: string;
    name: string;
    city?: string;
    country?: string;
  } | null;
  totalSubmissions: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UniversitySubmissionsResponse | { error: string }>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid university ID" });
  }

  try {
    // Fetch all form submissions where data.universityId matches the id
    const submissions = await prisma.formSubmission.findMany({
      where: {
        // This assumes that "universityId" is stored inside the "data" JSON of each submission.
        // If you have a direct universityId field, use that instead!
        data: {
          path: ["universityId"],
          equals: id,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove grades and any sensitive info before sending to frontend
    const cleaned = submissions.map((sub) => {
      const {
        grades,
        grade,
        studentId,
        emergencyContact,
        phoneNumber,
        address,
        passportNumber,
        personalDocument,
        email,
        firstName,
        lastName,
        dateOfBirth,
        academicLevel,
        gpa,
        transcripts,
        personalStatement,
        financialDocuments,
        visaInformation,
        ...safeData
      } = (sub.data as any) || {};

      // Also remove any nested course grades from course arrays
      if (safeData.courses) {
        safeData.courses = safeData.courses.map((course: any) => {
          const {
            grade: courseGrade,
            finalGrade,
            marks,
            ...safeCourse
          } = course;
          return safeCourse;
        });
      }

      // Remove grades from hostCourses and recognizedCourses for course-matching submissions
      if (safeData.hostCourses) {
        safeData.hostCourses = safeData.hostCourses.map((course: any) => {
          const {
            grade: courseGrade,
            finalGrade,
            marks,
            ...safeCourse
          } = course;
          return safeCourse;
        });
      }

      if (safeData.recognizedCourses) {
        safeData.recognizedCourses = safeData.recognizedCourses.map(
          (course: any) => {
            const {
              grade: courseGrade,
              finalGrade,
              marks,
              ...safeCourse
            } = course;
            return safeCourse;
          },
        );
      }

      return {
        ...sub,
        data: safeData,
      };
    });

    // Optionally fetch university info to return
    const university = await prisma.university.findUnique({
      where: { id },
      select: { id: true, name: true, city: true, country: true },
    });

    const response: UniversitySubmissionsResponse = {
      submissions: cleaned,
      university,
      totalSubmissions: cleaned.length,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching university submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
}
