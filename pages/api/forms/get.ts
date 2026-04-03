import { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession, isAdmin } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import {
  getClientSafeDatabaseUnavailableCause,
  getClientSafeDatabaseUnavailableDetails,
  isDatabaseConnectionError,
} from "../../../lib/databaseErrors";
import {
  ensureRequestId,
  logApiError,
  withRequestId,
} from "../../../lib/apiRequestContext";
import { sanitizeFormSubmissionLivingExpensesData } from "../../../src/lib/formSubmissionLivingExpenses";

function getStoredFormTypeVariants(type: string): string[] {
  const normalized = type.toLowerCase().replace(/_/g, "-");

  return Array.from(
    new Set([normalized, normalized.toUpperCase().replace(/-/g, "_")]),
  );
}

function isLivingExpensesSubmissionType(type: string): boolean {
  return getStoredFormTypeVariants("living-expenses").includes(type);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  ensureRequestId(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerAuthSession(req, res);
  if (!session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { type, status, userId } = req.query;

    // Build query conditions
    const whereClause: any = {};

    // Filter by user
    if (userId && userId !== "all") {
      // Only admins can view other users' submissions
      if (!isAdmin(session)) {
        whereClause.userId = session.user.id;
      } else {
        whereClause.userId = userId as string;
      }
    } else {
      // Default to current user's submissions unless admin viewing all
      if (!isAdmin(session) || !userId) {
        whereClause.userId = session.user.id;
      }
    }

    // Filter by type
    if (type && type !== "all") {
      whereClause.type = {
        in: getStoredFormTypeVariants(type as string),
      };
    }

    // Filter by status
    if (status && status !== "all") {
      whereClause.status = (status as string).toUpperCase();
    }

    // Fetch submissions from database
    const submissions = await prisma.form_submissions.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform to match expected format
    const transformedSubmissions = submissions.map((submission) => ({
      id: submission.id,
      userId: submission.users.email,
      type: submission.type.toLowerCase().replace("_", "-"),
      title: submission.title,
      data: isLivingExpensesSubmissionType(submission.type)
        ? sanitizeFormSubmissionLivingExpensesData(submission.data)
        : submission.data,
      status: submission.status.toLowerCase(),
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      user: submission.users,
    }));

    res.status(200).json({ submissions: transformedSubmissions });
  } catch (error) {
    logApiError(req, res, "Error fetching submissions", error);

    if (isDatabaseConnectionError(error)) {
      const cause = getClientSafeDatabaseUnavailableCause(error);

      return res.status(503).json(
        withRequestId(req, res, {
          message: "Database unavailable",
          details: getClientSafeDatabaseUnavailableDetails(),
          ...(cause ? { cause } : {}),
        }),
      );
    }

    res
      .status(500)
      .json(withRequestId(req, res, { message: "Internal server error" }));
  }
}
