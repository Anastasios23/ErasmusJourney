import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/public/destinations/[slug]",
    details:
      "This legacy destination costs route was disabled because public cost data now belongs to the canonical destination detail output.",
  });
}
