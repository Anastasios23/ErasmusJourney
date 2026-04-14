import type { NextApiRequest, NextApiResponse } from "next";

import { respondWithCanonicalRouteDisabled } from "../../../src/lib/canonicalRoute";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  return respondWithCanonicalRouteDisabled(res, {
    canonicalPath: "/api/public/destinations/[slug]",
    details:
      "This accommodation recommendation route was disabled because recommendations are out of MVP scope and canonical destination data is the supported public source.",
  });
}
