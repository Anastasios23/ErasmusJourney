import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import "dotenv/config";

const prisma = new PrismaClient();

type ProofSeedRecord = {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    nationality: string;
    homeCity: string;
    homeCountry: string;
  };
  basicInfo: {
    homeUniversity: string;
    homeUniversityCode: string;
    homeDepartment: string;
    levelOfStudy: "Bachelor" | "Master";
    hostUniversity: string;
    hostCity: string;
    hostCountry: string;
    exchangeAcademicYear: string;
    exchangePeriod: "Fall" | "Spring";
    languageOfInstruction: string;
    exchangeStartDate: string;
    exchangeEndDate: string;
  };
  accommodation: {
    accommodationType:
      | "student_residence"
      | "shared_apartment"
      | "private_apartment";
    monthlyRent: number;
    currency: string;
    billsIncluded: "yes" | "no" | "partially";
    areaOrNeighborhood: string;
    minutesToUniversity: number;
    howFoundAccommodation:
      | "university_dorm"
      | "housing_platform"
      | "facebook_group";
    difficultyFindingAccommodation:
      | "easy"
      | "moderate"
      | "difficult";
    accommodationRating: number;
    wouldRecommend: boolean;
    accommodationReview: string;
  };
  livingExpenses: {
    currency: string;
    rent: number;
    food: number;
    transport: number;
    social: number;
    travel: number;
    other: number;
  };
  courses: {
    mappings: Array<{
      homeCourseCode: string;
      homeCourseName: string;
      homeECTS: number;
      hostCourseCode: string;
      hostCourseName: string;
      hostECTS: number;
      recognitionType:
        | "full_equivalence"
        | "department_elective"
        | "free_elective";
      notes: string;
    }>;
  };
  experience: {
    generalTips: string;
    academicAdvice: string;
    socialAdvice: string;
    bestExperience: string;
  };
};

const COMPLETED_STEPS = JSON.stringify([1, 2, 3, 4, 5]);

const PROOF_SEED_RECORDS: ProofSeedRecord[] = [
  {
    user: {
      email: "proof.amsterdam.one@ucy.ac.cy",
      firstName: "Elena",
      lastName: "Kyriakou",
      nationality: "Cypriot",
      homeCity: "Nicosia",
      homeCountry: "Cyprus",
    },
    basicInfo: {
      homeUniversity: "University of Cyprus",
      homeUniversityCode: "UCY",
      homeDepartment: "Computer Science",
      levelOfStudy: "Bachelor",
      hostUniversity: "University of Amsterdam",
      hostCity: "Amsterdam",
      hostCountry: "Netherlands",
      exchangeAcademicYear: "2025/2026",
      exchangePeriod: "Fall",
      languageOfInstruction: "English",
      exchangeStartDate: "2025-09-01",
      exchangeEndDate: "2026-01-20",
    },
    accommodation: {
      accommodationType: "shared_apartment",
      monthlyRent: 780,
      currency: "EUR",
      billsIncluded: "partially",
      areaOrNeighborhood: "De Pijp",
      minutesToUniversity: 18,
      howFoundAccommodation: "housing_platform",
      difficultyFindingAccommodation: "difficult",
      accommodationRating: 4,
      wouldRecommend: true,
      accommodationReview:
        "Strong location for everyday student life. Start searching early because good rooms disappear fast.",
    },
    livingExpenses: {
      currency: "EUR",
      rent: 780,
      food: 240,
      transport: 55,
      social: 180,
      travel: 90,
      other: 70,
    },
    courses: {
      mappings: [
        {
          homeCourseCode: "CSC301",
          homeCourseName: "Database Systems",
          homeECTS: 6,
          hostCourseCode: "INF-DM301",
          hostCourseName: "Data Management",
          hostECTS: 6,
          recognitionType: "full_equivalence",
          notes: "Good overlap in SQL, modeling, and transaction topics.",
        },
        {
          homeCourseCode: "CSC341",
          homeCourseName: "Human Computer Interaction",
          homeECTS: 6,
          hostCourseCode: "INF-HCI240",
          hostCourseName: "Designing Interactive Systems",
          hostECTS: 6,
          recognitionType: "department_elective",
          notes: "Very project-heavy but useful for portfolio work.",
        },
      ],
    },
    experience: {
      generalTips:
        "Budget more carefully for housing than for food. Rent dominates the monthly total.",
      academicAdvice:
        "Lock the learning agreement early and keep written confirmation for every change.",
      socialAdvice:
        "Use student associations for your first network instead of waiting for classes to form friendships.",
      bestExperience:
        "Small project groups made it easier to meet local and international students quickly.",
    },
  },
  {
    user: {
      email: "proof.amsterdam.two@cut.ac.cy",
      firstName: "Marios",
      lastName: "Hadjisavva",
      nationality: "Cypriot",
      homeCity: "Limassol",
      homeCountry: "Cyprus",
    },
    basicInfo: {
      homeUniversity: "Cyprus University of Technology",
      homeUniversityCode: "CUT",
      homeDepartment: "Business Administration",
      levelOfStudy: "Bachelor",
      hostUniversity: "Amsterdam University of Applied Sciences",
      hostCity: "Amsterdam",
      hostCountry: "Netherlands",
      exchangeAcademicYear: "2025/2026",
      exchangePeriod: "Fall",
      languageOfInstruction: "English",
      exchangeStartDate: "2025-09-05",
      exchangeEndDate: "2026-01-18",
    },
    accommodation: {
      accommodationType: "student_residence",
      monthlyRent: 910,
      currency: "EUR",
      billsIncluded: "yes",
      areaOrNeighborhood: "Amsterdam Oost",
      minutesToUniversity: 12,
      howFoundAccommodation: "university_dorm",
      difficultyFindingAccommodation: "moderate",
      accommodationRating: 5,
      wouldRecommend: true,
      accommodationReview:
        "More expensive than I expected, but stable and easy for a first semester abroad.",
    },
    livingExpenses: {
      currency: "EUR",
      rent: 910,
      food: 260,
      transport: 45,
      social: 160,
      travel: 80,
      other: 65,
    },
    courses: {
      mappings: [
        {
          homeCourseCode: "MGT312",
          homeCourseName: "International Marketing",
          homeECTS: 6,
          hostCourseCode: "IB-241",
          hostCourseName: "Global Branding Strategy",
          hostECTS: 6,
          recognitionType: "full_equivalence",
          notes: "Comparable marketing strategy workload with stronger case-study emphasis.",
        },
        {
          homeCourseCode: "MGT355",
          homeCourseName: "Entrepreneurship",
          homeECTS: 6,
          hostCourseCode: "ENT-210",
          hostCourseName: "Startup Studio",
          hostECTS: 6,
          recognitionType: "free_elective",
          notes: "Very practical course with team pitching and weekly mentor reviews.",
        },
      ],
    },
    experience: {
      generalTips:
        "Amsterdam is manageable if you accept that rent is the main budget pressure point.",
      academicAdvice:
        "Project-based modules move quickly, so confirm grading rules during the first two weeks.",
      socialAdvice:
        "Shared residence events helped more than random nightlife plans.",
      bestExperience:
        "The mix of applied classes and a compact city made the semester easy to navigate.",
    },
  },
  {
    user: {
      email: "proof.prague.one@unic.ac.cy",
      firstName: "Nefeli",
      lastName: "Andreou",
      nationality: "Cypriot",
      homeCity: "Nicosia",
      homeCountry: "Cyprus",
    },
    basicInfo: {
      homeUniversity: "University of Nicosia",
      homeUniversityCode: "UNIC",
      homeDepartment: "History",
      levelOfStudy: "Bachelor",
      hostUniversity: "Charles University",
      hostCity: "Prague",
      hostCountry: "Czech Republic",
      exchangeAcademicYear: "2025/2026",
      exchangePeriod: "Spring",
      languageOfInstruction: "English",
      exchangeStartDate: "2026-02-10",
      exchangeEndDate: "2026-06-25",
    },
    accommodation: {
      accommodationType: "student_residence",
      monthlyRent: 360,
      currency: "EUR",
      billsIncluded: "yes",
      areaOrNeighborhood: "Prague 6",
      minutesToUniversity: 20,
      howFoundAccommodation: "university_dorm",
      difficultyFindingAccommodation: "easy",
      accommodationRating: 4,
      wouldRecommend: true,
      accommodationReview:
        "Dorm quality is basic but the value is strong and the student network is immediate.",
    },
    livingExpenses: {
      currency: "CZK",
      rent: 9000,
      food: 4500,
      transport: 550,
      social: 2200,
      travel: 1800,
      other: 1200,
    },
    courses: {
      mappings: [
        {
          homeCourseCode: "HIS210",
          homeCourseName: "Modern European History",
          homeECTS: 6,
          hostCourseCode: "HIS-EU310",
          hostCourseName: "Central European History",
          hostECTS: 6,
          recognitionType: "full_equivalence",
          notes: "Good thematic overlap with stronger regional source analysis.",
        },
      ],
    },
    experience: {
      generalTips:
        "Prague works well for students who want a lower-cost destination with strong travel access.",
      academicAdvice:
        "Keep readings organized because the seminar discussions depend on steady weekly preparation.",
      socialAdvice:
        "Dorm life makes the first month much easier if you join orientation events early.",
      bestExperience:
        "Weekend trips were easy to plan without blowing the budget.",
    },
  },
];

async function upsertProofUser(record: ProofSeedRecord["user"]) {
  const existing = await prisma.users.findUnique({
    where: { email: record.email },
  });

  if (existing) {
    return prisma.users.update({
      where: { id: existing.id },
      data: {
        firstName: record.firstName,
        lastName: record.lastName,
        nationality: record.nationality,
        homeCity: record.homeCity,
        homeCountry: record.homeCountry,
        role: "USER",
        emailVerified: existing.emailVerified ?? new Date(),
        updatedAt: new Date(),
      },
    });
  }

  return prisma.users.create({
    data: {
      id: randomUUID(),
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      role: "USER",
      nationality: record.nationality,
      homeCity: record.homeCity,
      homeCountry: record.homeCountry,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

async function upsertProofExperience(
  userId: string,
  record: ProofSeedRecord,
): Promise<void> {
  const timestamp = new Date();

  await prisma.erasmusExperience.upsert({
    where: { userId },
    update: {
      currentStep: 5,
      completedSteps: COMPLETED_STEPS,
      isComplete: true,
      basicInfo: record.basicInfo,
      courses: record.courses,
      accommodation: record.accommodation,
      livingExpenses: record.livingExpenses,
      experience: record.experience,
      status: "APPROVED",
      lastSavedAt: timestamp,
      submittedAt: timestamp,
      publishedAt: timestamp,
      semester: `${record.basicInfo.exchangeAcademicYear} ${record.basicInfo.exchangePeriod}`,
      hostCity: record.basicInfo.hostCity,
      hostCountry: record.basicInfo.hostCountry,
      reviewedAt: timestamp,
      updatedAt: timestamp,
    },
    create: {
      id: randomUUID(),
      userId,
      currentStep: 5,
      completedSteps: COMPLETED_STEPS,
      isComplete: true,
      basicInfo: record.basicInfo,
      courses: record.courses,
      accommodation: record.accommodation,
      livingExpenses: record.livingExpenses,
      experience: record.experience,
      status: "APPROVED",
      lastSavedAt: timestamp,
      submittedAt: timestamp,
      publishedAt: timestamp,
      semester: `${record.basicInfo.exchangeAcademicYear} ${record.basicInfo.exchangePeriod}`,
      hostCity: record.basicInfo.hostCity,
      hostCountry: record.basicInfo.hostCountry,
      reviewedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  });
}

async function main(): Promise<void> {
  console.log("Seeding proof-ready approved Erasmus experiences...");

  for (const record of PROOF_SEED_RECORDS) {
    const user = await upsertProofUser(record.user);
    await upsertProofExperience(user.id, record);
    console.log(
      `Seeded approved proof data for ${record.basicInfo.hostCity}, ${record.basicInfo.hostCountry} via ${record.user.email}`,
    );
  }

  const approvedCount = await prisma.erasmusExperience.count({
    where: {
      status: "APPROVED",
      isComplete: true,
      hostCity: { not: null },
      hostCountry: { not: null },
    },
  });

  console.log(
    `Proof-ready dataset is available. Approved+complete public experiences: ${approvedCount}`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed proof-ready public data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
