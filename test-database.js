// Simple database test script
const { PrismaClient } = require("@prisma/client");

async function testDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log("Testing database connection...");

    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test basic query
    const count = await prisma.formSubmission.count();
    console.log(`✅ Found ${count} total form submissions`);

    // Test published submissions
    const publishedCount = await prisma.formSubmission.count({
      where: { status: "PUBLISHED" },
    });
    console.log(`✅ Found ${publishedCount} published submissions`);

    // Test basic info submissions
    const basicInfoCount = await prisma.formSubmission.count({
      where: {
        status: "PUBLISHED",
        type: "BASIC_INFO",
      },
    });
    console.log(`✅ Found ${basicInfoCount} published basic info submissions`);

    // Test a simple aggregation
    if (basicInfoCount > 0) {
      const sample = await prisma.formSubmission.findFirst({
        where: {
          status: "PUBLISHED",
          type: "BASIC_INFO",
        },
        select: {
          id: true,
          data: true,
          userId: true,
        },
      });

      if (sample) {
        console.log("✅ Sample submission data structure:", {
          id: sample.id,
          hasData: !!sample.data,
          dataKeys: sample.data ? Object.keys(sample.data) : [],
          userId: sample.userId,
        });

        const sampleData = sample.data;
        console.log("Sample city/country fields:", {
          hostCity: sampleData.hostCity,
          destinationCity: sampleData.destinationCity,
          hostCountry: sampleData.hostCountry,
          destinationCountry: sampleData.destinationCountry,
        });
      }
    }
  } catch (error) {
    console.error("❌ Database test failed:", error);

    if (error.code === "P1001") {
      console.error("Database connection failed - check your DATABASE_URL");
    } else if (error.code?.startsWith("P")) {
      console.error("Prisma error:", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
