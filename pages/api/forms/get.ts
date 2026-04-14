import { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/erasmus-experiences",
    details:
      "This legacy forms read route was disabled because canonical progress and submission state now comes from ErasmusExperience records.",
  });
}
