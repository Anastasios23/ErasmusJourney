import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyCourseData() {
  console.log("🔍 Verifying course matching data...");

  try {
    const courseSubmissions = await prisma.formSubmission.findMany({
      where: { type: "COURSE_MATCHING" },
      orderBy: { createdAt: "desc" },
    });

    console.log(
      `\n📚 Found ${courseSubmissions.length} course matching submissions:`,
    );

    courseSubmissions.forEach((sub, index) => {
      const data = sub.data as any;
      console.log(
        `\n${index + 1}. ${data.hostUniversity} - ${data.departmentInCyprus}`,
      );
      console.log(`   Student: ${data.firstName} ${data.lastName}`);
      console.log(`   Period: ${data.exchangePeriod}`);
      console.log(`   Host Courses: ${data.hostCourses?.length || 0}`);
      console.log(
        `   Recognized Courses: ${data.recognizedCourses?.length || 0}`,
      );

      if (data.hostCourses && data.hostCourses.length > 0) {
        console.log(
          `   Sample Course: ${data.hostCourses[0].code} - ${data.hostCourses[0].name}`,
        );
      }
    });

    // Group by university
    const byUniversity = courseSubmissions.reduce(
      (acc, sub) => {
        const university = (sub.data as any).hostUniversity || "Unknown";
        if (!acc[university]) acc[university] = [];
        acc[university].push(sub);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    console.log(`\n🏫 Course Matching by University:`);
    Object.entries(byUniversity).forEach(([university, subs]) => {
      console.log(`   ${university}: ${subs.length} submission(s)`);
    });

    console.log(`\n✅ Course matching data is ready for testing!`);
  } catch (error) {
    console.error("❌ Error verifying data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCourseData();
