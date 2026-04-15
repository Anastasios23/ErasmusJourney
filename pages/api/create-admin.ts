import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    error: "Gone",
    message:
      "Admin provisioning via this route is disabled. " +
      "Use the database seed script or the admin panel.",
  });
}
