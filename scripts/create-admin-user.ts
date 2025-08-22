import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log("Creating admin user...");

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
      console.log("Admin user already exists!");

      // Update role to admin if not already
      if (existingUser.role !== "ADMIN") {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: "ADMIN" },
        });
        console.log("✅ Updated existing user to ADMIN role");
      } else {
        console.log("✅ User already has ADMIN role");
      }

      console.log("Admin credentials:");
      console.log("Email:", adminEmail);
      console.log("Password:", adminPassword);
      return;
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
        emailVerified: new Date(), // Mark email as verified
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("");
    console.log("🔑 Admin Login Credentials:");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log("");
    console.log("You can now:");
    console.log("1. Go to http://localhost:3000/login");
    console.log("2. Use the credentials above to log in");
    console.log("3. Access admin pages at:");
    console.log("   - /admin/destinations");
    console.log("   - /admin/university-exchanges");
    console.log("   - /admin/student-accommodations");
    console.log("");
    console.log("User ID:", adminUser.id);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
