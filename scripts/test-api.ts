async function testAPI() {
  console.log("🧪 TESTING API RESPONSES...\n");

  try {
    // Test form submissions API
    console.log("1️⃣ Testing /api/form-submissions:");
    const response = await fetch("http://localhost:3000/api/form-submissions");

    if (!response.ok) {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log(
      `✅ Response received: ${Array.isArray(data) ? data.length : "Not an array"} items`,
    );

    if (Array.isArray(data)) {
      console.log("\n📊 Submissions by type:");
      const typeGroups = data.reduce(
        (acc, sub) => {
          if (!acc[sub.type]) acc[sub.type] = [];
          acc[sub.type].push(sub);
          return acc;
        },
        {} as Record<string, any[]>,
      );

      Object.entries(typeGroups).forEach(([type, subs]) => {
        console.log(`   "${type}": ${subs.length} submission(s)`);
      });

      // Check for COURSE_MATCHING specifically
      const courseMatching = data.filter(
        (sub) => sub.type === "COURSE_MATCHING",
      );
      console.log(`\n📚 COURSE_MATCHING submissions: ${courseMatching.length}`);

      if (courseMatching.length > 0) {
        console.log("\nSample COURSE_MATCHING submission:");
        const sample = courseMatching[0];
        console.log(`   Title: ${sample.title}`);
        console.log(`   University: ${sample.data?.hostUniversity || "N/A"}`);
        console.log(`   Has hostCourses: ${!!sample.data?.hostCourses}`);
        console.log(
          `   Has recognizedCourses: ${!!sample.data?.recognizedCourses}`,
        );
      }
    } else {
      console.log("❌ API did not return an array");
      console.log("Response:", data);
    }
  } catch (error) {
    console.error("❌ Error testing API:", error);
  }
}

testAPI();
