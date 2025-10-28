import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

/**
 * University Departments API
 *
 * GET /api/universities/[id]/departments
 *
 * Fetches all departments for a university.
 * The [id] parameter can be either the university ID, name, or code.
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ error: "University ID, name, or code is required" });
    }

    // Find the university by ID, name, or code
    const university = await prisma.universities.findFirst({
      where: {
        OR: [{ id: id }, { name: id }, { code: id }],
      },
      include: {
        faculties: {
          include: {
            departments: true,
          },
        },
      },
    });

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    // Extract all departments from all faculties
    const departments: string[] = [];
    university.faculties.forEach((faculty) => {
      faculty.departments.forEach((department) => {
        departments.push(department.name);
      });
    });

    // Remove duplicates and sort
    const uniqueDepartments = [...new Set(departments)].sort();

    // Cache for 1 hour (departments don't change frequently)
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=7200",
    );

    res.status(200).json({
      university: {
        id: university.id,
        name: university.name,
        code: university.code,
      },
      departments: uniqueDepartments,
      total: uniqueDepartments.length,
    });
  } catch (error) {
    console.error("Error fetching university departments:", error);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
}
