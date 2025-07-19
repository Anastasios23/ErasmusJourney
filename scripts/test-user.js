const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing database connection...");

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "ana@gmail.com" },
    });

    if (existingUser) {
      console.log("User found:", {
        id: existingUser.id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
      });

      // Test password
      const isValidPassword = await bcrypt.compare(
        "123456",
        existingUser.password,
      );
      console.log("Password valid:", isValidPassword);
    } else {
      console.log("User not found, creating...");

      // Create user
      const hashedPassword = await bcrypt.hash("123456", 12);
      const user = await prisma.user.create({
        data: {
          email: "ana@gmail.com",
          password: hashedPassword,
          firstName: "Ana",
          lastName: "Test",
        },
      });

      console.log("User created:", {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }

    console.log("Database test completed successfully");
  } catch (error) {
    console.error("Database test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
