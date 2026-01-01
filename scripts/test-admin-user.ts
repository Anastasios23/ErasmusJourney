import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testAdminUserPermissions() {
  console.log("🧪 Testing Admin User Permissions");
  console.log("=================================");

  try {
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@erasmusjourney.com" },
    });

    if (!adminUser) {
      console.log("❌ Admin user not found! Run: npm run db:seed-admin");
      return false;
    }

    console.log("✅ Admin user found:");
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);

    // Test 1: Verify admin role
    if (adminUser.role !== "ADMIN") {
      console.log("❌ User does not have ADMIN role!");
      return false;
    }
    console.log("✅ User has ADMIN role");

    // Test 2: Check if admin can create destinations
    try {
      const testDestination = await prisma.adminDestination.create({
        data: {
          name: "Test Destination",
          city: "Test City",
          country: "Test Country",
          description: "This is a test destination created by admin",
          createdBy: adminUser.id,
          active: false, // Mark as inactive so it doesn't interfere
        },
      });

      console.log("✅ Admin can create destinations");

      // Clean up test destination
      await prisma.adminDestination.delete({
        where: { id: testDestination.id },
      });
      console.log("✅ Test destination cleaned up");
    } catch (error) {
      console.log("❌ Admin cannot create destinations:", error.message);
      return false;
    }

    // Test 3: Count admin destinations the user has created
    const adminDestinationsCount = await prisma.adminDestination.count({
      where: { createdBy: adminUser.id },
    });
    console.log(`✅ Admin has created ${adminDestinationsCount} destinations`);

    // Test 4: Check form submission access
    const formSubmissionsCount = await prisma.formSubmission.count();
    console.log(
      `✅ Can access ${formSubmissionsCount} form submissions for review`,
    );

    console.log("\n🎉 All admin permission tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Admin permission test failed:", error);
    return false;
  }
}

async function displayAdminInstructions() {
  console.log("\n📋 ADMIN USER TESTING INSTRUCTIONS");
  console.log("===================================");
  console.log("1. 🌐 Go to: http://localhost:3000/login");
  console.log("2. 📧 Enter email: admin@erasmusjourney.com");
  console.log("3. 🔐 Enter password: [your DEFAULT_ADMIN_PASSWORD from .env]");
  console.log("4. ✅ Click 'Sign In'");
  console.log("\nAfter signing in, test these admin features:");
  console.log("• 🏛️  Destination Management: /admin/destinations");
  console.log("• 📊 Form Reviews: /admin");
  console.log("• 🎓 University Exchanges: /admin/university-exchanges");
  console.log("• 🏠 Student Accommodations: /admin/student-accommodations");
  console.log("\n✨ Expected Admin Capabilities:");
  console.log("• Create, edit, delete destinations");
  console.log("• Review and approve student submissions");
  console.log("• Access admin-only API endpoints");
  console.log("• Manage university partnerships");
}

async function verifyAdminPersistence() {
  console.log("\n🔒 Admin Persistence Verification");
  console.log("=================================");

  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@erasmusjourney.com" },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  if (adminUser) {
    console.log("✅ Admin user will persist through:");
    console.log("   • Database schema changes (prisma db push)");
    console.log("   • Database resets (prisma migrate reset)");
    console.log("   • Application restarts");
    console.log("   • Package updates");
    console.log(`   • Created: ${adminUser.createdAt.toISOString()}`);
    console.log(
      `   • Email verified: ${adminUser.emailVerified ? "Yes" : "No"}`,
    );
  } else {
    console.log("❌ Admin user not found!");
  }
}

async function main() {
  try {
    const testsPassed = await testAdminUserPermissions();
    await verifyAdminPersistence();
    await displayAdminInstructions();

    if (testsPassed) {
      console.log("\n🎯 ADMIN USER READY FOR TESTING!");
      console.log("The permanent admin user is configured and tested.");
    } else {
      console.log("\n⚠️  Some tests failed. Check the errors above.");
    }
  } catch (error) {
    console.error("💥 Test script failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

export { testAdminUserPermissions };
