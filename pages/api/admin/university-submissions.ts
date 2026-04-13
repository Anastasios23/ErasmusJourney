import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/admin/erasmus-experiences",
    details:
      "This legacy admin university submissions route was disabled because peer-course moderation now belongs to the canonical ErasmusExperience workflow.",
  });
}
