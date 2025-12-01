import { prisma } from "../../lib/prisma";

export async function updateCityStatistics(city: string, country: string) {
  try {
    // 1. Fetch all completed experiences for this city
    // Filter: Only show SUBMITTED or APPROVED, exclude DRAFT and REJECTED
    const experiences = await prisma.erasmusExperience.findMany({
      where: {
        hostCity: { equals: city, mode: "insensitive" },
        hostCountry: { equals: country, mode: "insensitive" },
        isComplete: true,
        status: {
          notIn: ["DRAFT", "REJECTED"],
        },
      },
      select: {
        livingExpenses: true,
        accommodation: true,
      },
    });

    if (experiences.length === 0) return;

    // 2. Calculate Aggregates
    let totalRent = 0;
    let rentCount = 0;
    let rentMin = Infinity;
    let rentMax = -Infinity;
    const rents: number[] = [];

    let totalGroceries = 0;
    let totalTransport = 0;
    let totalEatingOut = 0;
    let totalSocial = 0;
    let totalExpenses = 0;
    let expenseCount = 0;

    experiences.forEach((exp) => {
      const expenses = exp.livingExpenses as any;
      const accommodation = exp.accommodation as any;

      // Rent (prefer accommodation section, fallback to expenses)
      let rent = 0;
      if (accommodation?.rent) {
        rent = parseFloat(accommodation.rent);
      } else if (expenses?.rent) {
        rent = parseFloat(expenses.rent);
      }

      if (rent > 0) {
        totalRent += rent;
        rentCount++;
        rentMin = Math.min(rentMin, rent);
        rentMax = Math.max(rentMax, rent);
        rents.push(rent);
      }

      // Other Expenses
      if (expenses) {
        const groceries = parseFloat(expenses.groceries || expenses.food || "0");
        const transport = parseFloat(expenses.transport || expenses.transportation || "0");
        const eatingOut = parseFloat(expenses.eatingOut || "0");
        const social = parseFloat(expenses.social || expenses.entertainment || "0");
        const total = parseFloat(expenses.total || expenses.totalMonthlyBudget || "0");

        if (total > 0) {
          totalGroceries += groceries;
          totalTransport += transport;
          totalEatingOut += eatingOut;
          totalSocial += social;
          totalExpenses += total;
          expenseCount++;
        }
      }
    });

    // Median Rent
    rents.sort((a, b) => a - b);
    const medianRent =
      rents.length > 0
        ? rents.length % 2 !== 0
          ? rents[Math.floor(rents.length / 2)]
          : (rents[rents.length / 2 - 1] + rents[rents.length / 2]) / 2
        : 0;

    // 3. Update CityStatistics
    await prisma.cityStatistics.upsert({
      where: {
        city_country_semester: {
          city,
          country,
          semester: "ALL", // We aggregate all-time for now
        },
      },
      update: {
        avgMonthlyRentCents: rentCount > 0 ? Math.round((totalRent / rentCount) * 100) : undefined,
        medianRentCents: rentCount > 0 ? Math.round(medianRent * 100) : undefined,
        minRentCents: rentCount > 0 ? Math.round(rentMin * 100) : undefined,
        maxRentCents: rentCount > 0 ? Math.round(rentMax * 100) : undefined,
        rentSampleSize: rentCount,
        avgGroceriesCents: expenseCount > 0 ? Math.round((totalGroceries / expenseCount) * 100) : undefined,
        avgTransportCents: expenseCount > 0 ? Math.round((totalTransport / expenseCount) * 100) : undefined,
        avgEatingOutCents: expenseCount > 0 ? Math.round((totalEatingOut / expenseCount) * 100) : undefined,
        avgSocialLifeCents: expenseCount > 0 ? Math.round((totalSocial / expenseCount) * 100) : undefined,
        avgTotalExpensesCents: expenseCount > 0 ? Math.round((totalExpenses / expenseCount) * 100) : undefined,
        expenseSampleSize: expenseCount,
        lastCalculated: new Date(),
      },
      create: {
        city,
        country,
        semester: "ALL",
        avgMonthlyRentCents: rentCount > 0 ? Math.round((totalRent / rentCount) * 100) : undefined,
        medianRentCents: rentCount > 0 ? Math.round(medianRent * 100) : undefined,
        minRentCents: rentCount > 0 ? Math.round(rentMin * 100) : undefined,
        maxRentCents: rentCount > 0 ? Math.round(rentMax * 100) : undefined,
        rentSampleSize: rentCount,
        avgGroceriesCents: expenseCount > 0 ? Math.round((totalGroceries / expenseCount) * 100) : undefined,
        avgTransportCents: expenseCount > 0 ? Math.round((totalTransport / expenseCount) * 100) : undefined,
        avgEatingOutCents: expenseCount > 0 ? Math.round((totalEatingOut / expenseCount) * 100) : undefined,
        avgSocialLifeCents: expenseCount > 0 ? Math.round((totalSocial / expenseCount) * 100) : undefined,
        avgTotalExpensesCents: expenseCount > 0 ? Math.round((totalExpenses / expenseCount) * 100) : undefined,
        expenseSampleSize: expenseCount,
      },
    });

    console.log(`Updated statistics for ${city}, ${country}`);
  } catch (error) {
    console.error(`Error updating statistics for ${city}, ${country}:`, error);
  }
}
