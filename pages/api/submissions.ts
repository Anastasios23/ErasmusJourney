import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Fetch applications with related user and university data
    const applications = await prisma.application.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        program: {
          select: {
            name: true,
            level: true,
          },
        },
        homeUniversity: {
          select: {
            name: true,
            shortName: true,
          },
        },
        agreement: {
          include: {
            partnerUniversity: {
              select: {
                name: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform the data to match the expected format
    const submissions = applications.map((app) => ({
      id: app.id,
      firstName: app.user.firstName,
      lastName: app.user.lastName,
      email: app.user.email,
      course: app.program.name,
      level: app.program.level,
      homeUniversity: app.homeUniversity.shortName,
      partnerUniversity: app.agreement.partnerUniversity.name,
      partnerCity: app.agreement.partnerUniversity.city,
      partnerCountry: app.agreement.partnerUniversity.country,
      status: app.status,
      semester: app.semester,
      academicYear: app.academicYear,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    return res.status(200).json({ submissions });
  } catch (error) {
    console.error("❌ Error fetching submissions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
