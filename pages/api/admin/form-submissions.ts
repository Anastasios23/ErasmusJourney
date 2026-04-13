import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/admin/erasmus-experiences",
    details:
      "This legacy admin form submissions route was disabled because submission moderation now belongs to the canonical ErasmusExperience workflow.",
  });
}
