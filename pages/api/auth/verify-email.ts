// pages/api/auth/verify-email.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // Correctly import the shared prisma instance

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Here you would typically send a verification email
    // For now, we'll just simulate success
    console.log(`Simulating email verification for ${email}`);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
