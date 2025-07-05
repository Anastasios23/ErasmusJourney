import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testAuth() {
  console.log("🔍 Testing authentication setup...");

  try {
    // Find users in database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
      take: 5,
    });

    console.log(`📊 Found ${users.length} users in database:`);
    users.forEach((user) => {
      console.log(
        `  👤 ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`,
      );
    });

    // Test admin user specifically
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.email}`);
    } else {
      console.log("❌ No admin user found");
    }
  } catch (error) {
    console.error("❌ Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
