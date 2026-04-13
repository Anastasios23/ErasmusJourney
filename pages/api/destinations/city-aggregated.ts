import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/public/destinations",
    details:
      "This legacy city aggregation route was disabled because public city aggregation now belongs to the canonical approved-destination read model.",
  });
}
