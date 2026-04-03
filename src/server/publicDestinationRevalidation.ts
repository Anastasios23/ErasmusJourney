import type { NextApiResponse } from "next";

import { PUBLIC_DESTINATIONS_ROUTE } from "../lib/publicRoutes";

type RevalidatingResponse = NextApiResponse & {
  revalidate?: (urlPath: string) => Promise<void>;
};

export function getPublicDestinationRevalidationPaths(
  slug?: string | null,
): string[] {
  const paths = ["/", PUBLIC_DESTINATIONS_ROUTE];

  if (!slug) {
    return paths;
  }

  return [
    ...paths,
    `${PUBLIC_DESTINATIONS_ROUTE}/${slug}`,
    `${PUBLIC_DESTINATIONS_ROUTE}/${slug}/accommodation`,
    `${PUBLIC_DESTINATIONS_ROUTE}/${slug}/courses`,
  ];
}

export async function revalidatePublicDestinationPages(
  res: NextApiResponse,
  slug?: string | null,
): Promise<void> {
  const response = res as RevalidatingResponse;

  if (typeof response.revalidate !== "function") {
    return;
  }

  await Promise.allSettled(
    getPublicDestinationRevalidationPaths(slug).map((path) =>
      response.revalidate!(path),
    ),
  );
}
