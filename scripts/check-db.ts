import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log("🔍 Checking database status...");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    console.log("👤 Users in database:");
    users.forEach((user) => {
      console.log(
        `  - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`,
      );
    });

    const universities = await prisma.university.count();
    const agreements = await prisma.agreement.count();

    console.log(`🏫 Universities: ${universities}`);
    console.log(`🤝 Agreements: ${agreements}`);
  } catch (error) {
    console.error("❌ Database check failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
