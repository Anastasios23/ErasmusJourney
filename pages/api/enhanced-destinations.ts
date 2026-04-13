import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/public/destinations",
    details:
      "This legacy enhanced destinations route was disabled because only the canonical approved-destination public read model is supported.",
  });
}
