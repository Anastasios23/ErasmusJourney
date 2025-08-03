const { PrismaClient } = require("@prisma/client");

async function analyzeDestinations() {
  const prisma = new PrismaClient();

  try {
    console.log("🏛️ Analyzing Destinations from Real Form Data...\n");

    // Get all submissions
    const basicInfoSubmissions = await prisma.formSubmission.findMany({
      where: { type: "BASIC_INFO" },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    const accommodationSubmissions = await prisma.formSubmission.findMany({
      where: { type: "ACCOMMODATION" },
    });

    const expenseSubmissions = await prisma.formSubmission.findMany({
      where: { type: "LIVING_EXPENSES" },
    });

    console.log(`📊 Data Overview:`);
    console.log(`- Basic Info: ${basicInfoSubmissions.length} submissions`);
    console.log(
      `- Accommodation: ${accommodationSubmissions.length} submissions`,
    );
    console.log(
      `- Living Expenses: ${expenseSubmissions.length} submissions\n`,
    );

    // Process destinations
    const destinationMap = new Map();

    // Process basic info
    basicInfoSubmissions.forEach((submission) => {
      const { hostCity, hostCountry, hostUniversity } = submission.data;
      if (!hostCity || !hostCountry) return;

      const key = `${hostCity}-${hostCountry}`;

      if (!destinationMap.has(key)) {
        destinationMap.set(key, {
          city: hostCity,
          country: hostCountry,
          universities: new Set(),
          studentCount: 0,
          accommodationCount: 0,
          rentTotal: 0,
          expenseTotal: 0,
          expenseCount: 0,
          rentSubmissions: [],
          expenseSubmissions: [],
        });
      }

      const destination = destinationMap.get(key);
      destination.universities.add(hostUniversity);
      destination.studentCount++;
    });

    // Process accommodation data
    accommodationSubmissions.forEach((submission) => {
      const { city, country, monthlyRent } = submission.data;

      // Try to find matching basic info
      const basicInfo = basicInfoSubmissions.find(
        (b) => b.userId === submission.userId,
      );
      let destCity = city;
      let destCountry = country;

      if (!destCity && basicInfo) {
        destCity = basicInfo.data.hostCity;
        destCountry = basicInfo.data.hostCountry;
      }

      if (destCity && destCountry && monthlyRent) {
        const key = `${destCity}-${destCountry}`;
        const destination = destinationMap.get(key);

        if (destination) {
          const rent = parseFloat(monthlyRent);
          if (!isNaN(rent) && rent > 0) {
            destination.rentSubmissions.push(rent);
            destination.accommodationCount++;
          }
        }
      }
    });

    // Process living expenses
    expenseSubmissions.forEach((submission) => {
      const basicInfo = basicInfoSubmissions.find(
        (b) => b.userId === submission.userId,
      );

      if (basicInfo && submission.data.expenses) {
        const { hostCity, hostCountry } = basicInfo.data;
        const key = `${hostCity}-${hostCountry}`;
        const destination = destinationMap.get(key);

        if (destination) {
          const totalExpenses = Object.values(submission.data.expenses).reduce(
            (sum, expense) => sum + (parseFloat(expense) || 0),
            0,
          );

          if (totalExpenses > 0) {
            destination.expenseSubmissions.push(totalExpenses);
            destination.expenseCount++;
          }
        }
      }
    });

    // Display results
    console.log(`🌍 Destination Analysis:\n`);

    const destinations = Array.from(destinationMap.values())
      .filter((dest) => dest.studentCount > 0)
      .sort((a, b) => b.studentCount - a.studentCount);

    destinations.forEach((dest, index) => {
      const avgRent =
        dest.rentSubmissions.length > 0
          ? dest.rentSubmissions.reduce((a, b) => a + b, 0) /
            dest.rentSubmissions.length
          : 0;
      const avgExpenses =
        dest.expenseSubmissions.length > 0
          ? dest.expenseSubmissions.reduce((a, b) => a + b, 0) /
            dest.expenseSubmissions.length
          : 0;
      const totalCost = Math.round(avgRent + avgExpenses);
      const costLevel =
        totalCost < 600 ? "💚 Low" : totalCost < 1000 ? "🟡 Medium" : "🔴 High";

      console.log(`${index + 1}. ${dest.city}, ${dest.country}`);
      console.log(`   👥 Students: ${dest.studentCount}`);
      console.log(
        `   🏛️ Universities: ${Array.from(dest.universities).slice(0, 3).join(", ")}${dest.universities.size > 3 ? "..." : ""}`,
      );
      if (avgRent > 0) {
        console.log(
          `   🏠 Avg Rent: €${Math.round(avgRent)}/month (${dest.accommodationCount} submissions)`,
        );
      }
      if (avgExpenses > 0) {
        console.log(
          `   💰 Avg Living Expenses: €${Math.round(avgExpenses)}/month (${dest.expenseCount} submissions)`,
        );
      }
      if (totalCost > 0) {
        console.log(`   📊 Total Cost: €${totalCost}/month ${costLevel}`);
      }
      console.log("");
    });

    console.log(`\n📈 Summary:`);
    console.log(`- Total destinations: ${destinations.length}`);
    console.log(
      `- Destinations with rent data: ${destinations.filter((d) => d.accommodationCount > 0).length}`,
    );
    console.log(
      `- Destinations with expense data: ${destinations.filter((d) => d.expenseCount > 0).length}`,
    );
    console.log(
      `- Average destinations per student: ${(destinations.reduce((sum, d) => sum + d.studentCount, 0) / destinations.length).toFixed(1)}`,
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDestinations();
