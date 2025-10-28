import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

/**
 * Draft Management API
 *
 * Manage draft submissions before final submission:
 * - List all drafts
 * - Update draft data
 * - Delete drafts
 * - Auto-save support
 *
 * GET    /api/user/drafts - List all drafts
 * PUT    /api/user/drafts - Update a draft
 * DELETE /api/user/drafts - Delete a draft
 */

type SubmissionType =
  | "FULL_EXPERIENCE"
  | "ACCOMMODATION"
  | "COURSE_EXCHANGE"
  | "QUICK_TIP"
  | "DESTINATION_INFO";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get user
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.method === "GET") {
      return await handleGet(req, res, user.id);
    } else if (req.method === "PUT") {
      return await handlePut(req, res, user.id);
    } else if (req.method === "DELETE") {
      return await handleDelete(req, res, user.id);
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res
        .status(405)
        .json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Draft Management API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * GET - List all draft submissions
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  const { type, sortBy = "updatedAt", order = "desc" } = req.query;

  // Build where clause
  const where: any = {
    userId,
    status: "DRAFT",
  };

  // Filter by type
  if (type && typeof type === "string") {
    where.submissionType = type as SubmissionType;
  }

  // Determine sort order
  const orderBy: any = {};
  if (sortBy === "updatedAt" || sortBy === "createdAt") {
    orderBy[sortBy] = order === "asc" ? "asc" : "desc";
  } else {
    orderBy.updatedAt = "desc"; // Default
  }

  // Fetch drafts
  const drafts = await prisma.student_submissions.findMany({
    where,
    orderBy,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Group by type for easier UI rendering
  const groupedByType: Record<string, any[]> = {};
  drafts.forEach((draft) => {
    const type = draft.submissionType;
    if (!groupedByType[type]) {
      groupedByType[type] = [];
    }
    groupedByType[type].push({
      id: draft.id,
      submissionType: draft.submissionType,
      title: draft.title,
      hostCity: draft.hostCity,
      hostCountry: draft.hostCountry,
      hostUniversity: draft.hostUniversity,
      semester: draft.semester,
      academicYear: draft.academicYear,
      formStep: draft.formStep,
      data: draft.data,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
      lastModified: getLastModifiedLabel(draft.updatedAt),
      completeness: calculateCompleteness(draft),
    });
  });

  // Calculate total completeness
  const totalCompleteness =
    drafts.length > 0
      ? Math.round(
          drafts.reduce((sum, draft) => sum + calculateCompleteness(draft), 0) /
            drafts.length,
        )
      : 0;

  // Cache for 30 seconds
  res.setHeader(
    "Cache-Control",
    "private, s-maxage=30, stale-while-revalidate=60",
  );

  return res.status(200).json({
    drafts,
    groupedByType,
    summary: {
      total: drafts.length,
      byType: Object.keys(groupedByType).reduce(
        (acc, type) => {
          acc[type] = groupedByType[type].length;
          return acc;
        },
        {} as Record<string, number>,
      ),
      avgCompleteness: totalCompleteness,
    },
  });
}

/**
 * PUT - Update a draft submission
 */
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  const { id } = req.query;
  const {
    data,
    title,
    hostCity,
    hostCountry,
    hostUniversity,
    semester,
    academicYear,
    formStep,
    tags,
  } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Draft ID is required" });
  }

  // Check if draft exists and belongs to user
  const existingDraft = await prisma.student_submissions.findUnique({
    where: { id: id as string },
  });

  if (!existingDraft) {
    return res.status(404).json({ error: "Draft not found" });
  }

  if (existingDraft.userId !== userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (existingDraft.status !== "DRAFT") {
    return res
      .status(400)
      .json({ error: "Cannot update non-draft submission" });
  }

  // Update draft
  const updateData: any = {};

  if (data !== undefined) updateData.data = data;
  if (title !== undefined) updateData.title = title;
  if (hostCity !== undefined) updateData.hostCity = hostCity;
  if (hostCountry !== undefined) updateData.hostCountry = hostCountry;
  if (hostUniversity !== undefined) updateData.hostUniversity = hostUniversity;
  if (semester !== undefined) updateData.semester = semester;
  if (academicYear !== undefined) updateData.academicYear = academicYear;
  if (formStep !== undefined) updateData.formStep = formStep;
  if (tags !== undefined) updateData.tags = tags;

  const updatedDraft = await prisma.student_submissions.update({
    where: { id: id as string },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return res.status(200).json({
    draft: updatedDraft,
    message: "Draft updated successfully",
    completeness: calculateCompleteness(updatedDraft),
  });
}

/**
 * DELETE - Delete a draft submission
 */
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Draft ID is required" });
  }

  // Check if draft exists and belongs to user
  const existingDraft = await prisma.student_submissions.findUnique({
    where: { id: id as string },
  });

  if (!existingDraft) {
    return res.status(404).json({ error: "Draft not found" });
  }

  if (existingDraft.userId !== userId) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (existingDraft.status !== "DRAFT") {
    return res.status(400).json({
      error: "Cannot delete non-draft submission",
      hint: "Only drafts can be deleted. Consider archiving instead.",
    });
  }

  // Delete draft
  await prisma.student_submissions.delete({
    where: { id: id as string },
  });

  return res.status(200).json({
    message: "Draft deleted successfully",
    deletedId: id,
  });
}

/**
 * Calculate draft completeness percentage
 */
function calculateCompleteness(draft: any): number {
  const data = draft.data || {};
  let filledFields = 0;
  let totalFields = 0;

  // Count required fields based on submission type
  const requiredFields = getRequiredFields(draft.submissionType);

  requiredFields.forEach((field) => {
    totalFields++;
    const value = getNestedValue(data, field);
    if (value !== null && value !== undefined && value !== "") {
      filledFields++;
    }
  });

  // Also check top-level fields
  if (draft.title) filledFields++;
  if (draft.hostCity) filledFields++;
  if (draft.hostCountry) filledFields++;
  if (draft.hostUniversity) filledFields++;
  totalFields += 4;

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}

/**
 * Get required fields for each submission type
 */
function getRequiredFields(submissionType: string): string[] {
  const fieldMap: Record<string, string[]> = {
    FULL_EXPERIENCE: [
      "personalInfo.firstName",
      "personalInfo.lastName",
      "personalInfo.email",
      "academicInfo.homeUniversity",
      "academicInfo.major",
      "academicInfo.year",
      "exchangeDetails.hostUniversity",
      "exchangeDetails.hostCity",
      "exchangeDetails.semester",
      "exchangeDetails.academicYear",
    ],
    ACCOMMODATION: [
      "accommodationType",
      "city",
      "neighborhood",
      "monthlyRent",
      "deposit",
      "pros",
      "cons",
    ],
    COURSE_EXCHANGE: [
      "homeUniversity",
      "hostUniversity",
      "homeCourse.name",
      "homeCourse.code",
      "hostCourse.name",
      "hostCourse.code",
      "matchQuality",
    ],
    QUICK_TIP: ["category", "tip", "city"],
    DESTINATION_INFO: ["city", "country", "description"],
  };

  return fieldMap[submissionType] || [];
}

/**
 * Get nested value from object
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Get human-readable last modified label
 */
function getLastModifiedLabel(updatedAt: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(updatedAt).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (days < 30)
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return new Date(updatedAt).toLocaleDateString();
}
