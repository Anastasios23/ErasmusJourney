import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log("🔐 Creating admin user...");

  const adminEmail = "admin@erasmusjourney.com";
  const adminPassword = "Admin123!";

  try {
    // First, try to delete any existing user with this email
    try {
      await prisma.user.delete({
        where: { email: adminEmail },
      });
      console.log("🗑️ Removed existing admin user");
    } catch (error) {
      // User doesn't exist, which is fine
      console.log("ℹ️ No existing admin user to remove");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        homeCountry: "Greece",
        homeCity: "Athens",
        nationality: "Greek",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("\n🔑 ADMIN CREDENTIALS");
    console.log("====================");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Password: ${adminPassword}`);
    console.log(`👤 User ID: ${adminUser.id}`);
    console.log(`🎯 Role: ${adminUser.role}`);

    console.log("\n🌐 Admin Access URLs:");
    console.log("• http://localhost:3000/admin");
    console.log("• http://localhost:3000/admin-dashboard");
    console.log("• http://localhost:3000/admin-destinations");

    return adminUser;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
