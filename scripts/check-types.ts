import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkTypes() {
  console.log("🔍 Checking form submission types in database...");

  try {
    const submissions = await prisma.formSubmission.findMany({
      select: { id: true, type: true, title: true },
      orderBy: { createdAt: "desc" },
    });

    console.log(`\n📝 Found ${submissions.length} total submissions:`);

    const typeGroups = submissions.reduce(
      (acc, sub) => {
        if (!acc[sub.type]) acc[sub.type] = [];
        acc[sub.type].push(sub);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    console.log(`\n🏷️ Types found in database:`);
    Object.entries(typeGroups).forEach(([type, subs]) => {
      console.log(`   "${type}": ${subs.length} submission(s)`);
    });

    console.log(`\n📊 Sample submissions:`);
    submissions.slice(0, 5).forEach((sub, index) => {
      console.log(`   ${index + 1}. Type: "${sub.type}" - ${sub.title}`);
    });
  } catch (error) {
    console.error("❌ Error checking types:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTypes();
