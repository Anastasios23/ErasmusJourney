import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "University name is required" });
    }

    // Find the university by name or code
    const university = await prisma.university.findFirst({
      where: {
        OR: [{ name: name }, { code: name }],
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
