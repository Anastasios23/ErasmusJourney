import { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/erasmus-experiences",
    details:
      "This legacy forms draft route was disabled because canonical draft persistence now belongs to the ErasmusExperience workflow.",
  });
}
