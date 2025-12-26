/**
 * Seed Script for ErasmusExperience + AccommodationReview
 *
 * This script populates the unified ErasmusExperience model with complete data
 * and creates linked AccommodationReview records for the student-accommodations page.
 *
 * Run with: npx tsx scripts/seed-erasmus-experiences.ts
 */

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// ============================================================================
// SAMPLE EXPERIENCES DATA
// ============================================================================

const SAMPLE_EXPERIENCES = [
  {
    city: "Barcelona",
    country: "Spain",
    semester: "2024-SPRING",
    basicInfo: {
      hostCity: "Barcelona",
      hostCountry: "Spain",
      hostUniversity: "University of Barcelona",
      homeUniversity: "University of Cyprus",
      department: "Computer Science",
      exchangeProgram: "Erasmus+",
      startDate: "2024-02-01",
      endDate: "2024-06-30",
      title: "Amazing semester in Barcelona",
    },
    courses: {
      hostCourses: [
        {
          name: "Artificial Intelligence",
          code: "CS401",
          ects: 6,
          difficulty: "Moderate",
          recommendation: "Highly Recommended",
        },
        {
          name: "Web Development",
          code: "CS302",
          ects: 6,
          difficulty: "Easy",
          recommendation: "Recommended",
        },
        {
          name: "Data Science",
          code: "CS403",
          ects: 6,
          difficulty: "Hard",
          recommendation: "Recommended",
        },
        {
          name: "Spanish Language B1",
          code: "LANG101",
          ects: 3,
          difficulty: "Moderate",
          recommendation: "Highly Recommended",
        },
      ],
      equivalentCourses: [
        {
          hostCourseName: "Artificial Intelligence",
          homeCourseName: "AI & Machine Learning",
          ects: 6,
          matchQuality: "Excellent",
        },
        {
          hostCourseName: "Web Development",
          homeCourseName: "Internet Technologies",
          ects: 6,
          matchQuality: "Good",
        },
      ],
      courseMatchingDifficulty: "Moderate",
      totalCreditsAttempted: 21,
      creditsTransferredSuccessfully: 21,
      overallAcademicExperience: 4,
      teachingQuality: 4,
      academicAdviceForFuture:
        "Start course matching early and contact the host coordinator",
    },
    accommodation: {
      type: "SHARED_FLAT",
      name: "Eixample Shared Apartment",
      neighborhood: "Eixample",
      address: "Carrer de Mallorca 250",
      monthlyRent: 550,
      currency: "EUR",
      rating: 4,
      cleanliness: 4,
      location: 5,
      socialVibe: 5,
      comment:
        "Great location near the university, lots of bars and restaurants nearby. Roommates were international students.",
      foundThrough: "Idealista",
      tips: "Book early! The housing market is competitive. Eixample and Gracia are great for students.",
    },
    livingExpenses: {
      monthlyBudget: 1200,
      breakdown: {
        rent: 550,
        groceries: 200,
        transport: 50,
        eatingOut: 150,
        entertainment: 150,
        other: 100,
      },
      currency: "EUR",
      tips: "Get a T-Jove transport card for unlimited metro. Markets like Boqueria are great but touristy - try local ones.",
    },
    experience: {
      overallRating: 5,
      wouldRecommend: true,
      highlights: [
        "Beach lifestyle",
        "Vibrant nightlife",
        "Great food",
        "Architecture",
      ],
      challenges: ["Housing search was stressful", "Spanish bureaucracy"],
      advice:
        "Learn some Spanish before going - locals appreciate it. Join the ESN events to meet people.",
      overallExperience:
        "Barcelona exceeded all my expectations. The city offers the perfect blend of academics, culture, beach, and nightlife.",
    },
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    semester: "2024-FALL",
    basicInfo: {
      hostCity: "Amsterdam",
      hostCountry: "Netherlands",
      hostUniversity: "University of Amsterdam",
      homeUniversity: "Cyprus University of Technology",
      department: "Business Administration",
      exchangeProgram: "Erasmus+",
      startDate: "2024-09-01",
      endDate: "2025-01-31",
      title: "Unforgettable experience in Amsterdam",
    },
    courses: {
      hostCourses: [
        {
          name: "International Marketing",
          code: "BA301",
          ects: 6,
          difficulty: "Moderate",
          recommendation: "Highly Recommended",
        },
        {
          name: "Business Analytics",
          code: "BA402",
          ects: 6,
          difficulty: "Hard",
          recommendation: "Recommended",
        },
        {
          name: "Entrepreneurship",
          code: "BA305",
          ects: 6,
          difficulty: "Easy",
          recommendation: "Highly Recommended",
        },
        {
          name: "Dutch Language A1",
          code: "LANG001",
          ects: 3,
          difficulty: "Easy",
          recommendation: "Recommended",
        },
      ],
      equivalentCourses: [
        {
          hostCourseName: "International Marketing",
          homeCourseName: "Global Marketing",
          ects: 6,
          matchQuality: "Excellent",
        },
        {
          hostCourseName: "Business Analytics",
          homeCourseName: "Business Intelligence",
          ects: 6,
          matchQuality: "Good",
        },
      ],
      courseMatchingDifficulty: "Easy",
      totalCreditsAttempted: 21,
      creditsTransferredSuccessfully: 21,
      overallAcademicExperience: 5,
      teachingQuality: 5,
      academicAdviceForFuture: "UvA has excellent online resources. Use them!",
    },
    accommodation: {
      type: "STUDIO",
      name: "Student Studio De Pijp",
      neighborhood: "De Pijp",
      address: "Albert Cuypstraat 45",
      monthlyRent: 850,
      currency: "EUR",
      rating: 5,
      cleanliness: 5,
      location: 5,
      socialVibe: 4,
      comment:
        "Expensive but worth it. Private studio near the Albert Cuyp market. Very convenient.",
      foundThrough: "DUWO Student Housing",
      tips: "Apply for DUWO housing as soon as you get accepted. Amsterdam housing is brutal.",
    },
    livingExpenses: {
      monthlyBudget: 1500,
      breakdown: {
        rent: 850,
        groceries: 250,
        transport: 50,
        eatingOut: 150,
        entertainment: 150,
        other: 50,
      },
      currency: "EUR",
      tips: "Get an OV-chipkaart for transport. Albert Heijn has good student discounts. Cook at home to save money.",
    },
    experience: {
      overallRating: 5,
      wouldRecommend: true,
      highlights: [
        "Biking culture",
        "International environment",
        "Great universities",
        "Museums",
      ],
      challenges: ["Very expensive", "Weather can be gloomy"],
      advice:
        "Buy a good rain jacket and embrace the cycling culture. The city is very international and English-friendly.",
      overallExperience:
        "Amsterdam is a fantastic city for students. The university environment is world-class.",
    },
  },
  {
    city: "Prague",
    country: "Czech Republic",
    semester: "2023-FALL",
    basicInfo: {
      hostCity: "Prague",
      hostCountry: "Czech Republic",
      hostUniversity: "Charles University",
      homeUniversity: "University of Nicosia",
      department: "History",
      exchangeProgram: "Erasmus+",
      startDate: "2023-09-15",
      endDate: "2024-02-15",
      title: "Medieval charm meets student life",
    },
    courses: {
      hostCourses: [
        {
          name: "Central European History",
          code: "HIS301",
          ects: 6,
          difficulty: "Moderate",
          recommendation: "Highly Recommended",
        },
        {
          name: "Art History of Prague",
          code: "ART201",
          ects: 5,
          difficulty: "Easy",
          recommendation: "Highly Recommended",
        },
        {
          name: "Czech Language A1",
          code: "CZE101",
          ects: 3,
          difficulty: "Moderate",
          recommendation: "Recommended",
        },
        {
          name: "Philosophy of History",
          code: "PHI301",
          ects: 6,
          difficulty: "Hard",
          recommendation: "Recommended",
        },
      ],
      equivalentCourses: [
        {
          hostCourseName: "Central European History",
          homeCourseName: "Modern European History",
          ects: 6,
          matchQuality: "Good",
        },
        {
          hostCourseName: "Art History of Prague",
          homeCourseName: "Art History Elective",
          ects: 5,
          matchQuality: "Excellent",
        },
      ],
      courseMatchingDifficulty: "Easy",
      totalCreditsAttempted: 20,
      creditsTransferredSuccessfully: 20,
      overallAcademicExperience: 4,
      teachingQuality: 4,
      academicAdviceForFuture:
        "Take advantage of the walking tours organized by the history department.",
    },
    accommodation: {
      type: "DORM",
      name: "Kajetanka Dormitory",
      neighborhood: "Břevnov",
      address: "Na Kajetánce 14",
      monthlyRent: 280,
      currency: "EUR",
      rating: 4,
      cleanliness: 3,
      location: 4,
      socialVibe: 5,
      comment:
        "Basic but cheap. Great social atmosphere with many international students. Shared kitchen and bathroom.",
      foundThrough: "Charles University Housing",
      tips: "Dorms are the cheapest option and great for meeting people. Just bring your own cookware.",
    },
    livingExpenses: {
      monthlyBudget: 700,
      breakdown: {
        rent: 280,
        groceries: 150,
        transport: 30,
        eatingOut: 100,
        entertainment: 100,
        other: 40,
      },
      currency: "EUR",
      tips: "Prague is very affordable. Student canteens (menza) offer meals for 2-3€. Beer is cheaper than water!",
    },
    experience: {
      overallRating: 5,
      wouldRecommend: true,
      highlights: [
        "Beautiful architecture",
        "Affordable",
        "Central location in Europe",
        "Nightlife",
      ],
      challenges: ["Czech language is difficult", "Bureaucracy can be slow"],
      advice:
        "Take weekend trips to nearby cities like Vienna, Berlin, and Krakow. Very cheap from Prague.",
      overallExperience:
        "Prague is a hidden gem for Erasmus. Incredibly beautiful, super affordable, and has an amazing student scene.",
    },
  },
  {
    city: "Berlin",
    country: "Germany",
    semester: "2024-FALL",
    basicInfo: {
      hostCity: "Berlin",
      hostCountry: "Germany",
      hostUniversity: "Technical University of Berlin",
      homeUniversity: "Frederick University",
      department: "Electrical Engineering",
      exchangeProgram: "Erasmus+",
      startDate: "2024-10-01",
      endDate: "2025-03-31",
      title: "Engineering excellence at TU Berlin",
    },
    courses: {
      hostCourses: [
        {
          name: "Power Electronics",
          code: "EE501",
          ects: 6,
          difficulty: "Hard",
          recommendation: "Highly Recommended",
        },
        {
          name: "Renewable Energy Systems",
          code: "EE402",
          ects: 6,
          difficulty: "Moderate",
          recommendation: "Highly Recommended",
        },
        {
          name: "Control Systems",
          code: "EE401",
          ects: 6,
          difficulty: "Hard",
          recommendation: "Recommended",
        },
        {
          name: "German Technical Communication",
          code: "GER301",
          ects: 3,
          difficulty: "Moderate",
          recommendation: "Recommended",
        },
      ],
      equivalentCourses: [
        {
          hostCourseName: "Power Electronics",
          homeCourseName: "Advanced Power Electronics",
          ects: 6,
          matchQuality: "Excellent",
        },
        {
          hostCourseName: "Renewable Energy Systems",
          homeCourseName: "Sustainable Energy",
          ects: 6,
          matchQuality: "Good",
        },
      ],
      courseMatchingDifficulty: "Hard",
      totalCreditsAttempted: 21,
      creditsTransferredSuccessfully: 18,
      overallAcademicExperience: 4,
      teachingQuality: 5,
      academicAdviceForFuture:
        "TUM courses are challenging. Start studying early and use the excellent library resources.",
    },
    accommodation: {
      type: "DORM",
      name: "Studentenstadt Freimann",
      neighborhood: "Freimann",
      address: "Christoph-Probst-Straße 16",
      monthlyRent: 380,
      currency: "EUR",
      rating: 4,
      cleanliness: 4,
      location: 3,
      socialVibe: 5,
      comment:
        "Largest student village in Germany! Great community, but 20 min from campus by U-Bahn.",
      foundThrough: "Studentenwerk Berlin",
      tips: "Apply to Studentenwerk housing immediately. Private housing in Berlin is extremely expensive.",
    },
    livingExpenses: {
      monthlyBudget: 1100,
      breakdown: {
        rent: 380,
        groceries: 250,
        transport: 80,
        eatingOut: 150,
        entertainment: 180,
        other: 60,
      },
      currency: "EUR",
      tips: "Get the semester ticket. Mensa meals are subsidized. ALDI and LIDL are your friends for groceries.",
    },
    experience: {
      overallRating: 4,
      wouldRecommend: true,
      highlights: [
        "World-class university",
        "Rich history",
        "Vibrant culture",
        "Efficient German system",
      ],
      challenges: [
        "High cost of living",
        "Germans can be reserved",
        "Courses very demanding",
      ],
      advice:
        "Take advantage of Berlin's culture - museums, history, nightlife. But don't underestimate the academic workload!",
      overallExperience:
        "TU Berlin is academically intense but incredibly rewarding. Berlin is expensive but beautiful and well-organized.",
    },
  },
  {
    city: "Copenhagen",
    country: "Denmark",
    semester: "2024-SPRING",
    basicInfo: {
      hostCity: "Copenhagen",
      hostCountry: "Denmark",
      hostUniversity: "University of Copenhagen",
      homeUniversity: "European University Cyprus",
      department: "Environmental Science",
      exchangeProgram: "Erasmus+",
      startDate: "2024-02-01",
      endDate: "2024-06-30",
      title: "Sustainable living in the happiest city",
    },
    courses: {
      hostCourses: [
        {
          name: "Climate Change Science",
          code: "ENV401",
          ects: 7,
          difficulty: "Moderate",
          recommendation: "Highly Recommended",
        },
        {
          name: "Sustainable Urban Design",
          code: "ENV302",
          ects: 7,
          difficulty: "Moderate",
          recommendation: "Highly Recommended",
        },
        {
          name: "Danish Culture & Society",
          code: "CULT101",
          ects: 5,
          difficulty: "Easy",
          recommendation: "Recommended",
        },
        {
          name: "Environmental Policy",
          code: "ENV305",
          ects: 6,
          difficulty: "Moderate",
          recommendation: "Recommended",
        },
      ],
      equivalentCourses: [
        {
          hostCourseName: "Climate Change Science",
          homeCourseName: "Climate Science",
          ects: 7,
          matchQuality: "Excellent",
        },
        {
          hostCourseName: "Sustainable Urban Design",
          homeCourseName: "Urban Sustainability",
          ects: 7,
          matchQuality: "Excellent",
        },
      ],
      courseMatchingDifficulty: "Moderate",
      totalCreditsAttempted: 25,
      creditsTransferredSuccessfully: 25,
      overallAcademicExperience: 5,
      teachingQuality: 5,
      academicAdviceForFuture:
        "Copenhagen is perfect for environmental studies. Many field trips and practical projects.",
    },
    accommodation: {
      type: "SHARED_FLAT",
      name: "Nørrebro Kollektiv",
      neighborhood: "Nørrebro",
      address: "Blågårdsgade 12",
      monthlyRent: 650,
      currency: "EUR",
      rating: 5,
      cleanliness: 5,
      location: 5,
      socialVibe: 5,
      comment:
        "Amazing collective living experience. 6 people sharing a large apartment. Very hygge!",
      foundThrough: "Facebook Groups",
      tips: "Join Copenhagen housing Facebook groups. Nørrebro and Vesterbro are the coolest neighborhoods.",
    },
    livingExpenses: {
      monthlyBudget: 1400,
      breakdown: {
        rent: 650,
        groceries: 300,
        transport: 50,
        eatingOut: 150,
        entertainment: 150,
        other: 100,
      },
      currency: "EUR",
      tips: "Get a bike - everyone cycles! Rema 1000 and Netto are the cheapest supermarkets. Eat at the street food markets.",
    },
    experience: {
      overallRating: 5,
      wouldRecommend: true,
      highlights: [
        "Cycling culture",
        "Work-life balance",
        "Sustainable city",
        "Design and architecture",
      ],
      challenges: [
        "Very expensive",
        "Dark winters",
        "Making Danish friends takes time",
      ],
      advice:
        "Embrace hygge and the Danish lifestyle. Winter is dark but cozy cafes make it bearable.",
      overallExperience:
        "Copenhagen changed my perspective on sustainable living. The quality of life is incredible.",
    },
  },
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("🌱 Starting ErasmusExperience seed...\n");

  // Get existing users created by populate-sample-data.ts
  const existingUsers = await prisma.users.findMany({
    where: {
      email: {
        endsWith: ".ac.cy",
      },
    },
    take: SAMPLE_EXPERIENCES.length,
  });

  if (existingUsers.length === 0) {
    console.log("❌ No users found. Please run populate-sample-data.ts first!");
    return;
  }

  console.log(
    `📚 Found ${existingUsers.length} users to create experiences for\n`,
  );

  // Create ErasmusExperience records
  for (
    let i = 0;
    i < Math.min(existingUsers.length, SAMPLE_EXPERIENCES.length);
    i++
  ) {
    const user = existingUsers[i];
    const exp = SAMPLE_EXPERIENCES[i];

    // Check if experience already exists for this user
    const existing = await prisma.erasmusExperience.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      console.log(`  ✓ Experience exists for ${user.email} (${exp.city})`);
      continue;
    }

    const experienceId = randomUUID();

    // Create the main experience
    await prisma.erasmusExperience.create({
      data: {
        id: experienceId,
        userId: user.id,
        currentStep: 5,
        completedSteps: JSON.stringify([1, 2, 3, 4, 5]),
        isComplete: true,
        basicInfo: exp.basicInfo,
        courses: exp.courses,
        accommodation: exp.accommodation,
        livingExpenses: exp.livingExpenses,
        experience: exp.experience,
        status: "APPROVED",
        isPublic: true,
        semester: exp.semester,
        hostCity: exp.city,
        hostCountry: exp.country,
        adminApproved: true,
        submittedAt: new Date(),
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(
      `  + Created experience: ${exp.city}, ${exp.country} for ${user.email}`,
    );

    // Create AccommodationReview
    await prisma.accommodationReview.create({
      data: {
        id: randomUUID(),
        experienceId,
        name: exp.accommodation.name,
        type: exp.accommodation.type,
        address: exp.accommodation.address,
        neighborhood: exp.accommodation.neighborhood,
        pricePerMonth: exp.accommodation.monthlyRent,
        currency: exp.accommodation.currency,
        rating: exp.accommodation.rating,
        cleanliness: exp.accommodation.cleanliness,
        location: exp.accommodation.location,
        socialVibe: exp.accommodation.socialVibe,
        comment: exp.accommodation.comment,
      },
    });

    console.log(
      `    + Created accommodation review: ${exp.accommodation.name}`,
    );
  }

  console.log("\n✅ ErasmusExperience seed completed!");

  // Summary
  const experienceCount = await prisma.erasmusExperience.count();
  const accommodationCount = await prisma.accommodationReview.count();

  console.log("\n📊 Summary:");
  console.log(`   - ${experienceCount} Erasmus experiences`);
  console.log(`   - ${accommodationCount} accommodation reviews`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
