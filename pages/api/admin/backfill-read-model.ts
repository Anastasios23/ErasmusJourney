import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../auth/[...nextauth]";
import { refreshPublicDestinationReadModel } from "../../../src/server/publicDestinations";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }

  await refreshPublicDestinationReadModel();

  return res.status(200).json({
    success: true,
    message: "Read model backfilled.",
  });
}
