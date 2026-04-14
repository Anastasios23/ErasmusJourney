import { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/erasmus-experiences",
    details:
      "This legacy user-submissions route was disabled because user draft and submission history now belongs to the canonical ErasmusExperience workflow.",
  });
}
