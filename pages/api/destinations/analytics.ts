import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/public/destinations",
    details:
      "This legacy destination analytics route was disabled because it was not part of the canonical public destination read model and no live frontend callers remain.",
  });
}
