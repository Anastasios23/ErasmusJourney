import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";
import {
  EXPERIENCE_STATUS,
  normalizeExperienceStatusInput,
} from "../../../src/lib/canonicalWorkflow";
import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";
import {
  getAdminPublicImpactPreviewByExperienceId,
  getAdminPublicImpactPreviewUnavailableReasonByExperienceId,
} from "../../../src/server/publicDestinations";

// READ-ONLY - this route serves the admin submission list only.
// All write operations (approve, reject, request changes,
// unpublish, wording override) belong exclusively to:
//   /api/admin/erasmus-experiences/[id]/review
//   /api/admin/erasmus-experiences/[id]/wording-override

function buildDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Check if user is admin
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "PUT":
      return respondWithCanonicalRouteDisabled(res, {
        canonicalPath: "/api/admin/erasmus-experiences/[id]/review",
        details:
          "This bulk admin mutation route was disabled because it bypassed the canonical ErasmusExperience review workflow. Use the per-submission review endpoint instead.",
      });
    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status } = req.query;

    // Build where clause
    const where: any = {
      isComplete: true,
    };

    // Filter by status if provided
    if (status && typeof status === "string") {
      const normalizedStatus = normalizeExperienceStatusInput(status);

      if (!normalizedStatus) {
        return res.status(400).json({ error: "Invalid canonical status filter" });
      }

      where.status = normalizedStatus;
    }

    // Fetch experiences
    const experiences = await prisma.erasmusExperience.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        hostUniversity: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
        homeUniversity: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    const enrichedExperiences = await Promise.all(
      experiences.map(async ({ users, ...experience }) => {
        let publicImpactPreview = null;
        let publicImpactPreviewUnavailableReason = null;

        if (experience.status === EXPERIENCE_STATUS.SUBMITTED) {
          publicImpactPreview =
            await getAdminPublicImpactPreviewByExperienceId(experience.id);

          if (!publicImpactPreview) {
            publicImpactPreviewUnavailableReason =
              await getAdminPublicImpactPreviewUnavailableReasonByExperienceId(
                experience.id,
              );
          }
        }

        return {
          ...experience,
          user: users
            ? {
                id: users.id,
                email: users.email,
                name: buildDisplayName(users),
              }
            : null,
          publicImpactPreview,
          publicImpactPreviewUnavailableReason,
        };
      }),
    );

    return res.json(enrichedExperiences);
  } catch (error) {
    console.error("Error fetching erasmus experiences:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

