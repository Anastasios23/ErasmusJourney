<<<<<<< HEAD
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import crypto from "crypto";
=======
// pages/api/auth/verify-email.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // Correctly import the shared prisma instance
>>>>>>> origin/main

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
<<<<<<< HEAD
  if (req.method === "POST") {
    // Send verification email
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Save token to database (you might want to add this field to your schema)
      // For now, we'll simulate the process
      console.log(`Verification email would be sent to ${email}`);
      console.log(`Verification token: ${verificationToken}`);
      console.log(
        `Verification URL: ${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`,
      );

      return res.status(200).json({
        message: "Verification email sent successfully",
        // In development, return the token for testing
        ...(process.env.NODE_ENV === "development" && {
          token: verificationToken,
        }),
      });
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    // Verify email with token
    try {
      const { token } = req.query;

      if (!token) {
        return res
          .status(400)
          .json({ message: "Verification token is required" });
      }

      // In a real implementation, you'd verify the token against the database
      // For now, we'll simulate successful verification
      console.log(`Verifying token: ${token}`);

      return res.status(200).json({
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
=======
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
>>>>>>> origin/main
  }
}
