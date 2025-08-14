import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

import type { Destination } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      country,
      featured,
      page = "1",
      limit = "10",
      status = "PUBLISHED",
    } = req.query;

    // Build where clause
    const where: any = {
      status: status as string,
    };

    if (country && typeof country === "string") {
      where.country = {
        contains: country,
        mode: "insensitive",
      };
    }

    if (featured === "true") {
      where.featured = true;
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    // Get destinations with relations
    const destinations = await (prisma.destination.findMany as any)({
      where,
      include: {
        accommodations: {
          where: { visible: true },
          take: 3, // Preview of accommodations
          orderBy: { createdAt: "desc" as const },
        },
        courseExchanges: {
          where: { visible: true },
          take: 3, // Preview of course exchanges
          orderBy: { createdAt: "desc" as const },
        },
      },
      orderBy: [
        { featured: "desc" as const }, // Featured first
        { createdAt: "desc" as const }, // Then by most recently created
        { updatedAt: "desc" as const }, // Then by most recently updated
      ],
      skip,
      take: limitNum,
    });

    // Get total count for pagination
    const total = await prisma.destination.count({ where });

    // Transform data for frontend
    const transformedDestinations = destinations.map((dest) => ({
      id: dest.id,
      slug: dest.name?.toLowerCase().replace(/\s+/g, "-") || dest.id, // Generate slug from name or use ID as fallback
      city: dest.name, // Use name as the city since city property doesn't exist
      country: dest.country,
      // Only include properties that exist in the Prisma model
      description: dest.description,
      imageUrl: dest.imageUrl,
      featured: dest.featured,
      climate: dest.climate,
      // Remove status if it doesn't exist in your Prisma model
      // status: dest.status,
      accommodations: dest.accommodations.map((acc) => ({
        id: acc.id,
        studentName: acc.studentName,
        accommodationType: acc.accommodationType,
        neighborhood: acc.neighborhood,
        monthlyRent: acc.monthlyRent,
        currency: acc.currency,
        title: acc.title,
        description: acc.description,
        pros: acc.pros,
        cons: acc.cons,
        tips: acc.tips,
        bookingAdvice: acc.bookingAdvice,
        featured: acc.featured,
        createdAt: acc.createdAt,
      })),
      courseExchanges: dest.courseExchanges.map((course) => ({
        id: course.id,
        studentName: course.studentName,
        hostUniversity: course.hostUniversity,
        fieldOfStudy: course.fieldOfStudy,
        studyLevel: course.studyLevel,
        semester: course.semester,
        title: course.title,
        description: course.description,
        courseQuality: course.courseQuality,
        professorQuality: course.professorQuality,
        facilityQuality: course.facilityQuality,
        coursesEnrolled: course.coursesEnrolled,
        creditsEarned: course.creditsEarned,
        language: course.language,
        academicChallenges: course.academicChallenges,
        academicHighlights: course.academicHighlights,
        tips: course.tips,
        featured: course.featured,
        createdAt: course.createdAt,
      })),
    }));

    return res.status(200).json({
      destinations: transformedDestinations,
      total,
      page: pageNum,
      limit: limitNum,
      hasNext: skip + limitNum < total,
      hasPrev: pageNum > 1,
    });
  } catch (error) {
    console.error("Error fetching generated destinations:", error);
    return res.status(500).json({
      error: "Failed to fetch destinations",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    await prisma.$disconnect();
  }
}
