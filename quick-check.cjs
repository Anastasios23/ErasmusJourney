const { PrismaClient } = require("@prisma/client");

async function checkDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Checking database...\n");

    // Check all form submissions
    const allSubmissions = await prisma.formSubmission.findMany({
      include: { user: true },
    });

    console.log(`Total form submissions: ${allSubmissions.length}\n`);

    // Group by type
    const submissionsByType = {};
    allSubmissions.forEach((sub) => {
      if (!submissionsByType[sub.type]) {
        submissionsByType[sub.type] = [];
      }
      submissionsByType[sub.type].push(sub);
    });

    console.log("Submissions by type:");
    Object.entries(submissionsByType).forEach(([type, subs]) => {
      console.log(`  ${type}: ${subs.length}`);
      if (subs.length > 0 && subs[0].data) {
        console.log(`    Sample data keys:`, Object.keys(subs[0].data));
      }
    });

    // Check basic info submissions specifically
    const basicInfoSubs = await prisma.formSubmission.findMany({
      where: { type: "BASIC_INFO" },
    });

    console.log(`\nBASIC_INFO submissions: ${basicInfoSubs.length}`);
    if (basicInfoSubs.length > 0) {
      console.log("Sample basic info data:", basicInfoSubs[0].data);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
