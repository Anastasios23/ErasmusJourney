import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";

/**
 * Approve Submission
 *
 * POST /api/admin/submissions/[id]/approve - Approve a submission and generate denormalized views
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid submission ID" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const submission = await prisma.student_submissions.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.status !== "PENDING") {
      return res.status(400).json({
        error: "Can only approve PENDING submissions",
        currentStatus: submission.status,
      });
    }

    const { adminNotes, qualityScore, isFeatured } = req.body;

    // Use transaction to ensure all-or-nothing operation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update submission to APPROVED
      const approvedSubmission = await tx.student_submissions.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedBy: user.id,
          reviewedAt: new Date(),
          publishedAt: new Date(),
          adminNotes: adminNotes || null,
          qualityScore: qualityScore || null,
          isFeatured: isFeatured || false,
          isPublic: true,
          processed: true,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // 2. Generate denormalized views based on submission type
      const data = submission.data as any;
      const studentName =
        `${submission.author?.firstName || ""} ${submission.author?.lastName || ""}`.trim();

      if (submission.submissionType === "ACCOMMODATION") {
        // Create accommodation view
        await tx.accommodation_views.create({
          data: {
            sourceSubmissionId: submission.id,
            type: data.accommodationType || data.type || "UNKNOWN",
            name: data.name || data.accommodationName || "Unnamed",
            city: submission.hostCity || data.city || "",
            country: submission.hostCountry || data.country || "",
            pricePerMonth: data.monthlyRent || data.pricePerMonth || null,
            currency: data.currency || "EUR",
            neighborhood: data.neighborhood || data.location || null,
            description: data.description || data.details || null,
            pros: Array.isArray(data.pros) ? data.pros : [],
            cons: Array.isArray(data.cons) ? data.cons : [],
            status: "APPROVED",
            isPublic: true,
            isFeatured: isFeatured || false,
            studentName,
            submittedAt: submission.submittedAt,
          },
        });
      } else if (submission.submissionType === "COURSE_EXCHANGE") {
        // Create course exchange view
        await tx.course_exchange_views.create({
          data: {
            sourceSubmissionId: submission.id,
            homeCourse: data.homeCourse || "",
            hostCourse: data.hostCourse || "",
            hostUniversity:
              submission.hostUniversity || data.hostUniversity || "",
            city: submission.hostCity || data.city || "",
            country: submission.hostCountry || data.country || "",
            ects: data.ects || data.credits || null,
            semester: submission.semester || data.semester || null,
            studyLevel: data.studyLevel || data.level || null,
            fieldOfStudy: data.fieldOfStudy || data.field || null,
            courseQuality: data.courseQuality || data.rating || null,
            description: data.description || data.review || null,
            status: "APPROVED",
            isPublic: true,
            studentName,
            submittedAt: submission.submittedAt,
          },
        });
      } else if (submission.submissionType === "FULL_EXPERIENCE") {
        // Create views for accommodations within full experience
        if (data.accommodation) {
          const accData = data.accommodation;
          await tx.accommodation_views.create({
            data: {
              sourceSubmissionId: submission.id,
              type: accData.type || "OTHER",
              name: accData.name || "From experience",
              city: submission.hostCity || "",
              country: submission.hostCountry || "",
              pricePerMonth:
                accData.monthlyRent || accData.pricePerMonth || null,
              currency: accData.currency || "EUR",
              neighborhood: accData.neighborhood || null,
              description: accData.description || null,
              pros: Array.isArray(accData.pros) ? accData.pros : [],
              cons: Array.isArray(accData.cons) ? accData.cons : [],
              status: "APPROVED",
              isPublic: true,
              isFeatured: isFeatured || false,
              studentName,
              submittedAt: submission.submittedAt,
            },
          });
        }

        // Create views for courses within full experience
        if (Array.isArray(data.courses)) {
          for (const course of data.courses) {
            await tx.course_exchange_views.create({
              data: {
                sourceSubmissionId: submission.id,
                homeCourse: course.homeCourse || "",
                hostCourse: course.hostCourse || course.name || "",
                hostUniversity: submission.hostUniversity || "",
                city: submission.hostCity || "",
                country: submission.hostCountry || "",
                ects: course.ects || course.credits || null,
                semester: submission.semester || null,
                studyLevel: data.basicInfo?.studyLevel || null,
                fieldOfStudy: data.basicInfo?.fieldOfStudy || null,
                courseQuality: course.rating || course.quality || null,
                description: course.description || course.review || null,
                status: "APPROVED",
                isPublic: true,
                studentName,
                submittedAt: submission.submittedAt,
              },
            });
          }
        }
      }

      return approvedSubmission;
    });

    return res.status(200).json({
      message: "Submission approved successfully",
      submission: result,
    });
  } catch (error) {
    console.error("Approve Submission API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
