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
    // First try to fetch submissions by universityId in the data field
    let submissions = await prisma.formSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Filter submissions manually since SQLite JSON querying is limited
    // In production with PostgreSQL, you'd use proper JSON path queries
    const universitySubmissions = submissions.filter((submission) => {
      const data = submission.data as any;
      if (!data) return false;

      // Match by universityId if it exists in the data
      if (data.universityId === id) return true;

      // Fallback: match by university name for existing test data
      const hostUniversity = data.hostUniversity;
      if (!hostUniversity) return false;

      // Exact match first
      if (hostUniversity === id) return true;

      // Partial match (case insensitive)
      if (hostUniversity.toLowerCase().includes(id.toLowerCase())) return true;

      // Reverse partial match (id contains university name)
      if (id.toLowerCase().includes(hostUniversity.toLowerCase())) return true;

      return false;
    });

    // Remove grades and any sensitive info before sending to frontend
    const cleaned = universitySubmissions.map((sub) => {
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
