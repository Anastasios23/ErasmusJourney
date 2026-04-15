import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import { buildPreviewUnavailableReason } from "../../../../../src/lib/adminPublicImpactPreview";
import {
  EXPERIENCE_STATUS,
  MAX_REVISION_COUNT,
  REVIEW_ACTION,
} from "../../../../../src/lib/canonicalWorkflow";
import { sanitizeBasicInformationData } from "../../../../../src/lib/basicInformation";
import {
  buildStoredPublicWordingEdits,
  getPublicWordingEditorState,
  hasPublicWordingEdits,
  normalizeReviewAction,
  summarizePublicWordingChanges,
  type CanonicalReviewAction,
  type PublicWordingEditorState,
} from "../../../../../src/lib/experienceModeration";
import { isExperienceReviewableStatus } from "../../../../../src/lib/experienceWorkflow";
import { buildPublicDestinationSlug } from "../../../../../src/lib/publicRoutes";
import { getClientSafeErrorMessage } from "../../../../../lib/databaseErrors";
import { sendRequestChangesEmail } from "../../../../../src/server/moderationEmails";
import { refreshPublicDestinationReadModel } from "../../../../../src/server/publicDestinations";
import { revalidatePublicDestinationPages } from "../../../../../src/server/publicDestinationRevalidation";

const PRISMA_DB_NULL = (require("@prisma/client") as any).Prisma.DbNull;

/**
 * Admin Review API Endpoint
 * POST|PATCH /api/admin/erasmus-experiences/[id]/review
 *
 * Actions:
 * - APPROVED: Approve submission and refresh canonical public destination aggregates
 * - UNPUBLISH: Return an approved submission to moderation queue and refresh canonical public destination aggregates
 * - REJECTED: Reject submission with feedback
 * - REQUEST_CHANGES: Return submission to editable revision state and notify student
 * - WORDING_EDITED: Save public wording-only overrides without changing status
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: (session.user as any).id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Forbidden: Admin access required" });
    }

    const { id } = req.query;
    const { action, feedback, wordingEdits } =
      req.body && typeof req.body === "object"
        ? (req.body as Record<string, unknown>)
        : { action: null, feedback: "", wordingEdits: null };
    const rawAction = typeof action === "string" ? action.trim() : "";
    const isUnpublishAction = rawAction === "UNPUBLISH";
    const normalizedAction = isUnpublishAction
      ? null
      : normalizeReviewAction(rawAction);
    const requestAction: CanonicalReviewAction | "UNPUBLISH" | null =
      isUnpublishAction ? "UNPUBLISH" : normalizedAction;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Experience ID required" });
    }

    if (!requestAction) {
      return res.status(400).json({
        error:
          "Valid action required: APPROVED, REJECTED, REQUEST_CHANGES, WORDING_EDITED, or UNPUBLISH",
      });
    }

    // Fetch the experience
    const experience = await prisma.erasmusExperience.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    if (
      requestAction === "UNPUBLISH" &&
      experience.status !== EXPERIENCE_STATUS.APPROVED
    ) {
      return res.status(409).json({
        error:
          "Only approved submissions can be unpublished through the canonical moderation workflow.",
        status: experience.status,
      });
    }

    if (
      requestAction !== "UNPUBLISH" &&
      !isExperienceReviewableStatus(experience.status)
    ) {
      return res.status(409).json({
        error:
          "Only submissions currently in SUBMITTED status can be reviewed through the canonical moderation workflow.",
        status: experience.status,
      });
    }

    // Check revision limit
    if (
      requestAction === REVIEW_ACTION.REQUEST_CHANGES &&
      experience.revisionCount >= MAX_REVISION_COUNT
    ) {
      return res.status(400).json({
        error: "Maximum revision limit reached. Please approve or reject.",
      });
    }

    if (requestAction === REVIEW_ACTION.APPROVED) {
      const unavailableReason = buildPreviewUnavailableReason(experience);

      if (unavailableReason) {
        return res.status(400).json({
          error: unavailableReason.message,
          code: unavailableReason.code,
          missingFields: unavailableReason.missingFields,
        });
      }
    }

    const currentWordingState = getPublicWordingEditorState(experience);
    const normalizedFeedback =
      typeof feedback === "string" ? feedback.trim() : "";
    const nextWordingState = buildRequestedWordingState(
      currentWordingState,
      wordingEdits,
    );
    const wordingChanges = nextWordingState
      ? summarizePublicWordingChanges(experience, nextWordingState)
      : [];
    const hasWordingChanges = wordingChanges.length > 0;

    if (requestAction === REVIEW_ACTION.WORDING_EDITED && !hasWordingChanges) {
      return res.status(400).json({
        error: "At least one wording change is required before saving edits.",
      });
    }

    if (
      (requestAction === REVIEW_ACTION.REJECTED ||
        requestAction === REVIEW_ACTION.REQUEST_CHANGES) &&
      typeof feedback !== "string"
    ) {
      return res.status(400).json({
        error:
          requestAction === REVIEW_ACTION.REJECTED
            ? "Feedback required for rejection"
            : "Feedback required when requesting changes",
      });
    }

    if (
      (requestAction === REVIEW_ACTION.REJECTED ||
        requestAction === REVIEW_ACTION.REQUEST_CHANGES) &&
      !normalizedFeedback
    ) {
      return res.status(400).json({
        error:
          requestAction === REVIEW_ACTION.REJECTED
            ? "Feedback required for rejection"
            : "Feedback required when requesting changes",
      });
    }

    const updateData: Record<string, any> = {
      reviewedAt: new Date(),
      reviewedBy: (session.user as any).id,
    };

    if (
      requestAction !== REVIEW_ACTION.WORDING_EDITED &&
      requestAction !== "UNPUBLISH"
    ) {
      updateData.reviewFeedback = normalizedFeedback || null;
    }

    if (hasWordingChanges && nextWordingState) {
      const storedWordingEdits = buildStoredPublicWordingEdits(
        experience,
        nextWordingState,
      );
      if (hasPublicWordingEdits(storedWordingEdits)) {
        updateData.publicWordingOverrides = storedWordingEdits;
      } else {
        updateData.publicWordingOverrides = PRISMA_DB_NULL;
      }
    }

    switch (requestAction) {
      case REVIEW_ACTION.APPROVED:
        updateData.status = EXPERIENCE_STATUS.APPROVED;
        updateData.publishedAt = new Date();
        break;
      case "UNPUBLISH":
        updateData.status = EXPERIENCE_STATUS.SUBMITTED;
        updateData.publishedAt = null;
        break;
      case REVIEW_ACTION.REJECTED:
        updateData.status = EXPERIENCE_STATUS.REJECTED;
        updateData.publishedAt = null;
        break;
      case REVIEW_ACTION.REQUEST_CHANGES:
        updateData.status = EXPERIENCE_STATUS.REVISION_NEEDED;
        updateData.revisionCount = experience.revisionCount + 1;
        updateData.publishedAt = null;
        break;
      case REVIEW_ACTION.WORDING_EDITED:
        break;
      default:
        break;
    }

    const { updatedExperience, reviewActions } = await prisma.$transaction(
      async (tx) => {
        const updatedRecord = await tx.erasmusExperience.update({
          where: { id },
          data: updateData,
        });

        const createdReviewActions: Array<{
          id: string;
          action: string;
          feedback: string | null;
        }> = [];

        if (hasWordingChanges) {
          createdReviewActions.push(
            await tx.reviewAction.create({
              data: {
                experienceId: id,
                adminId: (session.user as any).id,
                action: REVIEW_ACTION.WORDING_EDITED,
                feedback: formatWordingEditAuditFeedback(wordingChanges),
              },
            }),
          );
        }

        if (requestAction === "UNPUBLISH") {
          createdReviewActions.push(
            await tx.reviewAction.create({
              data: {
                experienceId: id,
                adminId: (session.user as any).id,
                action: "UNPUBLISHED",
                feedback:
                  normalizedFeedback ||
                  "Submission unpublished and returned to moderation queue.",
              },
            }),
          );
        } else if (requestAction !== REVIEW_ACTION.WORDING_EDITED) {
          createdReviewActions.push(
            await tx.reviewAction.create({
              data: {
                experienceId: id,
                adminId: (session.user as any).id,
                action: requestAction,
                feedback: normalizedFeedback || null,
              },
            }),
          );
        }

        return {
          updatedExperience: updatedRecord,
          reviewActions: createdReviewActions,
        };
      },
    );

    let refreshFailed = false;

    if (
      requestAction === REVIEW_ACTION.APPROVED ||
      requestAction === "UNPUBLISH"
    ) {
      try {
        await refreshPublicDestinationReadModel();
        await revalidatePublicDestinationPages(
          res,
          experience.hostCity && experience.hostCountry
            ? buildPublicDestinationSlug(
                experience.hostCity,
                experience.hostCountry,
              )
            : null,
        );
      } catch (refreshError) {
        console.error(
          requestAction === "UNPUBLISH"
            ? "Error refreshing public destination read model after unpublish:"
            : "Error refreshing public destination read model after approval:",
          refreshError,
        );
        refreshFailed = true;
      }
    }

    // CityStatistics was removed from the canonical schema.
    // Public destination aggregates now come from PublicDestinationReadModel only.

    const notification =
      requestAction === REVIEW_ACTION.REQUEST_CHANGES
        ? await sendRequestChangesEmail({
            studentEmail: experience.users?.email || "",
            studentName: [
              experience.users?.firstName,
              experience.users?.lastName,
            ]
              .filter(Boolean)
              .join(" ")
              .trim(),
            reviewFeedback: normalizedFeedback,
            hostCity: experience.hostCity,
            hostCountry: experience.hostCountry,
            hostUniversity:
              sanitizeBasicInformationData(experience.basicInfo)
                .hostUniversity || null,
          })
        : null;

    return res.status(200).json({
      success: true,
      experience: updatedExperience,
      reviewAction: reviewActions[reviewActions.length - 1] ?? null,
      reviewActions,
      ...(notification
        ? {
            notification,
            ...(notification.status !== "sent"
              ? { emailStatus: notification.status }
              : {}),
          }
        : {}),
      ...(refreshFailed ? { refreshFailed: true } : {}),
      message: getSuccessMessage(requestAction, {
        wordingEditsSaved: hasWordingChanges,
        notification,
      }),
    });
  } catch (error) {
    console.error("Error reviewing experience:", error);
    return res.status(500).json({
      error: "Failed to review experience",
      details: getClientSafeErrorMessage(
        error,
        "Unable to review the experience right now.",
      ),
    });
  }
}

function buildRequestedWordingState(
  currentState: PublicWordingEditorState,
  input: unknown,
): PublicWordingEditorState | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  const source = input as Record<string, unknown>;
  const courseNotesInput =
    source.courseNotes && typeof source.courseNotes === "object"
      ? (source.courseNotes as Record<string, unknown>)
      : {};

  return {
    accommodationReview:
      typeof source.accommodationReview === "string"
        ? source.accommodationReview
        : currentState.accommodationReview,
    generalTips:
      typeof source.generalTips === "string"
        ? source.generalTips
        : currentState.generalTips,
    academicAdvice:
      typeof source.academicAdvice === "string"
        ? source.academicAdvice
        : currentState.academicAdvice,
    socialAdvice:
      typeof source.socialAdvice === "string"
        ? source.socialAdvice
        : currentState.socialAdvice,
    bestExperience:
      typeof source.bestExperience === "string"
        ? source.bestExperience
        : currentState.bestExperience,
    courseNotes: currentState.courseNotes.map((courseNote) => ({
      ...courseNote,
      value:
        typeof courseNotesInput[courseNote.id] === "string"
          ? (courseNotesInput[courseNote.id] as string)
          : courseNote.value,
    })),
  };
}

function formatWordingEditAuditFeedback(
  wordingChanges: Array<{ label: string; mode: "updated" | "cleared" }>,
): string {
  return wordingChanges
    .map((change) =>
      change.mode === "cleared"
        ? `Cleared ${change.label}`
        : `Updated ${change.label}`,
    )
    .join("; ");
}

/**
 * Get success message based on action
 */
function getSuccessMessage(
  action: CanonicalReviewAction | "UNPUBLISH",
  options?: {
    wordingEditsSaved?: boolean;
    notification?: {
      status: "sent" | "skipped" | "failed";
      reason?: string;
    } | null;
  },
): string {
  const wordingSuffix = options?.wordingEditsSaved
    ? " Wording-only public edits were saved with an audit trail."
    : "";

  switch (action) {
    case REVIEW_ACTION.APPROVED:
      return `Experience approved successfully. Public aggregates were refreshed.${wordingSuffix}`;
    case "UNPUBLISH":
      return "Submission unpublished and returned to moderation queue. Public aggregates were refreshed.";
    case REVIEW_ACTION.REJECTED:
      return `Experience rejected.${wordingSuffix}`;
    case REVIEW_ACTION.REQUEST_CHANGES:
      if (options?.notification?.status === "sent") {
        return `Changes requested. Submission returned to editable revision state and the student was emailed.${wordingSuffix}`;
      }

      if (options?.notification?.status === "failed") {
        return `Changes requested. Submission returned to editable revision state, but the email notification failed: ${options.notification.reason}.${wordingSuffix}`;
      }

      if (options?.notification?.status === "skipped") {
        return `Changes requested. Submission returned to editable revision state, but no email was sent: ${options.notification.reason}.${wordingSuffix}`;
      }

      return `Changes requested. Submission returned to editable revision state.${wordingSuffix}`;
    case REVIEW_ACTION.WORDING_EDITED:
      return "Public wording edits saved. Student source data remains unchanged.";
    default:
      return "Review completed successfully.";
  }
}
