import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

/**
 * Submission Status Tracking API
 *
 * Get detailed status information for a specific submission including:
 * - Current status and timeline
 * - Status history
 * - Next recommended actions
 * - Review feedback
 * - Related information
 *
 * GET /api/user/submission-status?id=<submissionId>
 */

type SubmissionStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REVISION_NEEDED"
  | "ARCHIVED";

interface StatusTimeline {
  status: string;
  timestamp: Date | null;
  actor: string | null;
  note: string | null;
}

interface NextAction {
  action: string;
  description: string;
  priority: "high" | "medium" | "low";
  icon: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only GET method allowed
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Submission ID is required" });
    }

    // Get user
    const user = await prisma.users.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch submission with full details
    const submission = await prisma.student_submissions.findUnique({
      where: { id },
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
        previousVersion: {
          select: {
            id: true,
            version: true,
            status: true,
            createdAt: true,
          },
        },
        versions: {
          select: {
            id: true,
            version: true,
            status: true,
            createdAt: true,
            reviewFeedback: true,
          },
          orderBy: { version: "asc" },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Check ownership
    if (submission.userId !== user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Build status timeline
    const timeline = buildStatusTimeline(submission);

    // Get next recommended actions
    const nextActions = getNextActions(submission);

    // Calculate progress percentage
    const progress = calculateProgress(
      submission.status as SubmissionStatus,
      submission.formStep,
    );

    // Format response
    const response = {
      submission: {
        id: submission.id,
        submissionType: submission.submissionType,
        status: submission.status,
        title: submission.title,
        hostCity: submission.hostCity,
        hostCountry: submission.hostCountry,
        hostUniversity: submission.hostUniversity,
        semester: submission.semester,
        academicYear: submission.academicYear,
        formStep: submission.formStep,
        version: submission.version,
        isPublic: submission.isPublic,
        isFeatured: submission.isFeatured,
        qualityScore: submission.qualityScore,
        tags: submission.tags,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        submittedAt: submission.submittedAt,
        reviewedAt: submission.reviewedAt,
      },
      statusInfo: {
        current: submission.status,
        label: getStatusLabel(submission.status as SubmissionStatus),
        description: getStatusDescription(
          submission.status as SubmissionStatus,
        ),
        color: getStatusColor(submission.status as SubmissionStatus),
        icon: getStatusIcon(submission.status as SubmissionStatus),
        progress,
      },
      timeline,
      nextActions,
      review: submission.reviewFeedback
        ? {
            feedback: submission.reviewFeedback,
            reviewedBy: submission.reviewer
              ? `${submission.reviewer.firstName} ${submission.reviewer.lastName}`
              : null,
            reviewedAt: submission.reviewedAt,
          }
        : null,
      versions: submission.versions.map((v) => ({
        id: v.id,
        version: v.version,
        status: v.status,
        createdAt: v.createdAt,
        hasFeedback: !!v.reviewFeedback,
      })),
      waitTime:
        submission.submittedAt && !submission.reviewedAt
          ? calculateWaitTime(submission.submittedAt)
          : null,
    };

    // Cache for 1 minute (status info changes frequently)
    res.setHeader(
      "Cache-Control",
      "private, s-maxage=60, stale-while-revalidate=120",
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Submission Status API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Build status timeline from submission data
 */
function buildStatusTimeline(submission: any): StatusTimeline[] {
  const timeline: StatusTimeline[] = [];

  // Created
  timeline.push({
    status: "DRAFT",
    timestamp: submission.createdAt,
    actor: `${submission.author.firstName} ${submission.author.lastName}`,
    note: "Submission created",
  });

  // Submitted
  if (submission.submittedAt) {
    timeline.push({
      status: "PENDING",
      timestamp: submission.submittedAt,
      actor: `${submission.author.firstName} ${submission.author.lastName}`,
      note: "Submitted for review",
    });
  }

  // Reviewed
  if (submission.reviewedAt) {
    timeline.push({
      status: submission.status,
      timestamp: submission.reviewedAt,
      actor: submission.reviewer
        ? `${submission.reviewer.firstName} ${submission.reviewer.lastName}`
        : "Admin",
      note:
        submission.reviewFeedback ||
        `Marked as ${submission.status.toLowerCase()}`,
    });
  }

  return timeline;
}

/**
 * Get next recommended actions based on status
 */
function getNextActions(submission: any): NextAction[] {
  const actions: NextAction[] = [];
  const status = submission.status as SubmissionStatus;

  switch (status) {
    case "DRAFT":
      actions.push({
        action: "Complete Form",
        description: "Finish filling out all required fields",
        priority: "high",
        icon: "📝",
      });
      actions.push({
        action: "Review & Submit",
        description: "Review your information and submit for approval",
        priority: "high",
        icon: "🚀",
      });
      break;

    case "PENDING":
      actions.push({
        action: "Wait for Review",
        description: "Your submission is being reviewed by our team",
        priority: "medium",
        icon: "⏳",
      });
      actions.push({
        action: "Check Status",
        description: "Check back later for updates",
        priority: "low",
        icon: "🔍",
      });
      break;

    case "REVISION_NEEDED":
      actions.push({
        action: "Review Feedback",
        description: "Read the admin's feedback carefully",
        priority: "high",
        icon: "💬",
      });
      actions.push({
        action: "Make Changes",
        description: "Update your submission based on feedback",
        priority: "high",
        icon: "✏️",
      });
      actions.push({
        action: "Resubmit",
        description: "Submit your revised version for re-review",
        priority: "high",
        icon: "🔄",
      });
      break;

    case "APPROVED":
      actions.push({
        action: "View Published",
        description: "See your submission live on the platform",
        priority: "medium",
        icon: "✅",
      });
      actions.push({
        action: "Share",
        description: "Share your experience with others",
        priority: "low",
        icon: "🔗",
      });
      break;

    case "REJECTED":
      actions.push({
        action: "Read Feedback",
        description: "Understand why the submission was rejected",
        priority: "high",
        icon: "📖",
      });
      actions.push({
        action: "Create New",
        description: "Start a new submission with improvements",
        priority: "medium",
        icon: "➕",
      });
      break;

    case "ARCHIVED":
      actions.push({
        action: "Restore",
        description: "Unarchive this submission if needed",
        priority: "low",
        icon: "📦",
      });
      break;
  }

  return actions;
}

/**
 * Calculate progress percentage based on status and form step
 */
function calculateProgress(
  status: SubmissionStatus,
  formStep: number | null,
): number {
  // Status-based progress
  const statusProgress: Record<SubmissionStatus, number> = {
    DRAFT: 25,
    PENDING: 50,
    REVISION_NEEDED: 40,
    APPROVED: 100,
    REJECTED: 0,
    ARCHIVED: 0,
  };

  let progress = statusProgress[status];

  // Adjust for form step (if in draft)
  if (status === "DRAFT" && formStep !== null) {
    const stepProgress = Math.min((formStep / 10) * 25, 25); // Max 25% for drafts
    progress = stepProgress;
  }

  return Math.round(progress);
}

/**
 * Calculate wait time since submission
 */
function calculateWaitTime(submittedAt: Date): {
  days: number;
  hours: number;
  label: string;
} {
  const now = new Date();
  const diff = now.getTime() - new Date(submittedAt).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let label = "";
  if (days > 0) {
    label = `${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0) label += ` ${hours} hour${hours > 1 ? "s" : ""}`;
  } else {
    label = `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return { days, hours, label };
}

/**
 * Get status label
 */
function getStatusLabel(status: SubmissionStatus): string {
  const labels: Record<SubmissionStatus, string> = {
    DRAFT: "Draft",
    PENDING: "Under Review",
    REVISION_NEEDED: "Needs Revision",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    ARCHIVED: "Archived",
  };
  return labels[status];
}

/**
 * Get status description
 */
function getStatusDescription(status: SubmissionStatus): string {
  const descriptions: Record<SubmissionStatus, string> = {
    DRAFT:
      "Your submission is still being drafted. Complete and submit when ready.",
    PENDING:
      "Your submission is being reviewed by our team. We'll notify you when it's ready.",
    REVISION_NEEDED:
      "The reviewer has requested changes. Please review the feedback and resubmit.",
    APPROVED:
      "Congratulations! Your submission has been approved and is now live.",
    REJECTED:
      "Your submission was not approved. Please read the feedback for more details.",
    ARCHIVED: "This submission has been archived and is no longer active.",
  };
  return descriptions[status];
}

/**
 * Get status color
 */
function getStatusColor(status: SubmissionStatus): string {
  const colors: Record<SubmissionStatus, string> = {
    DRAFT: "gray",
    PENDING: "blue",
    REVISION_NEEDED: "yellow",
    APPROVED: "green",
    REJECTED: "red",
    ARCHIVED: "gray",
  };
  return colors[status];
}

/**
 * Get status icon
 */
function getStatusIcon(status: SubmissionStatus): string {
  const icons: Record<SubmissionStatus, string> = {
    DRAFT: "📝",
    PENDING: "⏳",
    REVISION_NEEDED: "✏️",
    APPROVED: "✅",
    REJECTED: "❌",
    ARCHIVED: "📦",
  };
  return icons[status];
}
