import { NextApiRequest, NextApiResponse } from "next";
import {
  PUBLIC_DESTINATION_API_S_MAXAGE_SECONDS,
  PUBLIC_DESTINATION_API_STALE_WHILE_REVALIDATE_SECONDS,
} from "../../../../src/lib/publicDestinationCache";
import { getPublicDestinationList } from "../../../../src/server/publicDestinations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader(
    "Cache-Control",
    `public, s-maxage=${PUBLIC_DESTINATION_API_S_MAXAGE_SECONDS}, stale-while-revalidate=${PUBLIC_DESTINATION_API_STALE_WHILE_REVALIDATE_SECONDS}`,
  );

  try {
    const destinations = await getPublicDestinationList();
    return res.status(200).json({ destinations });
  } catch (error) {
    console.error("Failed to load public destination list", error);
    return res.status(500).json({ message: "Failed to load destinations" });
  }
}
