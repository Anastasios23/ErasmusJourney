import { NextApiRequest, NextApiResponse } from "next";
import { getPublicDestinationDetailBySlug } from "../../../../src/server/publicDestinations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const slug = typeof req.query.slug === "string" ? req.query.slug : "";
  if (!slug) {
    return res.status(400).json({ message: "Invalid destination slug" });
  }

  try {
    const destination = await getPublicDestinationDetailBySlug(slug);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    return res.status(200).json({ destination });
  } catch (error) {
    console.error("Failed to load public destination detail", error);
    return res
      .status(500)
      .json({ message: "Failed to load destination detail" });
  }
}
