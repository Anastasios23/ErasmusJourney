import type { NextApiResponse } from "next";

interface CanonicalRouteDisabledOptions {
  canonicalPath: string;
  details: string;
}

export function respondWithCanonicalRouteDisabled(
  res: NextApiResponse,
  options: CanonicalRouteDisabledOptions,
) {
  return res.status(410).json({
    error: "Deprecated route",
    details: options.details,
    canonicalPath: options.canonicalPath,
  });
}
