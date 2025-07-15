import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkPsychologyAgreements() {
  console.log("Checking UCY Psychology agreements...");

  try {
    // Find UCY
    const ucy = await prisma.university.findFirst({
      where: { code: "UCY" },
    });

    if (!ucy) {
      console.log("UCY not found");
      return;
    }

    // Find Psychology department
    const psychologyDept = await prisma.department.findFirst({
      where: {
        name: "Psychology",
        faculty: {
          universityId: ucy.id,
        },
      },
    });

    if (!psychologyDept) {
      console.log("Psychology department not found at UCY");
      return;
    }

    // Get all agreements for UCY Psychology
    const agreements = await prisma.agreement.findMany({
      where: {
        homeUniversityId: ucy.id,
        homeDepartmentId: psychologyDept.id,
      },
      include: {
        partnerUniversity: true,
      },
      orderBy: [
        { partnerCountry: "asc" },
        { partnerCity: "asc" },
        { partnerUniversity: { name: "asc" } },
      ],
    });

    console.log(`Found ${agreements.length} agreements for UCY Psychology:`);
    console.log("\nCountries available:");
    const countries = [
      ...new Set(agreements.map((a) => a.partnerCountry)),
    ].sort();
    countries.forEach((country) => console.log(`- ${country}`));

    console.log("\nCities available:");
    const cities = [...new Set(agreements.map((a) => a.partnerCity))].sort();
    cities.forEach((city) => console.log(`- ${city}`));

    console.log("\nUniversities available:");
    agreements.forEach((agreement) => {
      console.log(
        `- ${agreement.partnerUniversity.name} (${agreement.partnerCity}, ${agreement.partnerCountry})`,
      );
    });

    // Check specifically for Austria/Vienna
    const austrianAgreements = agreements.filter(
      (a) => a.partnerCountry === "Austria",
    );
    const viennaAgreements = agreements.filter(
      (a) => a.partnerCity === "Vienna",
    );

    console.log(`\nAustrian agreements: ${austrianAgreements.length}`);
    console.log(`Vienna agreements: ${viennaAgreements.length}`);

    if (austrianAgreements.length > 0) {
      console.log("Austrian universities:");
      austrianAgreements.forEach((a) =>
        console.log(`- ${a.partnerUniversity.name} (${a.partnerCity})`),
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkPsychologyAgreements()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
