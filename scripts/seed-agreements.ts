import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedUniversitiesAndAgreements() {
  console.log("Starting to seed universities and agreements...");

  try {
    // Create Cyprus Universities
    const universityOfCyprus = await prisma.university.upsert({
      where: { code: "UCY" },
      update: {},
      create: {
        code: "UCY",
        name: "University of Cyprus",
        shortName: "UCY",
        type: "PUBLIC",
        country: "Cyprus",
        city: "Nicosia",
        website: "https://www.ucy.ac.cy",
      },
    });

    const universityOfNicosia = await prisma.university.upsert({
      where: { code: "UNIC" },
      update: {},
      create: {
        code: "UNIC",
        name: "University of Nicosia",
        shortName: "UNIC",
        type: "PRIVATE",
        country: "Cyprus",
        city: "Nicosia",
        website: "https://www.unic.ac.cy",
      },
    });

    const cut = await prisma.university.upsert({
      where: { code: "CUT" },
      update: {},
      create: {
        code: "CUT",
        name: "Cyprus University of Technology",
        shortName: "CUT",
        type: "PUBLIC",
        country: "Cyprus",
        city: "Limassol",
        website: "https://www.cut.ac.cy",
      },
    });

    const frederick = await prisma.university.upsert({
      where: { code: "FUC" },
      update: {},
      create: {
        code: "FUC",
        name: "Frederick University",
        shortName: "Frederick",
        type: "PRIVATE",
        country: "Cyprus",
        city: "Nicosia",
        website: "https://www.frederick.ac.cy",
      },
    });

    const euc = await prisma.university.upsert({
      where: { code: "EUC" },
      update: {},
      create: {
        code: "EUC",
        name: "European University Cyprus",
        shortName: "EUC",
        type: "PRIVATE",
        country: "Cyprus",
        city: "Nicosia",
        website: "https://www.euc.ac.cy",
      },
    });

    // Create some Partner Universities
    const esade = await prisma.university.upsert({
      where: { code: "ESADE" },
      update: {},
      create: {
        code: "ESADE",
        name: "ESADE Business School",
        shortName: "ESADE",
        type: "PRIVATE",
        country: "Spain",
        city: "Barcelona",
        website: "https://www.esade.edu",
      },
    });

    const tum = await prisma.university.upsert({
      where: { code: "TUM" },
      update: {},
      create: {
        code: "TUM",
        name: "Technical University of Munich",
        shortName: "TUM",
        type: "PUBLIC",
        country: "Germany",
        city: "Munich",
        website: "https://www.tum.de",
      },
    });

    const universityVienna = await prisma.university.upsert({
      where: { code: "UNIVIE" },
      update: {},
      create: {
        code: "UNIVIE",
        name: "University of Vienna",
        shortName: "Uni Vienna",
        type: "PUBLIC",
        country: "Austria",
        city: "Vienna",
        website: "https://www.univie.ac.at",
      },
    });

    const kth = await prisma.university.upsert({
      where: { code: "KTH" },
      update: {},
      create: {
        code: "KTH",
        name: "KTH Royal Institute of Technology",
        shortName: "KTH",
        type: "PUBLIC",
        country: "Sweden",
        city: "Stockholm",
        website: "https://www.kth.se",
      },
    });

    const bocconi = await prisma.university.upsert({
      where: { code: "BOCCONI" },
      update: {},
      create: {
        code: "BOCCONI",
        name: "Bocconi University",
        shortName: "Bocconi",
        type: "PRIVATE",
        country: "Italy",
        city: "Milan",
        website: "https://www.unibocconi.eu",
      },
    });

    console.log("Universities created successfully");

    // Create Faculties and Departments
    const businessFaculty = await prisma.faculty.upsert({
      where: { id: "business-unic" },
      update: {},
      create: {
        id: "business-unic",
        name: "School of Business",
        universityId: universityOfNicosia.id,
      },
    });

    const businessDept = await prisma.department.upsert({
      where: { id: "business-admin-unic" },
      update: {},
      create: {
        id: "business-admin-unic",
        name: "Business Administration",
        facultyId: businessFaculty.id,
      },
    });

    const engineeringFaculty = await prisma.faculty.upsert({
      where: { id: "engineering-cut" },
      update: {},
      create: {
        id: "engineering-cut",
        name: "Faculty of Engineering and Technology",
        universityId: cut.id,
      },
    });

    const electricalDept = await prisma.department.upsert({
      where: { id: "electrical-cut" },
      update: {},
      create: {
        id: "electrical-cut",
        name: "Electrical Engineering",
        facultyId: engineeringFaculty.id,
      },
    });

    const psychologyFaculty = await prisma.faculty.upsert({
      where: { id: "social-sciences-ucy" },
      update: {},
      create: {
        id: "social-sciences-ucy",
        name: "Faculty of Social Sciences and Education",
        universityId: universityOfCyprus.id,
      },
    });

    const psychologyDept = await prisma.department.upsert({
      where: { id: "psychology-ucy" },
      update: {},
      create: {
        id: "psychology-ucy",
        name: "Psychology",
        facultyId: psychologyFaculty.id,
      },
    });

    const computerScienceFaculty = await prisma.faculty.upsert({
      where: { id: "science-frederick" },
      update: {},
      create: {
        id: "science-frederick",
        name: "School of Science and Technology",
        universityId: frederick.id,
      },
    });

    const computerScienceDept = await prisma.department.upsert({
      where: { id: "computer-science-frederick" },
      update: {},
      create: {
        id: "computer-science-frederick",
        name: "Computer Science",
        facultyId: computerScienceFaculty.id,
      },
    });

    const economicsFaculty = await prisma.faculty.upsert({
      where: { id: "business-euc" },
      update: {},
      create: {
        id: "business-euc",
        name: "School of Business Administration",
        universityId: euc.id,
      },
    });

    const economicsDept = await prisma.department.upsert({
      where: { id: "economics-euc" },
      update: {},
      create: {
        id: "economics-euc",
        name: "Economics",
        facultyId: economicsFaculty.id,
      },
    });

    console.log("Faculties and Departments created successfully");

    // Create Agreements
    const agreements = [
      {
        homeUniversityId: universityOfNicosia.id,
        homeDepartmentId: businessDept.id,
        partnerUniversityId: esade.id,
        partnerCity: "Barcelona",
        partnerCountry: "Spain",
        agreementType: "STUDENT" as const,
      },
      {
        homeUniversityId: cut.id,
        homeDepartmentId: electricalDept.id,
        partnerUniversityId: tum.id,
        partnerCity: "Munich",
        partnerCountry: "Germany",
        agreementType: "STUDENT" as const,
      },
      {
        homeUniversityId: universityOfCyprus.id,
        homeDepartmentId: psychologyDept.id,
        partnerUniversityId: universityVienna.id,
        partnerCity: "Vienna",
        partnerCountry: "Austria",
        agreementType: "STUDENT" as const,
      },
      {
        homeUniversityId: frederick.id,
        homeDepartmentId: computerScienceDept.id,
        partnerUniversityId: kth.id,
        partnerCity: "Stockholm",
        partnerCountry: "Sweden",
        agreementType: "STUDENT" as const,
      },
      {
        homeUniversityId: euc.id,
        homeDepartmentId: economicsDept.id,
        partnerUniversityId: bocconi.id,
        partnerCity: "Milan",
        partnerCountry: "Italy",
        agreementType: "STUDENT" as const,
      },
    ];

    for (const agreement of agreements) {
      await prisma.agreement.upsert({
        where: {
          id: `${agreement.homeUniversityId}-${agreement.homeDepartmentId}-${agreement.partnerUniversityId}`,
        },
        update: {},
        create: {
          id: `${agreement.homeUniversityId}-${agreement.homeDepartmentId}-${agreement.partnerUniversityId}`,
          ...agreement,
        },
      });
    }

    console.log("Agreements created successfully");
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seedUniversitiesAndAgreements()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
