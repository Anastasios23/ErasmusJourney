const { PrismaClient } = require("@prisma/client");

async function analyzeCourseData() {
  const prisma = new PrismaClient();

  try {
    console.log("📚 Analyzing Course and University Data...\n");

    // Get basic info submissions for university data
    const basicInfoSubmissions = await prisma.formSubmission.findMany({
      where: { type: "BASIC_INFO" },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    // Get course matching submissions
    const courseMatchingSubmissions = await prisma.formSubmission.findMany({
      where: { type: "COURSE_MATCHING" },
    });

    console.log(`📊 Data Overview:`);
    console.log(
      `- Basic Info (University data): ${basicInfoSubmissions.length} submissions`,
    );
    console.log(
      `- Course Matching: ${courseMatchingSubmissions.length} submissions\n`,
    );

    // Sample course matching data
    if (courseMatchingSubmissions.length > 0) {
      console.log("📝 Sample Course Matching Data:");
      const sample = courseMatchingSubmissions[0];
      console.log(JSON.stringify(sample.data, null, 2));
      console.log("\n");
    }

    // Analyze university exchanges (Basic Info + Course Matching combined)
    const universityExchangeMap = new Map();

    basicInfoSubmissions.forEach((submission) => {
      const {
        hostUniversity,
        hostCountry,
        hostCity,
        hostDepartment,
        departmentInCyprus,
        universityInCyprus,
        levelOfStudy,
      } = submission.data;

      if (!hostUniversity) return;

      const key = `${hostUniversity}-${hostCountry}`;

      if (!universityExchangeMap.has(key)) {
        universityExchangeMap.set(key, {
          hostUniversity,
          hostCountry,
          hostCity,
          hostDepartment,
          studentCount: 0,
          students: [],
          departments: new Set(),
          levels: new Set(),
          cyprusUniversities: new Set(),
          courseMatches: 0,
        });
      }

      const exchange = universityExchangeMap.get(key);
      exchange.studentCount++;
      exchange.students.push({
        name: `${submission.user.firstName} ${submission.user.lastName}`,
        submissionId: submission.id,
        userId: submission.userId,
      });
      if (hostDepartment) exchange.departments.add(hostDepartment);
      if (levelOfStudy) exchange.levels.add(levelOfStudy);
      if (universityInCyprus)
        exchange.cyprusUniversities.add(universityInCyprus);
      if (departmentInCyprus) exchange.departments.add(departmentInCyprus);
    });

    // Add course matching data
    courseMatchingSubmissions.forEach((submission) => {
      const basicInfo = basicInfoSubmissions.find(
        (b) => b.userId === submission.userId,
      );
      if (basicInfo) {
        const { hostUniversity, hostCountry } = basicInfo.data;
        const key = `${hostUniversity}-${hostCountry}`;
        const exchange = universityExchangeMap.get(key);

        if (exchange) {
          exchange.courseMatches++;

          // Extract course information
          const { courses, hostCourseCount, homeCourseCount } = submission.data;
          if (!exchange.courseData) exchange.courseData = [];

          exchange.courseData.push({
            courses: courses || [],
            hostCourseCount: hostCourseCount || 0,
            homeCourseCount: homeCourseCount || 0,
            submissionId: submission.id,
          });
        }
      }
    });

    // Display university exchange analysis
    console.log(`🏛️ University Exchange Analysis:\n`);

    const exchanges = Array.from(universityExchangeMap.values())
      .filter((ex) => ex.studentCount > 0)
      .sort((a, b) => b.studentCount - a.studentCount);

    exchanges.forEach((exchange, index) => {
      console.log(`${index + 1}. ${exchange.hostUniversity}`);
      console.log(
        `   📍 Location: ${exchange.hostCity}, ${exchange.hostCountry}`,
      );
      console.log(`   👥 Students: ${exchange.studentCount}`);
      console.log(
        `   🏛️ Departments: ${Array.from(exchange.departments).join(", ") || "Not specified"}`,
      );
      console.log(
        `   🎓 Study Levels: ${Array.from(exchange.levels).join(", ") || "Not specified"}`,
      );
      console.log(
        `   🇨🇾 Cyprus Universities: ${Array.from(exchange.cyprusUniversities).join(", ") || "Not specified"}`,
      );
      console.log(`   📚 Course Matches: ${exchange.courseMatches}`);

      if (exchange.courseData && exchange.courseData.length > 0) {
        const totalHostCourses = exchange.courseData.reduce(
          (sum, data) => sum + (data.hostCourseCount || 0),
          0,
        );
        const totalHomeCourses = exchange.courseData.reduce(
          (sum, data) => sum + (data.homeCourseCount || 0),
          0,
        );
        console.log(`   📖 Total Host Courses: ${totalHostCourses}`);
        console.log(`   📘 Total Home Courses: ${totalHomeCourses}`);
      }

      console.log("");
    });

    console.log(`\n📈 Summary:`);
    console.log(`- Total university exchanges: ${exchanges.length}`);
    console.log(
      `- Exchanges with course data: ${exchanges.filter((ex) => ex.courseMatches > 0).length}`,
    );
    console.log(
      `- Most popular: ${exchanges[0]?.hostUniversity} (${exchanges[0]?.studentCount} students)`,
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeCourseData();
