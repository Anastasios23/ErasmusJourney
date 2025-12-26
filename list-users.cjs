const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.users.findMany();
    console.log("Users in database:", JSON.stringify(users, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
