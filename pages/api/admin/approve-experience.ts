import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/admin/erasmus-experiences/[id]/review",
    details:
      "This legacy admin approval route was disabled because it bypassed the canonical ErasmusExperience moderation workflow and could write stale PUBLISHED/generated-destination state.",
  });
}
