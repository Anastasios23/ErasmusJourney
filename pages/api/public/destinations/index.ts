import { NextApiRequest, NextApiResponse } from "next";
import { getPublicDestinationList } from "../../../../src/server/publicDestinations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const destinations = await getPublicDestinationList();
    return res.status(200).json({ destinations });
  } catch (error) {
    console.error("Failed to load public destination list", error);
    return res.status(500).json({ message: "Failed to load destinations" });
  }
}
