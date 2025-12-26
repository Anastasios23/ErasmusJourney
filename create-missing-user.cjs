const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createUser() {
  try {
    const userId = "a0a40749-b5d1-48f3-891e-0c3533b0a5ea";

    const existing = await prisma.users.findUnique({ where: { id: userId } });
    if (existing) {
      console.log("User already exists:", existing.email);
      return;
    }

    const user = await prisma.users.create({
      data: {
        id: userId,
        email: "user@ucy.ac.cy",
        firstName: "User",
        lastName: "",
        updatedAt: new Date(),
        role: "USER",
      },
    });
    console.log("Created user:", user.id);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
