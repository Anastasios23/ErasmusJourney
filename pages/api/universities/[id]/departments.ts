import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { CYPRUS_UNIVERSITIES } from "../../../../src/data/universityAgreements";

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
      const normalizedId = id.trim().toLowerCase();
      const fallbackUniversity = CYPRUS_UNIVERSITIES.find((item) => {
        return (
          item.code.toLowerCase() === normalizedId ||
          item.name.toLowerCase() === normalizedId ||
          item.shortName.toLowerCase() === normalizedId
        );
      });

      if (!fallbackUniversity) {
        return res.status(404).json({ error: "University not found" });
      }

      const fallbackDepartments = Array.from(
        new Set(
          fallbackUniversity.departments
            .map((department) => department.trim())
            .filter(Boolean),
        ),
      ).sort((left, right) => left.localeCompare(right));

      res.setHeader(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=7200",
      );

      return res.status(200).json({
        university: {
          id: fallbackUniversity.code,
          name: fallbackUniversity.name,
          code: fallbackUniversity.code,
        },
        departments: fallbackDepartments,
        total: fallbackDepartments.length,
      });
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
