import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import "dotenv/config";

const prisma = new PrismaClient();

const PERMANENT_ADMIN = {
  email: "admin@erasmusjourney.com",
  password: process.env.DEFAULT_ADMIN_PASSWORD || "ChangeMe123!",
  firstName: "Admin",
  lastName: "User",
  role: "ADMIN",
  homeCountry: "Greece",
  homeCity: "Athens",
  nationality: "Greek",
};

async function ensurePermanentAdmin() {
  console.log("Ensuring permanent admin user exists...");

  try {
    let adminUser = await prisma.users.findUnique({
      where: { email: PERMANENT_ADMIN.email },
    });

    if (adminUser) {
      console.log("Admin user already exists.");

      if (adminUser.role !== "ADMIN") {
        console.log("Updating user role to ADMIN...");
        adminUser = await prisma.users.update({
          where: { id: adminUser.id },
          data: { role: "ADMIN" },
        });
        console.log("User role updated.");
      }
    } else {
      console.log("Creating permanent admin user...");

      const hashedPassword = await bcrypt.hash(PERMANENT_ADMIN.password, 12);

      adminUser = await prisma.users.create({
        data: {
          id: randomUUID(),
          email: PERMANENT_ADMIN.email,
          password: hashedPassword,
          firstName: PERMANENT_ADMIN.firstName,
          lastName: PERMANENT_ADMIN.lastName,
          role: PERMANENT_ADMIN.role,
          homeCountry: PERMANENT_ADMIN.homeCountry,
          homeCity: PERMANENT_ADMIN.homeCity,
          nationality: PERMANENT_ADMIN.nationality,
          emailVerified: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log("Permanent admin user created.");
    }

    return adminUser;
  } catch (error) {
    console.error("Error ensuring permanent admin:", error);
    throw error;
  }
}

async function displayAdminCredentials() {
  console.log("\nADMIN LOGIN CREDENTIALS");
  console.log("=======================");
  console.log(`Email: ${PERMANENT_ADMIN.email}`);
  console.log(`Password: ${PERMANENT_ADMIN.password}`);
  console.log("\nAdmin access URLs:");
  console.log("- http://localhost:3000/admin");
  console.log("- http://localhost:3000/admin/review-submissions");
  console.log("- http://localhost:3000/destinations");
  console.log("\nThis admin user will persist across:");
  console.log("- Database resets (prisma migrate reset)");
  console.log("- Schema changes (prisma db push)");
  console.log("- Application rebuilds");
}

async function main() {
  try {
    await ensurePermanentAdmin();
    await displayAdminCredentials();

    console.log("\nPermanent admin setup complete.");
  } catch (error) {
    console.error("Failed to setup permanent admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

export { ensurePermanentAdmin, PERMANENT_ADMIN };
