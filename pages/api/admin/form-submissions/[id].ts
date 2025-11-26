import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "../../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // Check if user is admin
  // const session = await getServerSession(req, res, authOptions);
  // if (!session?.user || session.user.role !== "ADMIN") {
  //   return res.status(403).json({ error: "Unauthorized" });
  // }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid submission ID" });
  }

  if (req.method === "GET") {
    try {
      const submission = await prisma.form_submissions.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      return res.status(200).json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      return res.status(500).json({ error: "Failed to fetch submission" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { status, adminNotes } = req.body;

      const submission = await prisma.form_submissions.update({
        where: { id },
        data: {
          status,
          adminNotes,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // If approving a submission, also create/update destination
      if (status === "PUBLISHED") {
        await createDestinationFromSubmission(submission);
      }

      return res.status(200).json(submission);
    } catch (error) {
      console.error("Error updating submission:", error);
      return res.status(500).json({ error: "Failed to update submission" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

async function createDestinationFromSubmission(submission: any) {
  try {
    const data = submission.data as any;

    // Extract destination info
    const city = data.hostCity || data.city;
    const country = data.hostCountry || data.country;

    if (!city || !country) {
      return; // Skip if no city/country info
    }

    const slug = `${city.toLowerCase()}-${country.toLowerCase()}`.replace(
      /[^a-z0-9-]/g,
      "-",
    );

    // Check if destination already exists
    let destination = await prisma.destination.findUnique({
      where: { slug },
    });

    if (!destination) {
      // Create new destination
      destination = await prisma.destination.create({
        data: {
          name: `${city}, ${country}`,
          city,
          country,
          slug,
          summary: `Study destination in ${city}, ${country}`,
          description: `Discover ${city} through real student experiences. Find accommodation, courses, and practical information for your exchange.`,
          source: "user_generated",
          featured: false,
        },
      });
    }

    // Add accommodation info if available
    if (submission.type === "ACCOMMODATION" && data.accommodationType) {
      await prisma.accommodation.create({
        data: {
          destinationId: destination.id,
          type: data.accommodationType,
          name:
            data.accommodationName || `${data.accommodationType} in ${city}`,
          url: data.accommodationUrl,
          pricePerMonth: data.monthlyRent ? parseInt(data.monthlyRent) : null,
          description: data.accommodationDescription,
          address: data.accommodationAddress,
          city,
          country,
        },
      });
    }

    // Add course exchange info if available
    if (submission.type === "COURSE_MATCHING" && data.hostUniversity) {
      await prisma.courseExchange.create({
        data: {
          destinationId: destination.id,
          homeCourse: data.homeCourse || "General Studies",
          hostCourse: data.hostCourse || "Exchange Program",
          ects: data.ects ? parseInt(data.ects) : null,
          approved: true,
        },
      });
    }

    return destination;
  } catch (error) {
    console.error("Error creating destination from submission:", error);
  }
}
