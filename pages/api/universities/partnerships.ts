import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only GET requests are supported",
    });
  }

  // Verify authentication
  const session = await getServerAuthSession(req, res);
  if (!session?.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please sign in to access partnership data",
    });
  }

  try {
    const {
      universityId,
      department,
      country,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (universityId) {
      where.homeUniversityId = universityId;
    }

    if (department) {
      where.homeDepartment = {
        name: {
          contains: department as string,
          mode: "insensitive",
        },
      };
    }

    if (country) {
      where.partnerCountry = {
        contains: country as string,
        mode: "insensitive",
      };
    }

    // Fetch partnerships with related data
    const [partnerships, total] = await Promise.all([
      prisma.agreement.findMany({
        where,
        include: {
          homeUniversity: {
            select: {
              id: true,
              name: true,
              shortName: true,
              code: true,
            },
          },
          homeDepartment: {
            select: {
              id: true,
              name: true,
              faculty: {
                select: {
                  name: true,
                },
              },
            },
          },
          partnerUniversity: {
            select: {
              id: true,
              name: true,
              shortName: true,
              country: true,
              city: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limitNum,
      }),
      prisma.agreement.count({ where }),
    ]);

    // Get unique countries for filtering
    const countries = await prisma.agreement.findMany({
      where: { isActive: true },
      select: { partnerCountry: true },
      distinct: ["partnerCountry"],
      orderBy: { partnerCountry: "asc" },
    });

    res.status(200).json({
      partnerships,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      filters: {
        countries: countries.map((c) => c.partnerCountry),
      },
    });
  } catch (error) {
    console.error("Partnerships API error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
