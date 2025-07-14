import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugCourseData() {
  console.log("🔍 DEBUGGING COURSE MATCHING DATA...\n");

  try {
    // 1. Check ALL submissions in database
    console.log("1️⃣ CHECKING ALL FORM SUBMISSIONS:");
    const allSubmissions = await prisma.formSubmission.findMany({
      select: { id: true, type: true, title: true, data: true },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Total submissions: ${allSubmissions.length}`);

    // Group by type
    const typeGroups = allSubmissions.reduce(
      (acc, sub) => {
        if (!acc[sub.type]) acc[sub.type] = [];
        acc[sub.type].push(sub);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    console.log("\n📊 Submissions by TYPE:");
    Object.entries(typeGroups).forEach(([type, subs]) => {
      console.log(`   "${type}": ${subs.length} submission(s)`);
    });

    // 2. Check specifically for course matching (try both formats)
    console.log("\n2️⃣ CHECKING COURSE MATCHING SPECIFICALLY:");

    const courseMatchingUppercase = await prisma.formSubmission.findMany({
      where: { type: "COURSE_MATCHING" },
      select: { id: true, title: true, data: true },
    });
    console.log(
      `"COURSE_MATCHING" (uppercase): ${courseMatchingUppercase.length} submissions`,
    );

    const courseMatchingLowercase = await prisma.formSubmission.findMany({
      where: { type: "course-matching" },
      select: { id: true, title: true, data: true },
    });
    console.log(
      `"course-matching" (lowercase): ${courseMatchingLowercase.length} submissions`,
    );

    // 3. Check data structure of first course matching submission
    const firstCourseSubmission =
      courseMatchingUppercase[0] || courseMatchingLowercase[0];
    if (firstCourseSubmission) {
      console.log("\n3️⃣ SAMPLE COURSE MATCHING SUBMISSION:");
      console.log(`Title: ${firstCourseSubmission.title}`);
      console.log(`Data keys:`, Object.keys(firstCourseSubmission.data as any));

      const data = firstCourseSubmission.data as any;
      console.log(
        `Has hostCourses: ${!!data.hostCourses} (${data.hostCourses?.length || 0} courses)`,
      );
      console.log(
        `Has recognizedCourses: ${!!data.recognizedCourses} (${data.recognizedCourses?.length || 0} courses)`,
      );
      console.log(`Host University: ${data.hostUniversity || "Not specified"}`);
      console.log(`University ID: ${data.universityId || "Not specified"}`);

      if (data.hostCourses && data.hostCourses.length > 0) {
        console.log(
          "\nSample host course:",
          JSON.stringify(data.hostCourses[0], null, 2),
        );
      }
      if (data.recognizedCourses && data.recognizedCourses.length > 0) {
        console.log(
          "\nSample recognized course:",
          JSON.stringify(data.recognizedCourses[0], null, 2),
        );
      }
    } else {
      console.log("\n❌ NO COURSE MATCHING SUBMISSIONS FOUND!");
    }

    // 4. Check universities for ID mapping
    console.log("\n4️⃣ CHECKING UNIVERSITIES:");
    const universities = await prisma.university.findMany({
      select: { id: true, name: true },
      take: 5,
    });
    console.log("Universities in database:");
    universities.forEach((uni) => {
      console.log(`   ${uni.id}: ${uni.name}`);
    });

    // 5. Test API call simulation
    console.log("\n5️⃣ SIMULATING API CALLS:");
    const sampleUniversityId = universities[0]?.id;
    if (sampleUniversityId) {
      console.log(`Testing with university ID: ${sampleUniversityId}`);

      // Simulate the API filtering logic
      const apiResults = allSubmissions.filter((sub) => {
        const data = sub.data as any;
        return data.universityId === sampleUniversityId;
      });
      console.log(
        `Submissions matching universityId "${sampleUniversityId}": ${apiResults.length}`,
      );

      // Also try by university name
      const nameResults = allSubmissions.filter((sub) => {
        const data = sub.data as any;
        return data.hostUniversity?.includes(universities[0].name);
      });
      console.log(
        `Submissions matching university name "${universities[0].name}": ${nameResults.length}`,
      );
    }
  } catch (error) {
    console.error("❌ Error during debugging:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCourseData();
