import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/admin/erasmus-experiences",
    details:
      "This backup admin destinations route was disabled because destination publishing now flows through canonical submission moderation and the approved public destination read model.",
  });
}
