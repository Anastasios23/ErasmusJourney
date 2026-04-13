import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/public/destinations",
    details:
      "This legacy destinations list route was disabled because it served a stale generated-destination model and could fall back to fabricated destination data. Use the canonical public destination read model instead.",
  });
}
