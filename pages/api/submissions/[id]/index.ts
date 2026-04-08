import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/erasmus-experiences",
    details:
      "This per-submission route was disabled because it targeted the stale student_submissions workflow. Use the canonical ErasmusExperience API instead.",
  });
}
