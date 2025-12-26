import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { randomUUID } from "crypto";
import { isCyprusUniversityEmail } from "../../../lib/authUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Domain Check
  if (!isCyprusUniversityEmail(email)) {
    return res.status(403).json({ 
      message: "Registration is restricted to Cyprus university students only (@ucy.ac.cy, @cut.ac.cy, etc.)." 
    });
  }

  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.users.create({
      data: {
        id: randomUUID(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message:
        "User created successfully! Please check your email for verification.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
