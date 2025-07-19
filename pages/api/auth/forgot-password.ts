import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { email, token, newPassword } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    try {
      // If only email is provided, send reset link
      if (!token && !newPassword) {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Don't reveal if user exists or not for security
          return res.status(200).json({
            message:
              "If an account with that email exists, a password reset link has been sent.",
          });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // In a real implementation, save the token to database
        // For now, log it for development
        console.log(`Password reset requested for: ${email}`);
        console.log(`Reset token: ${resetToken}`);
        console.log(
          `Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`,
        );

        return res.status(200).json({
          message:
            "If an account with that email exists, a password reset link has been sent.",
          // In development, return the token for testing
          ...(process.env.NODE_ENV === "development" && { token: resetToken }),
        });
      }

      // If token and newPassword are provided, reset password
      if (token && newPassword) {
        // Validate new password
        if (newPassword.length < 6) {
          return res.status(400).json({
            message: "Password must be at least 6 characters long",
          });
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return res.status(400).json({ message: "Invalid reset token" });
        }

        // In a real implementation, verify the token and expiry
        // For now, simulate successful reset
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            // Clear reset token fields if they exist
          },
        });

        return res.status(200).json({
          message: "Password reset successfully",
        });
      }

      return res.status(400).json({ message: "Invalid request" });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
