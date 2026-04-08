import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import * as PrismaClientPackage from "@prisma/client";
import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import { buildPreviewUnavailableReason } from "../../../../../src/lib/adminPublicImpactPreview";
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
import {
  calculateLivingExpensesTotal,
  sanitizeLivingExpensesStepData,
} from "../../../../../src/lib/livingExpenses";
import { getClientSafeErrorMessage } from "../../../../../lib/databaseErrors";
import { sendRequestChangesEmail } from "../../../../../src/server/moderationEmails";
import { refreshPublicDestinationReadModel } from "../../../../../src/server/publicDestinations";
import { revalidatePublicDestinationPages } from "../../../../../src/server/publicDestinationRevalidation";

const PRISMA_DB_NULL = (PrismaClientPackage as any).Prisma?.DbNull;

/**
 * Admin Review API Endpoint
 * POST /api/admin/erasmus-experiences/[id]/review
 *
 * Actions:
 * - APPROVED: Approve submission, trigger stats calculation
 * - REJECTED: Reject submission with feedback
 * - REQUEST_CHANGES: Return submission to editable revision state and notify student
 * - WORDING_EDITED: Save public wording-only overrides without changing status
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
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
    const normalizedAction =
      typeof action === "string" ? normalizeReviewAction(action) : null;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Experience ID required" });
    }

    if (!normalizedAction) {
      return res.status(400).json({
        error:
          "Valid action required: APPROVED, REJECTED, REQUEST_CHANGES, or WORDING_EDITED",
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

    if (!isExperienceReviewableStatus(experience.status)) {
      return res.status(409).json({
        error:
          "Only submissions currently in SUBMITTED status can be reviewed through the canonical moderation workflow.",
        status: experience.status,
      });
    }

    // Check revision limit
    if (normalizedAction === "REQUEST_CHANGES" && experience.revisionCount >= 1) {
      return res.status(400).json({
        error: "Maximum revision limit reached. Please approve or reject.",
      });
    }

    if (normalizedAction === "APPROVED") {
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

    if (normalizedAction === "WORDING_EDITED" && !hasWordingChanges) {
      return res.status(400).json({
        error: "At least one wording change is required before saving edits.",
      });
    }

    if (
      (normalizedAction === "REJECTED" || normalizedAction === "REQUEST_CHANGES") &&
      typeof feedback !== "string"
    ) {
      return res.status(400).json({
        error:
          normalizedAction === "REJECTED"
            ? "Feedback required for rejection"
            : "Feedback required when requesting changes",
      });
    }

    if (
      (normalizedAction === "REJECTED" || normalizedAction === "REQUEST_CHANGES") &&
      !normalizedFeedback
    ) {
      return res.status(400).json({
        error:
          normalizedAction === "REJECTED"
            ? "Feedback required for rejection"
            : "Feedback required when requesting changes",
      });
    }

    const updateData: Record<string, unknown> = {
      reviewedAt: new Date(),
      reviewedBy: (session.user as any).id,
    };

    if (normalizedAction !== "WORDING_EDITED") {
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
        if (!PRISMA_DB_NULL) {
          throw new Error(
            "Prisma DbNull sentinel is unavailable for clearing public wording overrides.",
          );
        }

        updateData.publicWordingOverrides = PRISMA_DB_NULL;
      }
    }

    switch (normalizedAction) {
      case "APPROVED":
        updateData.status = "APPROVED";
        updateData.adminApproved = true;
        updateData.isPublic = true;
        updateData.publishedAt = new Date();
        break;
      case "REJECTED":
        updateData.status = "REJECTED";
        updateData.adminApproved = false;
        updateData.isPublic = false;
        updateData.publishedAt = null;
        break;
      case "REQUEST_CHANGES":
        updateData.status = "REVISION_NEEDED";
        updateData.revisionCount = experience.revisionCount + 1;
        updateData.adminApproved = false;
        updateData.isPublic = false;
        updateData.publishedAt = null;
        break;
      case "WORDING_EDITED":
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
                action: "WORDING_EDITED",
                feedback: formatWordingEditAuditFeedback(wordingChanges),
              },
            }),
          );
        }

        if (normalizedAction !== "WORDING_EDITED") {
          createdReviewActions.push(
            await tx.reviewAction.create({
              data: {
                experienceId: id,
                adminId: (session.user as any).id,
                action: normalizedAction,
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

    if (normalizedAction === "APPROVED") {
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
          "Error refreshing public destination read model after approval:",
          refreshError,
        );
      }
    }

    // If approved and has required data, trigger stats calculation
    if (
      normalizedAction === "APPROVED" &&
      experience.hostCity &&
      experience.hostCountry &&
      experience.semester
    ) {
      void calculateCityStats(
        experience.hostCity,
        experience.hostCountry,
        experience.semester,
      ).catch((error) => {
        console.error("Error triggering stats calculation:", error);
      });
    }

    const notification =
      normalizedAction === "REQUEST_CHANGES"
        ? await sendRequestChangesEmail({
            studentEmail: experience.users?.email || "",
            studentName: [experience.users?.firstName, experience.users?.lastName]
              .filter(Boolean)
              .join(" ")
              .trim(),
            reviewFeedback: normalizedFeedback,
            hostCity: experience.hostCity,
            hostCountry: experience.hostCountry,
            hostUniversity:
              sanitizeBasicInformationData(experience.basicInfo).hostUniversity ||
              null,
          })
        : null;

    return res.status(200).json({
      success: true,
      experience: updatedExperience,
      reviewAction: reviewActions[reviewActions.length - 1] ?? null,
      reviewActions,
      ...(notification ? { notification } : {}),
      message: getSuccessMessage(normalizedAction, {
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
 * Calculate statistics for a city/country/semester combination
 * This runs asynchronously and doesn't block the response
 */
async function calculateCityStats(
  city: string,
  country: string,
  semester: string,
) {
  try {
    // Get all APPROVED experiences for this city/country/semester
    const experiences = await prisma.erasmusExperience.findMany({
      where: {
        hostCity: city,
        hostCountry: country,
        semester: semester,
        status: "APPROVED",
      },
    });

    // Need minimum 5 submissions for statistics
    if (experiences.length < 5) {
      console.log(
        `Not enough data for ${city}, ${country} (${semester}): ${experiences.length} submissions`,
      );
      return;
    }

    // Extract accommodation costs
    const accommodationCosts: number[] = [];
    experiences.forEach((exp) => {
      const accommodation = exp.accommodation as any;
      if (
        accommodation?.monthlyRent &&
        !isNaN(parseFloat(accommodation.monthlyRent))
      ) {
        accommodationCosts.push(parseFloat(accommodation.monthlyRent));
      }
    });

    // Extract living expenses
    const groceriesCosts: number[] = [];
    const transportationCosts: number[] = [];
    const socialLifeCosts: number[] = [];
    const totalExpenseValues: number[] = [];

    experiences.forEach((exp) => {
      const accommodation = (exp.accommodation as any) || {};
      const fallbackRent =
        typeof accommodation.monthlyRent === "number"
          ? accommodation.monthlyRent
          : parseFloat(accommodation.monthlyRent || "") || null;
      const expenses = sanitizeLivingExpensesStepData(
        exp.livingExpenses as any,
        {
          fallbackRent,
        },
      );

      if (typeof expenses.food === "number") {
        groceriesCosts.push(expenses.food);
      }
      if (typeof expenses.transport === "number") {
        transportationCosts.push(expenses.transport);
      }
      if (typeof expenses.social === "number") {
        socialLifeCosts.push(expenses.social);
      }

      const totalExpense = calculateLivingExpensesTotal(expenses);

      if (totalExpense > 0) {
        totalExpenseValues.push(totalExpense);
      }
    });

    // Calculate statistics with outlier removal
    const rentStats = calculateStats(accommodationCosts);
    const groceriesStats = calculateStats(groceriesCosts);
    const transportStats = calculateStats(transportationCosts);
    const socialStats = calculateStats(socialLifeCosts);
    const totalExpenseStats = calculateStats(totalExpenseValues);

    // Upsert city statistics
    await prisma.cityStatistics.upsert({
      where: {
        city_country_semester: {
          city,
          country,
          semester,
        },
      },
      update: {
        avgMonthlyRentCents: toCents(rentStats.avg),
        medianRentCents: toCents(rentStats.median),
        minRentCents: toCents(rentStats.min),
        maxRentCents: toCents(rentStats.max),
        rentSampleSize: accommodationCosts.length,
        avgGroceriesCents: toCents(groceriesStats.avg),
        avgTransportCents: toCents(transportStats.avg),
        avgEatingOutCents: null,
        avgSocialLifeCents: toCents(socialStats.avg),
        avgTotalExpensesCents: toCents(totalExpenseStats.avg),
        expenseSampleSize: totalExpenseValues.length,
        lastCalculated: new Date(),
      },
      create: {
        city,
        country,
        semester,
        avgMonthlyRentCents: toCents(rentStats.avg),
        medianRentCents: toCents(rentStats.median),
        minRentCents: toCents(rentStats.min),
        maxRentCents: toCents(rentStats.max),
        rentSampleSize: accommodationCosts.length,
        avgGroceriesCents: toCents(groceriesStats.avg),
        avgTransportCents: toCents(transportStats.avg),
        avgEatingOutCents: null,
        avgSocialLifeCents: toCents(socialStats.avg),
        avgTotalExpensesCents: toCents(totalExpenseStats.avg),
        expenseSampleSize: totalExpenseValues.length,
      },
    });

    console.log(
      `✅ Stats calculated for ${city}, ${country} (${semester}): ${experiences.length} submissions`,
    );
  } catch (error) {
    console.error("Error calculating city stats:", error);
    throw error;
  }
}

/**
 * Calculate statistics with outlier removal (remove top/bottom 5%)
 */
function calculateStats(values: number[]): {
  avg: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
} {
  if (values.length === 0) {
    return { avg: null, median: null, min: null, max: null };
  }

  if (values.length < 10) {
    // For small datasets, don't remove outliers
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 !== 0
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;

    return {
      avg: Math.round(avg * 100) / 100,
      median: Math.round(median * 100) / 100,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  // Sort values
  const sorted = [...values].sort((a, b) => a - b);

  // Remove top and bottom 5%
  const removeCount = Math.floor(sorted.length * 0.05);
  const filtered = sorted.slice(removeCount, sorted.length - removeCount);

  const avg = filtered.reduce((a, b) => a + b, 0) / filtered.length;
  const middle = Math.floor(filtered.length / 2);
  const median =
    filtered.length % 2 !== 0
      ? filtered[middle]
      : (filtered[middle - 1] + filtered[middle]) / 2;

  return {
    avg: Math.round(avg * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: Math.min(...filtered),
    max: Math.max(...filtered),
  };
}

function toCents(value: number | null) {
  return typeof value === "number" ? Math.round(value * 100) : null;
}

/**
 * Get success message based on action
 */
function getSuccessMessage(
  action: CanonicalReviewAction,
  options?: {
    wordingEditsSaved?: boolean;
    notification?: { status: "sent" | "skipped" | "failed"; reason?: string } | null;
  },
): string {
  const wordingSuffix = options?.wordingEditsSaved
    ? " Wording-only public edits were saved with an audit trail."
    : "";

  switch (action) {
    case "APPROVED":
      return `Experience approved successfully. Public aggregates were refreshed.${wordingSuffix}`;
    case "REJECTED":
      return `Experience rejected.${wordingSuffix}`;
    case "REQUEST_CHANGES":
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
    case "WORDING_EDITED":
      return "Public wording edits saved. Student source data remains unchanged.";
    default:
      return "Review completed successfully.";
  }
}
