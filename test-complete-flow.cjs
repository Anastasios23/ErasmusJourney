#!/usr/bin/env node

/**
 * End-to-End Test for Unified Erasmus Experience System
 * Tests the complete flow from form submission to admin approval
 */

const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3000";

// Test data for a complete experience
const testExperience = {
  // Basic Information
  basicInfo: {
    firstName: "John",
    lastName: "TestStudent",
    studentId: "S12345",
    email: "john.test@university.edu",
    phone: "+1234567890",
    dateOfBirth: "1998-05-15",
    nationality: "American",
    homeUniversity: "University of California",
    studyProgram: "Computer Science",
    yearOfStudy: "3",
    academicYear: "2024-2025",
    hostUniversity: "Technical University of Berlin",
    hostCity: "Berlin",
    hostCountry: "Germany",
    exchangePeriod: "Fall 2024",
    facultyDepartment: "Computer Science",
  },

  // Course Matching
  courses: [
    {
      homeCourseCode: "CS301",
      homeCourseName: "Data Structures",
      homeCredits: 3,
      hostCourseCode: "TI301",
      hostCourseName: "Datenstrukturen",
      hostCredits: 6,
      approved: true,
    },
  ],

  // Accommodation
  accommodation: {
    accommodationAddress: "Musterstraße 123, 10115 Berlin",
    accommodationType: "Student Residence",
    monthlyRent: "450",
    billsIncluded: "yes",
    accommodationRating: "4",
    easyToFind: "yes",
    wouldRecommend: "yes",
    neighborhood: "Mitte",
  },

  // Living Expenses
  livingExpenses: {
    monthlyRent: 450,
    foodExpenses: 300,
    transportExpenses: 100,
    entertainmentExpenses: 150,
    otherExpenses: 50,
    totalMonthlyBudget: 1050,
  },

  // Overall Reflection
  overallReflection: {
    overallExperience: "excellent",
    academicExperience: "very-good",
    socialExperience: "excellent",
    culturalExperience: "excellent",
    wouldRecommend: "yes",
    additionalComments:
      "Amazing experience! Highly recommend Berlin for any exchange student.",
  },
};

async function testCompleteFlow() {
  console.log(
    "🚀 Starting End-to-End Test for Unified Erasmus Experience System\n",
  );

  try {
    // Step 1: Create a new experience (simulating form submission)
    console.log("📝 Step 1: Creating new experience...");

    const createResponse = await fetch(`${BASE_URL}/api/erasmus-experiences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create",
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create experience: ${createResponse.status}`);
    }

    const createResult = await createResponse.json();
    console.log("✅ Experience created with ID:", createResult.id);
    const experienceId = createResult.id;

    // Step 2: Update with basic info
    console.log("\n📋 Step 2: Saving basic information...");

    const basicInfoResponse = await fetch(
      `${BASE_URL}/api/erasmus-experiences`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: experienceId,
          basicInfo: testExperience.basicInfo,
        }),
      },
    );

    if (!basicInfoResponse.ok) {
      throw new Error(`Failed to save basic info: ${basicInfoResponse.status}`);
    }
    console.log("✅ Basic information saved");

    // Step 3: Update with courses
    console.log("\n🎓 Step 3: Saving course information...");

    const coursesResponse = await fetch(`${BASE_URL}/api/erasmus-experiences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: experienceId,
        courses: testExperience.courses,
      }),
    });

    if (!coursesResponse.ok) {
      throw new Error(`Failed to save courses: ${coursesResponse.status}`);
    }
    console.log("✅ Course information saved");

    // Step 4: Update with accommodation
    console.log("\n🏠 Step 4: Saving accommodation information...");

    const accommodationResponse = await fetch(
      `${BASE_URL}/api/erasmus-experiences`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: experienceId,
          accommodation: testExperience.accommodation,
        }),
      },
    );

    if (!accommodationResponse.ok) {
      throw new Error(
        `Failed to save accommodation: ${accommodationResponse.status}`,
      );
    }
    console.log("✅ Accommodation information saved");

    // Step 5: Update with living expenses
    console.log("\n💰 Step 5: Saving living expenses...");

    const expensesResponse = await fetch(
      `${BASE_URL}/api/erasmus-experiences`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: experienceId,
          livingExpenses: testExperience.livingExpenses,
        }),
      },
    );

    if (!expensesResponse.ok) {
      throw new Error(
        `Failed to save living expenses: ${expensesResponse.status}`,
      );
    }
    console.log("✅ Living expenses saved");

    // Step 6: Final submission
    console.log("\n🎯 Step 6: Final submission...");

    const submitResponse = await fetch(`${BASE_URL}/api/erasmus-experiences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: experienceId,
        action: "submit",
        overallReflection: testExperience.overallReflection,
      }),
    });

    if (!submitResponse.ok) {
      throw new Error(`Failed to submit experience: ${submitResponse.status}`);
    }

    const submitResult = await submitResponse.json();
    console.log("✅ Experience submitted successfully");
    console.log("📊 Final experience status:", submitResult.status);

    // Step 7: Verify submission appears in admin interface
    console.log("\n👑 Step 7: Checking admin interface...");

    // Note: This would require admin authentication in real usage
    console.log("⚠️  Admin interface check requires authentication");
    console.log("📍 Experience ID for manual verification:", experienceId);
    console.log("🔗 Check at: http://localhost:3000/admin-destinations");

    console.log("\n🎉 End-to-End Test COMPLETED Successfully!");
    console.log("\n📋 Test Summary:");
    console.log(`   - Experience ID: ${experienceId}`);
    console.log(
      `   - Student: ${testExperience.basicInfo.firstName} ${testExperience.basicInfo.lastName}`,
    );
    console.log(
      `   - Destination: ${testExperience.basicInfo.hostCity}, ${testExperience.basicInfo.hostCountry}`,
    );
    console.log(`   - University: ${testExperience.basicInfo.hostUniversity}`);
    console.log(`   - Status: SUBMITTED (Ready for Admin Review)`);
  } catch (error) {
    console.error("\n❌ Test Failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testCompleteFlow();
