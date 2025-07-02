#!/usr/bin/env tsx

/**
 * Authentication Test Script
 *
 * This script tests various authentication scenarios:
 * 1. Public pages accessible without auth
 * 2. Protected pages redirect to login
 * 3. Login functionality with demo credentials
 * 4. Admin access restrictions
 */

import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

interface TestResult {
  url: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  description: string;
}

async function testUrl(
  url: string,
  expectedStatus: number,
  description: string,
  headers?: Record<string, string>,
): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      headers: headers || {},
      redirect: "manual", // Don't follow redirects automatically
    });

    const actualStatus = response.status;
    const passed = actualStatus === expectedStatus;

    return {
      url,
      expectedStatus,
      actualStatus,
      passed,
      description,
    };
  } catch (error) {
    return {
      url,
      expectedStatus,
      actualStatus: 0,
      passed: false,
      description: `${description} (Error: ${error})`,
    };
  }
}

async function runAuthenticationTests() {
  console.log("🧪 Running Authentication Tests...\n");

  const tests: TestResult[] = [];

  // Test 1: Public pages should be accessible (200)
  console.log("📖 Testing Public Pages Access...");
  tests.push(await testUrl("/", 200, "Home page should be accessible"));
  tests.push(
    await testUrl(
      "/destinations",
      200,
      "Destinations page should be accessible",
    ),
  );
  tests.push(
    await testUrl(
      "/student-stories",
      200,
      "Student stories should be accessible",
    ),
  );
  tests.push(
    await testUrl(
      "/student-accommodations",
      200,
      "Student accommodations should be accessible",
    ),
  );
  tests.push(await testUrl("/login", 200, "Login page should be accessible"));
  tests.push(
    await testUrl("/register", 200, "Register page should be accessible"),
  );

  // Test 2: Protected pages should redirect to login (302/307)
  console.log("\n🔒 Testing Protected Pages (should redirect)...");
  tests.push(
    await testUrl("/dashboard", 302, "Dashboard should redirect to login"),
  );
  tests.push(
    await testUrl("/profile", 302, "Profile should redirect to login"),
  );
  tests.push(
    await testUrl(
      "/basic-information",
      302,
      "Basic information form should redirect to login",
    ),
  );
  tests.push(
    await testUrl(
      "/course-matching",
      302,
      "Course matching form should redirect to login",
    ),
  );
  tests.push(
    await testUrl("/admin", 302, "Admin panel should redirect to login"),
  );

  // Test 3: API endpoints without auth should return 401
  console.log("\n🔑 Testing API Authentication...");
  tests.push(
    await testUrl(
      "/api/forms/submit",
      405,
      "Forms API should reject GET requests",
    ),
  ); // POST only
  tests.push(
    await testUrl(
      "/api/forms/get",
      401,
      "Forms API should require authentication",
    ),
  );

  // Test 4: Auth API endpoints should be accessible
  console.log("\n🌐 Testing Auth API Endpoints...");
  tests.push(
    await testUrl("/api/auth/session", 200, "Session API should be accessible"),
  );
  tests.push(
    await testUrl(
      "/api/auth/providers",
      200,
      "Providers API should be accessible",
    ),
  );
  tests.push(
    await testUrl("/api/auth/csrf", 200, "CSRF API should be accessible"),
  );

  // Display results
  console.log("\n📊 Test Results:");
  console.log("=".repeat(80));

  let passed = 0;
  let total = tests.length;

  tests.forEach((test, index) => {
    const status = test.passed ? "✅" : "❌";
    console.log(`${status} ${test.description}`);
    console.log(`   URL: ${test.url}`);
    console.log(
      `   Expected: ${test.expectedStatus}, Got: ${test.actualStatus}`,
    );

    if (test.passed) passed++;
    console.log("");
  });

  console.log("=".repeat(80));
  console.log(
    `Results: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`,
  );

  if (passed === total) {
    console.log("🎉 All authentication tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Check the results above.");
  }

  return { passed, total, tests };
}

// Manual test scenarios to verify
function displayManualTests() {
  console.log("\n🧑‍💻 Manual Tests to Perform:");
  console.log("=".repeat(50));
  console.log("1. 📱 Try accessing /dashboard without logging in");
  console.log("   → Should redirect to /login");
  console.log("");
  console.log("2. 🔑 Login with demo credentials:");
  console.log("   → Username: demo, Password: demo");
  console.log("   → Should redirect to /dashboard");
  console.log("");
  console.log("3. 👑 Login with admin credentials:");
  console.log("   → Email: admin@erasmus.cy, Password: admin123");
  console.log('   → Should see "Admin" link in navigation');
  console.log("");
  console.log("4. 📝 Try accessing forms while logged out:");
  console.log("   → /basic-information should redirect to login");
  console.log("   → /course-matching should redirect to login");
  console.log("");
  console.log("5. 🚪 Test logout functionality:");
  console.log("   → Click logout, should redirect to home");
  console.log("   → Try accessing /dashboard, should redirect to login");
  console.log("");
  console.log("6. 📧 Test registration:");
  console.log("   → Create new account with email/password");
  console.log("   → Should auto-login and redirect to dashboard");
}

if (require.main === module) {
  runAuthenticationTests()
    .then(() => {
      displayManualTests();
    })
    .catch(console.error);
}

export { runAuthenticationTests };
