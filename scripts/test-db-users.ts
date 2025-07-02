import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testDatabaseUsers() {
  console.log("🔍 Testing database users and authentication...");

  try {
    // Test 1: Check if users exist in database
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);

    // Test 2: List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("\n👥 Users in database:");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log("");
    });

    // Test 3: Test password verification for demo user
    console.log("🔐 Testing password verification...");
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo" },
    });

    if (demoUser) {
      const isValidDemo = await bcrypt.compare("demo", demoUser.password);
      console.log(`Demo user password valid: ${isValidDemo ? "✅" : "❌"}`);
    } else {
      console.log("❌ Demo user not found");
    }

    // Test 4: Test admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@erasmus.cy" },
    });

    if (adminUser) {
      const isValidAdmin = await bcrypt.compare("admin123", adminUser.password);
      console.log(`Admin user password valid: ${isValidAdmin ? "✅" : "❌"}`);
    } else {
      console.log("❌ Admin user not found");
    }

    console.log("\n✅ Database test completed");
  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseUsers();
