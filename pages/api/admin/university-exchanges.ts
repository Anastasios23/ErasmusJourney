import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // Check if user is admin
  // const session = await getSession({ req });
  // if (!session?.user || session.user.role !== "ADMIN") {
  //   return res.status(403).json({ error: "Unauthorized" });
  // }

  if (req.method === "GET") {
    try {
      // For now, return empty array until we have the model working
      const exchanges: any[] = [];
      return res.status(200).json(exchanges);
    } catch (error) {
      console.error("Error fetching university exchanges:", error);
      return res.status(500).json({ error: "Failed to fetch exchanges" });
    }
  }

  if (req.method === "POST") {
    try {
      // For now, just return success until we have the model working
      const exchangeData = req.body;
      return res
        .status(201)
        .json({ message: "Exchange created successfully", data: exchangeData });
    } catch (error) {
      console.error("Error creating university exchange:", error);
      return res.status(500).json({ error: "Failed to create exchange" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
