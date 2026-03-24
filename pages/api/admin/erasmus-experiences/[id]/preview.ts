import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../../../auth/[...nextauth]";
import { prisma } from "../../../../../lib/prisma";
import {
  getAdminPublicImpactPreviewByExperienceId,
  getAdminPublicImpactPreviewUnavailableReasonByExperienceId,
} from "../../../../../src/server/publicDestinations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.users.findUnique({
    where: { id: (session.user as any).id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  const { id } = req.query;
  if (typeof id !== "string" || !id.trim()) {
    return res.status(400).json({ error: "Experience ID required" });
  }

  try {
    const preview = await getAdminPublicImpactPreviewByExperienceId(id);

    if (!preview) {
      const unavailableReason =
        await getAdminPublicImpactPreviewUnavailableReasonByExperienceId(id);

      if (unavailableReason) {
        return res.status(404).json({
          error: unavailableReason.message,
          code: unavailableReason.code,
          missingFields: unavailableReason.missingFields,
        });
      }

      return res
        .status(404)
        .json({ error: "Preview unavailable for this experience" });
    }

    return res.status(200).json(preview);
  } catch (error) {
    console.error("Error building public impact preview:", error);
    return res.status(500).json({
      error: "Failed to build public impact preview",
    });
  }
}
