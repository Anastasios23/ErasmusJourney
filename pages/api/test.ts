import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Server is working correctly",
  });
}
