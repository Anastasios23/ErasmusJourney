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
    // Check database connection
    console.log("Testing database connection...");
    await prisma.$connect();
    console.log("Database connected successfully");

    // Check if any users exist
    const userCount = await prisma.user.count();
    console.log("Total users in database:", userCount);

    const testUsers = [
      {
        email: "ana@gmail.com",
        password: "123456",
        firstName: "Ana",
        lastName: "Test",
      },
      {
        email: "admin@test.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
      },
    ];

    const results = [];

    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (!existingUser) {
        console.log("Creating user:", userData.email);
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        const user = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role === "ADMIN" ? "ADMIN" : "USER",
          },
        });

        results.push({
          created: true,
          email: user.email,
          id: user.id,
        });
      } else {
        console.log("User already exists:", userData.email);
        results.push({
          created: false,
          email: existingUser.email,
          id: existingUser.id,
        });
      }
    }

    return res.status(200).json({
      message: "Database initialization completed",
      userCount: await prisma.user.count(),
      results,
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return res.status(500).json({
      message: "Database initialization failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    await prisma.$disconnect();
  }
}
