import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/erasmus-experiences",
    details:
      "This drafts route was disabled because it targeted the stale submission workflow. Draft state now lives only in the canonical ErasmusExperience API.",
  });
}
