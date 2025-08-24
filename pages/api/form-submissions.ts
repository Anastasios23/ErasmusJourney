import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

// TypeScript interfaces for request body
interface AccommodationData {
  type: string;
  name: string;
  url?: string;
  pricePerMonth?: number;
}

interface CourseExchangeData {
  homeCourse: string;
  hostCourse: string;
  ects?: number;
  approved?: boolean;
}

interface DestinationData {
  name: string;
  country: string;
  summary?: string;
}

interface FormSubmissionRequest {
  destination: DestinationData;
  accommodations: AccommodationData[];
  courseExchanges: CourseExchangeData[];
}

// Helper function to generate unique slug from destination name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim(); // Remove leading/trailing whitespace
}

// Helper function to ensure unique slug in database
async function getUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = generateSlug(baseName);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug already exists and increment if needed
  while (await prisma.destination.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    const { city, type } = req.query;

    try {
      // Fetch from real database
      let whereClause: any = {};

      // Filter by type if specified
      if (type && typeof type === "string") {
        whereClause.type = type;
      }

      if (city && typeof city === "string") {
        whereClause.hostCity = {
          equals: city,
          mode: "insensitive",
        };
      }

      let submissions = await prisma.formSubmission.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      });

      // Filter by city if specified (since this is JSON field, do it after fetch)
      if (city && typeof city === "string") {
        submissions = submissions.filter((submission) => {
          if (submission.hostCity) {
            return submission.hostCity.toLowerCase() === city.toLowerCase();
          }
          const data = submission.data as any;
          return data.hostCity?.toLowerCase() === city.toLowerCase();
        });
      }

      // Convert to format expected by frontend
      const formattedSubmissions = submissions.map((sub) => ({
        id: sub.id,
        userId: sub.userId,
        type: sub.type,
        title: sub.title,
        data: sub.data,
        status: sub.status,
        hostCity: sub.hostCity,
        hostCountry: sub.hostCountry,
        createdAt: sub.createdAt.toISOString(),
        updatedAt: sub.updatedAt.toISOString(),
      }));

      return res.status(200).json(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching form submissions:", error);
      return res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }

  if (req.method === "POST") {
    try {
      // Validate request body structure
      const {
        destination,
        accommodations,
        courseExchanges,
      }: FormSubmissionRequest = req.body;

      if (!destination || !destination.name || !destination.country) {
        return res.status(400).json({
          error: "Missing required destination fields (name, country)",
        });
      }

      if (!Array.isArray(accommodations)) {
        return res.status(400).json({
          error: "Accommodations must be an array",
        });
      }

      if (!Array.isArray(courseExchanges)) {
        return res.status(400).json({
          error: "Course exchanges must be an array",
        });
      }

      // Generate unique slug for the destination
      const slug = await getUniqueSlug(destination.name);

      // Use Prisma transaction to ensure all-or-nothing operation
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create the destination
        const newDestination = await tx.destination.create({
          data: {
            name: destination.name,
            country: destination.country,
            summary: destination.summary || null,
            slug: slug,
          },
        });

        // 2. Create accommodations if any provided
        if (accommodations.length > 0) {
          await tx.accommodation.createMany({
            data: accommodations.map((acc) => ({
              destinationId: newDestination.id,
              type: acc.type,
              name: acc.name,
              url: acc.url || null,
              pricePerMonth: acc.pricePerMonth || null,
            })),
          });
        }

        // 3. Create course exchanges if any provided
        if (courseExchanges.length > 0) {
          await tx.courseExchange.createMany({
            data: courseExchanges.map((course) => ({
              destinationId: newDestination.id,
              homeCourse: course.homeCourse,
              hostCourse: course.hostCourse,
              ects: course.ects || null,
              approved: course.approved || false,
            })),
          });
        }

        return newDestination;
      });

      // Return success response with destination info
      return res.status(201).json({
        slug: result.slug,
        url: `/destinations/${result.slug}`,
        message: "Destination and related data saved!",
      });
    } catch (error) {
      console.error("Error creating destination:", error);
      return res.status(500).json({
        error: "Something went wrong while saving the destination",
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: "Method not allowed" });
}
