// Quick test script to verify city aggregation API
const { PrismaClient } = require("@prisma/client");

async function testCityAggregation() {
  const prisma = new PrismaClient();

  try {
    // Check if we have any published submissions
    const submissionCount = await prisma.formSubmission.count({
      where: { status: "PUBLISHED" },
    });

    console.log(`Found ${submissionCount} published submissions in database`);

    if (submissionCount > 0) {
      // Test a few sample queries
      const allSubmissions = await prisma.formSubmission.findMany({
        where: { status: "PUBLISHED" },
        select: {
          city: true,
          country: true,
          type: true,
        },
        take: 10,
      });

      console.log("Sample submissions:");
      allSubmissions.forEach((sub) => {
        console.log(`- ${sub.city}, ${sub.country} (${sub.type})`);
      });

      // Get unique cities
      const uniqueCities = await prisma.formSubmission.groupBy({
        by: ["city", "country"],
        where: { status: "PUBLISHED" },
        _count: true,
      });

      console.log(`\nFound ${uniqueCities.length} unique cities:`);
      uniqueCities.slice(0, 5).forEach((city) => {
        console.log(
          `- ${city.city}, ${city.country} (${city._count} submissions)`,
        );
      });
    } else {
      console.log(
        "No published submissions found. The aggregation system will return empty data.",
      );
    }
  } catch (error) {
    console.error("Error testing city aggregation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCityAggregation();
