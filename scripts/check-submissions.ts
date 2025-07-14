import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSubmissions() {
  console.log("📊 Checking form submissions in database...");

  try {
    const submissions = await prisma.formSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    console.log(`\n📝 Found ${submissions.length} form submissions:`);

    submissions.forEach((sub, index) => {
      const data = sub.data as any;
      console.log(`\n${index + 1}. ${sub.type} - ${sub.title}`);
      console.log(`   University: ${data.hostUniversity || "Not specified"}`);
      console.log(`   City: ${data.hostCity || "Not specified"}`);
      console.log(`   Country: ${data.hostCountry || "Not specified"}`);
      console.log(`   Student: ${data.firstName || ""} ${data.lastName || ""}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Created: ${sub.createdAt}`);
    });

    // Group by university
    const byUniversity = submissions.reduce(
      (acc, sub) => {
        const university = (sub.data as any).hostUniversity || "Unknown";
        if (!acc[university]) acc[university] = [];
        acc[university].push(sub);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    console.log(`\n🏫 Submissions by University:`);
    Object.entries(byUniversity).forEach(([university, subs]) => {
      console.log(`   ${university}: ${subs.length} submissions`);
    });
  } catch (error) {
    console.error("❌ Error checking submissions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubmissions();
