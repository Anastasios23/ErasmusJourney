import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HOME_UNIVERSITY_ID = "seed-home-university-ucy";
const HOST_UNIVERSITY_ID = "seed-host-university-prague";
const STUDENT_USER_ID = "seed-student-prague-approved";
const ADMIN_USER_ID = "seed-admin-prague-approved";
const EXPERIENCE_ID = "seed-experience-prague-approved";
const COURSE_MAPPING_ID = "seed-course-mapping-prague-approved";
const ACCOMMODATION_REVIEW_ID = "seed-accommodation-review-prague-approved";
const REVIEW_ACTION_ID = "seed-review-action-prague-approved";

async function main() {
  const now = new Date();

  const homeUniversity = await prisma.universities.upsert({
    where: { code: "UCY" },
    update: {
      name: "University of Cyprus",
      shortName: "UCY",
      type: "PUBLIC",
      country: "Cyprus",
      city: "Nicosia",
      updatedAt: now,
    },
    create: {
      id: HOME_UNIVERSITY_ID,
      code: "UCY",
      name: "University of Cyprus",
      shortName: "UCY",
      type: "PUBLIC",
      country: "Cyprus",
      city: "Nicosia",
      website: "https://www.ucy.ac.cy",
      updatedAt: now,
    },
  });

  const hostUniversity = await prisma.universities.upsert({
    where: { code: "SEED-CUNI-PRG" },
    update: {
      name: "Charles University",
      shortName: "Charles University Prague",
      type: "PUBLIC",
      country: "Czech Republic",
      city: "Prague",
      updatedAt: now,
    },
    create: {
      id: HOST_UNIVERSITY_ID,
      code: "SEED-CUNI-PRG",
      name: "Charles University",
      shortName: "Charles University Prague",
      type: "PUBLIC",
      country: "Czech Republic",
      city: "Prague",
      website: "https://cuni.cz",
      updatedAt: now,
    },
  });

  await prisma.users.upsert({
    where: { email: "student@ucy.ac.cy" },
    update: {
      firstName: "Seed",
      lastName: "Student",
      role: "STUDENT",
      updatedAt: now,
    },
    create: {
      id: STUDENT_USER_ID,
      email: "student@ucy.ac.cy",
      firstName: "Seed",
      lastName: "Student",
      role: "STUDENT",
      emailVerified: now,
      nationality: "Cypriot",
      homeCity: "Nicosia",
      homeCountry: "Cyprus",
      updatedAt: now,
    },
  });

  const adminUser = await prisma.users.upsert({
    where: { email: "admin.seed@ucy.ac.cy" },
    update: {
      firstName: "Seed",
      lastName: "Admin",
      role: "ADMIN",
      updatedAt: now,
    },
    create: {
      id: ADMIN_USER_ID,
      email: "admin.seed@ucy.ac.cy",
      firstName: "Seed",
      lastName: "Admin",
      role: "ADMIN",
      emailVerified: now,
      updatedAt: now,
    },
  });

  const studentUser = await prisma.users.findUniqueOrThrow({
    where: { email: "student@ucy.ac.cy" },
    select: { id: true },
  });

  await prisma.erasmusExperience.upsert({
    where: { userId: studentUser.id },
    update: {
      id: EXPERIENCE_ID,
      currentStep: 5,
      completedSteps: JSON.stringify([1, 2, 3, 4, 5]),
      isComplete: true,
      basicInfo: {
        homeUniversity: "University of Cyprus",
        homeUniversityCode: "UCY",
        homeDepartment: "Computer Science",
        levelOfStudy: "Bachelor",
        hostUniversity: "Charles University",
        hostCity: "Prague",
        hostCountry: "Czech Republic",
        exchangeAcademicYear: "2024-2025",
        exchangePeriod: "FALL",
        languageOfInstruction: "English",
        exchangeStartDate: "2024-09-15",
        exchangeEndDate: "2025-01-31",
      },
      courses: [
        {
          id: "seed-course-json-1",
          homeCourseCode: "CSC301",
          homeCourseName: "Database Systems",
          homeECTS: 6,
          hostCourseCode: "DB201",
          hostCourseName: "Database Technologies",
          hostECTS: 6,
          recognitionType: "full_equivalence",
          notes: "Seeded equivalence example for development.",
        },
      ],
      accommodation: {
        accommodationType: "student_residence",
        monthlyRent: 450,
        currency: "EUR",
        billsIncluded: "yes",
        areaOrNeighborhood: "Prague 6",
        minutesToUniversity: 18,
        howFoundAccommodation: "university_dorm",
        difficultyFindingAccommodation: "easy",
        accommodationRating: 4,
        wouldRecommend: true,
        accommodationReview:
          "Comfortable and affordable housing close to transport links.",
      },
      livingExpenses: {
        currency: "EUR",
        rent: 450,
        food: 220,
        transport: 35,
        social: 140,
        travel: 80,
        other: 60,
      },
      experience: {
        overallRating: 5,
        bestExperience:
          "Great balance between academic quality and affordable student life.",
        generalTips:
          "Secure housing early and keep course approvals documented.",
        academicAdvice:
          "Attend the first tutorials to align expectations with instructors.",
        socialAdvice: "Join orientation events to build your network quickly.",
      },
      status: "APPROVED",
      semester: "FALL",
      hostCity: "Prague",
      hostCountry: "Czech Republic",
      hostUniversityId: hostUniversity.id,
      homeUniversityId: homeUniversity.id,
      adminNotes: "Seeded for development",
      reviewedAt: now,
      reviewedBy: adminUser.id,
      reviewFeedback: "Seed approved submission for development verification.",
      revisionCount: 0,
      lastSavedAt: now,
      submittedAt: now,
      publishedAt: now,
      updatedAt: now,
    },
    create: {
      id: EXPERIENCE_ID,
      userId: studentUser.id,
      currentStep: 5,
      completedSteps: JSON.stringify([1, 2, 3, 4, 5]),
      isComplete: true,
      basicInfo: {
        homeUniversity: "University of Cyprus",
        homeUniversityCode: "UCY",
        homeDepartment: "Computer Science",
        levelOfStudy: "Bachelor",
        hostUniversity: "Charles University",
        hostCity: "Prague",
        hostCountry: "Czech Republic",
        exchangeAcademicYear: "2024-2025",
        exchangePeriod: "FALL",
        languageOfInstruction: "English",
        exchangeStartDate: "2024-09-15",
        exchangeEndDate: "2025-01-31",
      },
      courses: [
        {
          id: "seed-course-json-1",
          homeCourseCode: "CSC301",
          homeCourseName: "Database Systems",
          homeECTS: 6,
          hostCourseCode: "DB201",
          hostCourseName: "Database Technologies",
          hostECTS: 6,
          recognitionType: "full_equivalence",
          notes: "Seeded equivalence example for development.",
        },
      ],
      accommodation: {
        accommodationType: "student_residence",
        monthlyRent: 450,
        currency: "EUR",
        billsIncluded: "yes",
        areaOrNeighborhood: "Prague 6",
        minutesToUniversity: 18,
        howFoundAccommodation: "university_dorm",
        difficultyFindingAccommodation: "easy",
        accommodationRating: 4,
        wouldRecommend: true,
        accommodationReview:
          "Comfortable and affordable housing close to transport links.",
      },
      livingExpenses: {
        currency: "EUR",
        rent: 450,
        food: 220,
        transport: 35,
        social: 140,
        travel: 80,
        other: 60,
      },
      experience: {
        overallRating: 5,
        bestExperience:
          "Great balance between academic quality and affordable student life.",
        generalTips:
          "Secure housing early and keep course approvals documented.",
        academicAdvice:
          "Attend the first tutorials to align expectations with instructors.",
        socialAdvice: "Join orientation events to build your network quickly.",
      },
      status: "APPROVED",
      semester: "FALL",
      hostCity: "Prague",
      hostCountry: "Czech Republic",
      hostUniversityId: hostUniversity.id,
      homeUniversityId: homeUniversity.id,
      adminNotes: "Seeded for development",
      reviewedAt: now,
      reviewedBy: adminUser.id,
      reviewFeedback: "Seed approved submission for development verification.",
      revisionCount: 0,
      lastSavedAt: now,
      submittedAt: now,
      publishedAt: now,
      updatedAt: now,
    },
  });

  await prisma.courseMapping.upsert({
    where: { id: COURSE_MAPPING_ID },
    update: {
      experienceId: EXPERIENCE_ID,
      universityId: hostUniversity.id,
      homeCourseCode: "CSC301",
      homeCourseName: "Database Systems",
      homeCredits: 6,
      hostCourseCode: "DB201",
      hostCourseName: "Database Technologies",
      hostCredits: 6,
      status: "APPROVED",
    },
    create: {
      id: COURSE_MAPPING_ID,
      experienceId: EXPERIENCE_ID,
      universityId: hostUniversity.id,
      homeCourseCode: "CSC301",
      homeCourseName: "Database Systems",
      homeCredits: 6,
      hostCourseCode: "DB201",
      hostCourseName: "Database Technologies",
      hostCredits: 6,
      status: "APPROVED",
    },
  });

  await prisma.accommodationReview.upsert({
    where: { id: ACCOMMODATION_REVIEW_ID },
    update: {
      experienceId: EXPERIENCE_ID,
      name: "Seeded Prague Student Residence",
      type: "DORM",
      neighborhood: "Prague 6",
      pricePerMonth: 450,
      currency: "EUR",
      rating: 4,
      cleanliness: 4,
      location: 4,
      socialVibe: 4,
      comment: "Seeded accommodation review for development verification.",
    },
    create: {
      id: ACCOMMODATION_REVIEW_ID,
      experienceId: EXPERIENCE_ID,
      name: "Seeded Prague Student Residence",
      type: "DORM",
      neighborhood: "Prague 6",
      pricePerMonth: 450,
      currency: "EUR",
      rating: 4,
      cleanliness: 4,
      location: 4,
      socialVibe: 4,
      comment: "Seeded accommodation review for development verification.",
    },
  });

  await prisma.reviewAction.upsert({
    where: { id: REVIEW_ACTION_ID },
    update: {
      experienceId: EXPERIENCE_ID,
      adminId: adminUser.id,
      action: "APPROVED",
      feedback: "Seeded for development",
    },
    create: {
      id: REVIEW_ACTION_ID,
      experienceId: EXPERIENCE_ID,
      adminId: adminUser.id,
      action: "APPROVED",
      feedback: "Seeded for development",
    },
  });

  console.log("Seeded approved Erasmus experience for Prague.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
