import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { getClientSafeErrorMessage } from "../../../../../lib/databaseErrors";
import { prisma } from "../../../../../lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]";
import {
  REVIEW_ACTION,
  EXPERIENCE_STATUS,
} from "../../../../../src/lib/canonicalWorkflow";
import { sanitizeAccommodationStepData } from "../../../../../src/lib/accommodation";
import { sanitizeCourseMappingsData } from "../../../../../src/lib/courseMatching";
import {
  getExperiencePublicWordingEdits,
  hasPublicWordingEdits,
  type ExperiencePublicWordingEdits,
} from "../../../../../src/lib/experienceModeration";
import { refreshPublicDestinationReadModel } from "../../../../../src/server/publicDestinations";
import { buildPublicDestinationSlug } from "../../../../../src/lib/publicRoutes";
import { revalidatePublicDestinationPages } from "../../../../../src/server/publicDestinationRevalidation";

const PRISMA_DB_NULL = (require("@prisma/client") as any).Prisma.DbNull;

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildCourseNoteLabel(
  homeCourseName: string,
  hostCourseName: string,
): string {
  const home = homeCourseName || "Unknown home course";
  const host = hostCourseName || "Unknown host course";
  return `${home} -> ${host}`;
}

function summarizeOverrideChanges(changedFields: string[]): string {
  if (changedFields.length === 0) {
    return "Updated approved public wording overrides.";
  }

  return `Updated approved public wording overrides: ${changedFields.join(", ")}.`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Experience ID required" });
    }

    const experience = await prisma.erasmusExperience.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        hostCity: true,
        hostCountry: true,
        experience: true,
        accommodation: true,
        courses: true,
        publicWordingOverrides: true,
      },
    });

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    if (experience.status !== EXPERIENCE_STATUS.APPROVED) {
      return res.status(409).json({
        error:
          "Only approved submissions can be edited through wording overrides.",
        status: experience.status,
      });
    }

    const payload =
      req.body && typeof req.body === "object"
        ? (req.body as Record<string, unknown>)
        : {};
    const overrides = toRecord(payload.overrides) || {};

    const experienceData = toRecord(experience.experience) || {};
    const originalExperienceSummary = asTrimmedString(
      experienceData.bestExperience,
    );

    const accommodation = sanitizeAccommodationStepData(
      toRecord(experience.accommodation),
    );
    const originalAccommodationComment = asTrimmedString(
      accommodation.accommodationReview,
    );

    const courseMappings = sanitizeCourseMappingsData(experience.courses);
    const originalCourseNotes = Object.fromEntries(
      courseMappings
        .map((mapping) => [mapping.id, asTrimmedString(mapping.notes)])
        .filter(([mappingId]) => Boolean(mappingId)),
    ) as Record<string, string>;

    const nextExperienceSummary = asTrimmedString(overrides.experienceSummary);
    const nextAccommodationComment = asTrimmedString(
      overrides.accommodationComment,
    );
    const nextCourseNotesInput = toRecord(overrides.courseNotes) || {};

    const storedOverrides: ExperiencePublicWordingEdits = {
      ...getExperiencePublicWordingEdits(experience.publicWordingOverrides),
    };

    const changedFields: string[] = [];

    const nextExperienceSummaryOverride =
      nextExperienceSummary === originalExperienceSummary
        ? undefined
        : nextExperienceSummary || null;

    if (nextExperienceSummaryOverride === undefined) {
      delete storedOverrides.bestExperience;
    } else {
      storedOverrides.bestExperience = nextExperienceSummaryOverride;
      changedFields.push("experience summary");
    }

    const nextAccommodationCommentOverride =
      nextAccommodationComment === originalAccommodationComment
        ? undefined
        : nextAccommodationComment || null;

    if (nextAccommodationCommentOverride === undefined) {
      delete storedOverrides.accommodationReview;
    } else {
      storedOverrides.accommodationReview = nextAccommodationCommentOverride;
      changedFields.push("accommodation comment");
    }

    const nextCourseNoteOverrides = Object.fromEntries(
      Object.entries(nextCourseNotesInput)
        .filter(([courseId]) => Object.hasOwn(originalCourseNotes, courseId))
        .map(([courseId, value]) => {
          const normalizedValue = asTrimmedString(value);
          const originalValue = originalCourseNotes[courseId] || "";

          if (normalizedValue === originalValue) {
            return [courseId, undefined] as const;
          }

          return [courseId, normalizedValue || null] as const;
        })
        .filter(
          (entry): entry is [string, string | null] => entry[1] !== undefined,
        ),
    );

    if (Object.keys(nextCourseNoteOverrides).length > 0) {
      storedOverrides.courseNotes = nextCourseNoteOverrides;
      changedFields.push("course notes");
    } else {
      delete storedOverrides.courseNotes;
    }

    const persistedOverrides = hasPublicWordingEdits(storedOverrides)
      ? storedOverrides
      : PRISMA_DB_NULL;

    const auditFeedback = summarizeOverrideChanges(changedFields);

    const { updatedExperience, reviewAction } = await prisma.$transaction(
      async (tx) => {
        const updatedRecord = await tx.erasmusExperience.update({
          where: { id },
          data: {
            publicWordingOverrides: persistedOverrides,
            reviewedAt: new Date(),
            reviewedBy: (session.user as any).id,
          },
        });

        const action = await tx.reviewAction.create({
          data: {
            experienceId: id,
            adminId: (session.user as any).id,
            action: REVIEW_ACTION.WORDING_EDITED,
            feedback: auditFeedback,
          },
        });

        return {
          updatedExperience: updatedRecord,
          reviewAction: action,
        };
      },
    );

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
        "Error refreshing public destination read model after wording override update:",
        refreshError,
      );
    }

    const courseNoteLabels = Object.keys(nextCourseNotesInput)
      .map((courseId) =>
        courseMappings.find((mapping) => mapping.id === courseId),
      )
      .filter((mapping): mapping is (typeof courseMappings)[number] =>
        Boolean(mapping),
      )
      .map((mapping) =>
        buildCourseNoteLabel(mapping.homeCourseName, mapping.hostCourseName),
      );

    return res.status(200).json({
      success: true,
      experience: updatedExperience,
      reviewAction,
      overrides: {
        experienceSummary: nextExperienceSummary,
        accommodationComment: nextAccommodationComment,
        courseNotes: Object.fromEntries(
          Object.entries(nextCourseNotesInput)
            .map(([courseId, value]) => [courseId, asTrimmedString(value)])
            .filter(([courseId]) => Boolean(courseId)),
        ),
      },
      original: {
        experienceSummary: originalExperienceSummary,
        accommodationComment: originalAccommodationComment,
        courseNotes: Object.fromEntries(
          courseMappings.map((mapping) => [
            mapping.id,
            {
              label: buildCourseNoteLabel(
                mapping.homeCourseName,
                mapping.hostCourseName,
              ),
              value: originalCourseNotes[mapping.id] || "",
            },
          ]),
        ),
      },
      changedFields,
      courseNoteLabels,
      message: "Approved submission wording overrides saved.",
    });
  } catch (error) {
    console.error("Error saving approved wording overrides:", error);
    return res.status(500).json({
      error: "Failed to save wording overrides",
      details: getClientSafeErrorMessage(
        error,
        "Unable to save wording overrides right now.",
      ),
    });
  }
}
