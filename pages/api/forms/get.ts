import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

// This would be imported from the same storage as submit.ts
// In a real app, this would be a database query
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { type, status, userId } = req.query;

    // In production, this would be a database query
    // For now, return mock data based on the user's submissions
    let submissions = [
      {
        id: "1",
        userId: session.user?.email || "unknown",
        type: "basic-info",
        title: "Basic Information Form",
        data: {
          firstName: "John",
          lastName: "Doe",
          university: "UNIC",
          department: "Computer Science",
          levelOfStudy: "bachelor",
        },
        status: "published",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-16T10:00:00Z",
      },
      {
        id: "2",
        userId: session.user?.email || "unknown",
        type: "course-matching",
        title: "Course Matching - Fall 2024",
        data: {
          hostUniversity: "University of Barcelona",
          hostDepartment: "Computer Science",
          courses: [
            {
              name: "Advanced Algorithms",
              code: "CS401",
              ects: "6",
              difficulty: "4",
            },
          ],
        },
        status: "submitted",
        createdAt: "2024-01-18T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
      {
        id: "3",
        userId: session.user?.email || "unknown",
        type: "accommodation",
        title: "Student Housing in Barcelona",
        data: {
          type: "University Dormitory",
          location: "Barcelona, Spain",
          rating: 4,
          description: "Great location near campus with excellent facilities.",
        },
        status: "published",
        createdAt: "2024-01-22T10:00:00Z",
        updatedAt: "2024-01-22T10:00:00Z",
      },
      {
        id: "4",
        userId: session.user?.email || "unknown",
        type: "story",
        title: "My Amazing Erasmus Experience in Barcelona",
        data: {
          content:
            "Living in Barcelona was a life-changing experience. The culture, food, and people were incredible...",
          tags: ["barcelona", "erasmus", "culture"],
          destination: "Barcelona, Spain",
        },
        status: "published",
        createdAt: "2024-01-25T10:00:00Z",
        updatedAt: "2024-01-25T10:00:00Z",
      },
    ];

    // Filter by user
    if (userId && userId !== "all") {
      submissions = submissions.filter((s) => s.userId === userId);
    } else if (!userId) {
      // If no userId specified, return current user's submissions
      submissions = submissions.filter(
        (s) => s.userId === (session.user?.email || "unknown"),
      );
    }

    // Filter by type
    if (type && type !== "all") {
      submissions = submissions.filter((s) => s.type === type);
    }

    // Filter by status
    if (status && status !== "all") {
      submissions = submissions.filter((s) => s.status === status);
    }

    res.status(200).json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
