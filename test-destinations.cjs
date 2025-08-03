// Simple test script to verify the destination system
const { PrismaClient } = require("@prisma/client");

async function testDestinationSystem() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Testing Destination System...\n");

    // 1. Check current data
    console.log("1. Checking current database state:");
    const userCount = await prisma.user.count();
    const submissionCount = await prisma.formSubmission.count();
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Form Submissions: ${submissionCount}\n`);

    // 2. Test fake data generation
    console.log("2. Generating fake data...");

    const sampleDestinations = [
      { city: "Berlin", country: "Germany", rent: 550, expenses: 600 },
      { city: "Barcelona", country: "Spain", rent: 480, expenses: 520 },
      { city: "Prague", country: "Czech Republic", rent: 320, expenses: 380 },
    ];

    const sampleNames = [
      "Andreas Charalambous",
      "Maria Georgiou",
      "Christos Philippou",
      "Elena Constantinou",
      "Panagiotis Demetriou",
      "Sofia Andreou",
    ];

    for (const dest of sampleDestinations) {
      for (let i = 0; i < 3; i++) {
        const name =
          sampleNames[Math.floor(Math.random() * sampleNames.length)];
        const [firstName, lastName] = name.split(" ");

        // Create user
        const user = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            nationality: "Cypriot",
          },
        });

        // Create basic info submission
        const basicInfo = await prisma.formSubmission.create({
          data: {
            userId: user.id,
            formType: "basic-info",
            data: {
              city: dest.city,
              country: dest.country,
              university: `University of ${dest.city}`,
              exchangeDuration: "1 semester",
            },
          },
        });

        // Create accommodation submission
        await prisma.formSubmission.create({
          data: {
            userId: user.id,
            formType: "accommodation",
            data: {
              basicInfoId: basicInfo.id,
              rent: dest.rent,
              accommodationType: "Student residence",
              area: `${dest.city} Center`,
            },
          },
        });

        // Create living expenses submission
        await prisma.formSubmission.create({
          data: {
            userId: user.id,
            formType: "living-expenses",
            data: {
              basicInfoId: basicInfo.id,
              monthlyFood: dest.expenses * 0.4,
              monthlyTransport: dest.expenses * 0.15,
              monthlyEntertainment: dest.expenses * 0.3,
              monthlyOther: dest.expenses * 0.15,
            },
          },
        });
      }
    }

    console.log("   ✅ Fake data generated successfully!\n");

    // 3. Verify the data
    console.log("3. Verifying generated data:");
    const newUserCount = await prisma.user.count();
    const newSubmissionCount = await prisma.formSubmission.count();
    console.log(`   - Users: ${newUserCount} (+${newUserCount - userCount})`);
    console.log(
      `   - Form Submissions: ${newSubmissionCount} (+${newSubmissionCount - submissionCount})\n`,
    );

    // 4. Test destination aggregation logic
    console.log("4. Testing destination aggregation:");
    const basicInfoSubmissions = await prisma.formSubmission.findMany({
      where: { formType: "basic-info" },
      include: { user: true },
    });

    const destinationMap = new Map();

    for (const submission of basicInfoSubmissions) {
      const data = submission.data;
      const key = `${data.city}-${data.country}`;

      if (!destinationMap.has(key)) {
        destinationMap.set(key, {
          city: data.city,
          country: data.country,
          studentCount: 0,
          universities: new Set(),
          totalRent: 0,
          totalExpenses: 0,
          rentCount: 0,
          expensesCount: 0,
        });
      }

      const dest = destinationMap.get(key);
      dest.studentCount++;
      if (data.university) dest.universities.add(data.university);

      // Find related accommodation and living expenses
      const accommodation = await prisma.formSubmission.findFirst({
        where: {
          userId: submission.userId,
          formType: "accommodation",
          data: { path: ["basicInfoId"], equals: submission.id },
        },
      });

      const livingExpenses = await prisma.formSubmission.findFirst({
        where: {
          userId: submission.userId,
          formType: "living-expenses",
          data: { path: ["basicInfoId"], equals: submission.id },
        },
      });

      if (accommodation?.data) {
        const accData = accommodation.data;
        if (accData.rent) {
          dest.totalRent += accData.rent;
          dest.rentCount++;
        }
      }

      if (livingExpenses?.data) {
        const expData = livingExpenses.data;
        const totalMonthlyExpenses =
          (expData.monthlyFood || 0) +
          (expData.monthlyTransport || 0) +
          (expData.monthlyEntertainment || 0) +
          (expData.monthlyOther || 0);
        if (totalMonthlyExpenses > 0) {
          dest.totalExpenses += totalMonthlyExpenses;
          dest.expensesCount++;
        }
      }
    }

    // Convert to final format
    const destinations = Array.from(destinationMap.values()).map((dest) => ({
      city: dest.city,
      country: dest.country,
      studentCount: dest.studentCount,
      avgRent:
        dest.rentCount > 0 ? Math.round(dest.totalRent / dest.rentCount) : 0,
      avgLivingExpenses:
        dest.expensesCount > 0
          ? Math.round(dest.totalExpenses / dest.expensesCount)
          : 0,
      universities: Array.from(dest.universities),
      costLevel: (() => {
        const avgRent =
          dest.rentCount > 0 ? dest.totalRent / dest.rentCount : 0;
        return avgRent < 400 ? "low" : avgRent < 700 ? "medium" : "high";
      })(),
      avgCostPerMonth: Math.round(
        (dest.rentCount > 0 ? dest.totalRent / dest.rentCount : 0) +
          (dest.expensesCount > 0
            ? dest.totalExpenses / dest.expensesCount
            : 0),
      ),
    }));

    console.log("   📍 Generated destinations:");
    destinations.forEach((dest) => {
      console.log(
        `   - ${dest.city}, ${dest.country}: ${dest.studentCount} students, €${dest.avgCostPerMonth}/mo (${dest.costLevel} cost)`,
      );
    });

    console.log("\n🎉 Test completed successfully!");
    console.log("\n📋 Next steps:");
    console.log(
      "   1. Visit http://localhost:3001/destinations to see the generated destination cards",
    );
    console.log(
      "   2. Visit http://localhost:3001/dev-tools to use the web interface for data generation",
    );
    console.log(
      "   3. Try the search and filtering features on the destinations page",
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDestinationSystem();
