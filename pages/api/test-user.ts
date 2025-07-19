import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const email = "ana@gmail.com";
    const password = "123456";

    console.log("Checking for user:", email);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User found:", existingUser.email);

      // Test password
      const isValidPassword = await bcrypt.compare(
        password,
        existingUser.password,
      );

      return res.status(200).json({
        message: "User exists",
        email: existingUser.email,
        passwordValid: isValidPassword,
        id: existingUser.id,
      });
    } else {
      console.log("User not found, creating...");

      // Create user
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: "Ana",
          lastName: "Test",
        },
      });

      console.log("User created:", user.email);

      return res.status(201).json({
        message: "User created",
        email: user.email,
        id: user.id,
      });
    }
  } catch (error) {
    console.error("Test user error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
