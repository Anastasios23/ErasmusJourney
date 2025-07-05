import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUser() {
  console.log("🔍 Checking for user: ana@gmail.com");

  try {
    const user = await prisma.user.findUnique({
      where: { email: "ana@gmail.com" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (user) {
      console.log("✅ User found!");
      console.log("📋 User Details:");
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
    } else {
      console.log("❌ User not found");
      console.log("ℹ️  Testing registration endpoint...");

      // Test if the registration endpoint is accessible
      try {
        const response = await fetch(
          "http://localhost:3000/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: "ana@gmail.com",
              password: "123456",
              firstName: "Anastasios",
              lastName: "Andreou",
            }),
          },
        );

        const data = await response.json();

        if (response.ok) {
          console.log("✅ Registration successful!");
          console.log("📋 Response:", data);
        } else {
          console.log("❌ Registration failed!");
          console.log("📋 Error:", data);
          console.log("📋 Status:", response.status);
        }
      } catch (error) {
        console.log("❌ Cannot reach registration endpoint:", error);
      }
    }

    // Show all users for reference
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    console.log("📋 Recent users:");
    allUsers.slice(0, 5).forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.createdAt.toLocaleDateString()}`,
      );
    });
  } catch (error) {
    console.error("❌ Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
