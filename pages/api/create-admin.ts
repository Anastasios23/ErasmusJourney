import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Admin user details
    const adminEmail = "admin@erasmusjourney.com";
    const adminPassword = "Admin123!";
    const adminFirstName = "Admin";
    const adminLastName = "User";

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      // Update role to admin if not already
      if (existingUser.role !== "ADMIN") {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: "ADMIN" },
        });

        return res.status(200).json({
          message: "Updated existing user to ADMIN role",
          credentials: {
            email: adminEmail,
            password: adminPassword,
          },
          user: {
            id: existingUser.id,
            email: existingUser.email,
            role: "ADMIN",
          },
        });
      } else {
        return res.status(200).json({
          message: "Admin user already exists",
          credentials: {
            email: adminEmail,
            password: adminPassword,
          },
          user: {
            id: existingUser.id,
            email: existingUser.email,
            role: existingUser.role,
          },
        });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: adminFirstName,
        lastName: adminLastName,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });

    return res.status(201).json({
      message: "Admin user created successfully",
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
      instructions: [
        "Go to http://localhost:3000/login",
        "Use the credentials provided to log in",
        "Access admin pages at /admin/destinations, /admin/university-exchanges, /admin/student-accommodations",
      ],
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return res.status(500).json({
      error: "Failed to create admin user",
      details: error.message,
    });
  }
}
