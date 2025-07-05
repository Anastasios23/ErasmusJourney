import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

interface Course {
  code: string;
  name: string;
  credits: number;
  grade?: string;
  cyprusEquivalent: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      // In production, this would fetch from your database
      // For now, return realistic sample data instead of Lorem Ipsum
      const sampleCourses: Course[] = [
        {
          code: "CS301",
          name: "Database Systems",
          credits: 6,
          grade: "A",
          cyprusEquivalent: "CS350 - Database Management Systems",
        },
        {
          code: "CS425",
          name: "Machine Learning",
          credits: 6,
          grade: "A-",
          cyprusEquivalent: "CS450 - Artificial Intelligence",
        },
        {
          code: "CS380",
          name: "Software Engineering",
          credits: 8,
          grade: "B+",
          cyprusEquivalent: "CS370 - Software Engineering Principles",
        },
        {
          code: "MATH301",
          name: "Linear Algebra",
          credits: 5,
          grade: "A",
          cyprusEquivalent: "MATH350 - Advanced Linear Algebra",
        },
      ];

      return res.status(200).json({
        courses: sampleCourses,
        foreignUniversity: "Technical University of Munich",
        cyprusUniversity: "University of Cyprus",
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
