// Simple test to call our API endpoint directly
const { prisma } = require("./lib/prisma");

async function testAPI() {
  try {
    console.log("🔍 Testing destination system...\n");

    // Check current state
    console.log("1. Current database state:");
    const userCount = await prisma.user.count();
    const submissionCount = await prisma.formSubmission.count();
    console.log(`   Users: ${userCount}`);
    console.log(`   Form Submissions: ${submissionCount}\n`);

    // Import and run the fake data generation
    console.log("2. Testing destinations API...");

    // Import the destinations handler
    const destinationsHandler =
      require("./pages/api/destinations/index.ts").default;

    // Mock request and response objects
    const mockReq = { method: "GET" };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`   Status: ${code}`);
          console.log(`   Response:`, JSON.stringify(data, null, 2));
          return { status: () => ({ json: () => {} }) };
        },
      }),
      json: (data) => {
        console.log("   Response:", JSON.stringify(data, null, 2));
      },
    };

    await destinationsHandler(mockReq, mockRes);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
