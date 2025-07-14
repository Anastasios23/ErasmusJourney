import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { homeUniversity, department, level } = req.query;

    // Build the where clause dynamically
    const whereClause: any = {
      isActive: true,
    };

    // Filter by home university if provided
    if (homeUniversity && homeUniversity !== "all") {
      // Find university by name or code
      const university = await prisma.university.findFirst({
        where: {
          OR: [
            { name: homeUniversity as string },
            { code: homeUniversity as string },
          ],
        },
      });

      if (university) {
        whereClause.homeUniversityId = university.id;
      } else {
        // If no university found, return empty results
        return res.status(200).json({ agreements: [] });
      }
    }

    // Filter by department if provided
    if (department && department !== "all") {
      // Find department by name
      const departmentRecord = await prisma.department.findFirst({
        where: {
          name: department as string,
        },
      });

      if (departmentRecord) {
        whereClause.homeDepartmentId = departmentRecord.id;
      } else {
        // If no department found, return empty results
        return res.status(200).json({ agreements: [] });
      }
    }

    // Fetch agreements with all related data
    const agreements = await prisma.agreement.findMany({
      where: whereClause,
      include: {
        homeUniversity: true,
        homeDepartment: {
          include: {
            faculty: true,
          },
        },
        partnerUniversity: true,
      },
      orderBy: [
        { partnerCountry: "asc" },
        { partnerCity: "asc" },
        { partnerUniversity: { name: "asc" } },
      ],
    });

    // Format the response to match the expected structure
    const formattedAgreements = agreements.map((agreement) => ({
      id: agreement.id,
      homeUniversity: {
        id: agreement.homeUniversity.id,
        name: agreement.homeUniversity.name,
        code: agreement.homeUniversity.code,
      },
      homeDepartment: {
        id: agreement.homeDepartment.id,
        name: agreement.homeDepartment.name,
        faculty: agreement.homeDepartment.faculty?.name,
      },
      partnerUniversity: {
        id: agreement.partnerUniversity.id,
        name: agreement.partnerUniversity.name,
        code: agreement.partnerUniversity.code,
        country: agreement.partnerUniversity.country,
        city: agreement.partnerUniversity.city,
      },
      partnerCity: agreement.partnerCity,
      partnerCountry: agreement.partnerCountry,
      agreementType: agreement.agreementType,
      isActive: agreement.isActive,
      startDate: agreement.startDate,
      endDate: agreement.endDate,
    }));

    res.status(200).json({
      agreements: formattedAgreements,
      total: formattedAgreements.length,
    });
  } catch (error) {
    console.error("Error fetching agreements:", error);
    res.status(500).json({ error: "Failed to fetch agreements" });
  }
}
