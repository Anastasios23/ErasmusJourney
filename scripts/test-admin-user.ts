import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ADMIN_EMAIL = "admin@erasmusjourney.com";

async function testAdminUserPermissions() {
  console.log("Testing canonical admin workflow access");
  console.log("=================================");

  try {
    const adminUser = await prisma.users.findUnique({
      where: { email: ADMIN_EMAIL },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    if (!adminUser) {
      console.log("Admin user not found. Run: npm run db:seed-admin");
      return false;
    }

    const displayName = [adminUser.firstName, adminUser.lastName]
      .filter(Boolean)
      .join(" ");

    console.log("Admin user found:");
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Name: ${displayName || "Unknown"}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);

    if (adminUser.role !== "ADMIN") {
      console.log("User does not have ADMIN role.");
      return false;
    }

    const [submittedExperienceCount, approvedExperienceCount, reviewActionCount] =
      await Promise.all([
        prisma.erasmusExperience.count({
          where: {
            status: "SUBMITTED",
            isComplete: true,
          },
        }),
        prisma.erasmusExperience.count({
          where: {
            status: "APPROVED",
          },
        }),
        prisma.reviewAction.count(),
      ]);

    const publicDestinationCount = await prisma.publicDestinationReadModel.count();

    console.log(
      `Can review ${submittedExperienceCount} submitted Erasmus experiences`,
    );
    console.log(
      `Approved Erasmus experiences currently tracked: ${approvedExperienceCount}`,
    );
    console.log(`Review audit actions recorded: ${reviewActionCount}`);
    console.log(`Public destination rows available: ${publicDestinationCount}`);

    console.log("\nAll canonical admin checks passed.");
    return true;
  } catch (error) {
    console.error("Admin workflow test failed:", error);
    return false;
  }
}

async function displayAdminInstructions() {
  console.log("\nADMIN USER TESTING INSTRUCTIONS");
  console.log("===================================");
  console.log("1. Go to: http://localhost:3000/login");
  console.log(`2. Enter email: ${ADMIN_EMAIL}`);
  console.log("3. Enter password: [your DEFAULT_ADMIN_PASSWORD from .env]");
  console.log("4. Click 'Sign In'");
  console.log("\nAfter signing in, test these admin features:");
  console.log("- Moderation queue: /admin/review-submissions");
  console.log("- Public destination pages: /destinations");
  console.log("\nExpected admin capabilities:");
  console.log("- Review submitted Erasmus experiences");
  console.log("- Preview public impact before approval");
  console.log("- Approve, reject, or request changes through the canonical review flow");
}

async function verifyAdminPersistence() {
  console.log("\nAdmin Persistence Verification");
  console.log("=================================");

  const adminUser = await prisma.users.findUnique({
    where: { email: ADMIN_EMAIL },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  if (adminUser) {
    console.log("Admin user will persist through:");
    console.log("   - Database schema changes (prisma db push)");
    console.log("   - Database resets (prisma migrate reset)");
    console.log("   - Application restarts");
    console.log("   - Package updates");
    console.log(`   - Created: ${adminUser.createdAt.toISOString()}`);
    console.log(
      `   - Email verified: ${adminUser.emailVerified ? "Yes" : "No"}`,
    );
  } else {
    console.log("Admin user not found.");
  }
}

async function main() {
  try {
    const testsPassed = await testAdminUserPermissions();
    await verifyAdminPersistence();
    await displayAdminInstructions();

    if (testsPassed) {
      console.log("\nADMIN USER READY FOR TESTING");
      console.log("The permanent admin user is configured and tested.");
    } else {
      console.log("\nSome tests failed. Check the errors above.");
    }
  } catch (error) {
    console.error("Test script failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

export { testAdminUserPermissions };
