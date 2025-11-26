import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

// Test student profiles with comprehensive data
const testStudents = [
  {
    id: "test-petros-2024",
    firstName: "Petros",
    lastName: "Alexandrou",
    email: "petros.test@example.com",
    basicInfo: {
      homeUniversity: "University of Cyprus",
      homeDepartment: "Computer Science",
      hostUniversity: "Sorbonne University",
      hostCity: "Paris",
      hostCountry: "France",
      hostDepartment: "Computer Science",
      levelOfStudy: "Bachelor",
      currentYear: "3rd Year",
      exchangePeriod: "Semester",
      exchangeStartDate: "2024-09-01",
      exchangeEndDate: "2025-01-31",
      languageOfInstruction: "English",
      motivationForExchange: "To experience French academic culture and improve my programming skills",
      academicGoals: "Learn advanced algorithms and gain international perspective"
    },
    livingExpenses: {
      monthlyRent: 650,
      monthlyFood: 350,
      monthlyTransport: 75,
      monthlyEntertainment: 200,
      monthlyUtilities: 100,
      monthlyOther: 125,
      totalMonthlyBudget: 1500,
      monthlyIncomeAmount: 1200,
      spendingHabit: "Moderate - I plan my expenses but enjoy occasional treats",
      budgetTips: "Shop at Monoprix for groceries, use student discounts everywhere",
      cheapGroceryPlaces: "Franprix, Monoprix, local markets on weekends",
      cheapEatingPlaces: "University restaurant (CROUS), Le Procope for students",
      transportationTips: "Get Navigo student pass, walk when possible - Paris is very walkable",
      socialLifeTips: "Join international student groups, attend free museum days",
      travelTips: "Use BlaBlaCar for weekend trips, book train tickets in advance",
      overallBudgetAdvice: "€1200-1500/month is realistic for comfortable living in Paris"
    },
    accommodation: {
      accommodationType: "Student Residence",
      accommodationAddress: "Cité Universitaire, Boulevard Jourdan",
      neighborhood: "14th Arrondissement",
      monthlyRent: 650,
      billsIncluded: "Partially",
      avgUtilityCost: 50,
      accommodationRating: 4,
      easyToFind: "Moderate",
      wouldRecommend: "Yes",
      roommates: "International students from various countries",
      additionalNotes: "Great location with RER access, very international atmosphere",
      amenities: ["Internet", "Laundry", "Common Kitchen", "Study Rooms"],
      findingChallenges: "Application process is competitive, apply early",
      bookingLink: "https://www.ciup.fr/",
      roomSize: "12 sqm private room",
      roomFurnished: "Fully Furnished",
      kitchenAccess: "Shared",
      internetIncluded: "Yes",
      laundryAccess: "Shared",
      parkingAvailable: "No",
      nearbyAmenities: ["Metro Station", "Supermarket", "University", "Park"],
      transportLinks: "RER B direct to university, Metro line 6 nearby"
    },
    courseMatching: {
      homeUniversity: "University of Cyprus",
      homeDepartment: "Computer Science",
      hostUniversity: "Sorbonne University",
      hostDepartment: "Computer Science",
      levelOfStudy: "Bachelor",
      hostCourseCount: 5,
      homeCourseCount: 5,
      courseMatchingDifficult: "Moderate",
      courseMatchingChallenges: "Different grading system, more theoretical approach than expected",
      timeSpentOnMatching: "3-4 weeks",
      creditsTransferredSuccessfully: 30,
      totalCreditsAttempted: 30,
      recommendCourses: "Yes",
      recommendationReason: "Excellent professors and very theoretical depth",
      overallAcademicExperience: 4,
      biggestCourseChallenge: "Adapting to French academic writing style and theoretical focus",
      academicAdviceForFuture: "Start course matching early, prepare for more theory than practical work",
      teachingQuality: 4,
      languageOfInstruction: "English",
      classSize: "Medium (20-50)",
      studentSupportServices: 3,
      courseSelectionTips: "Choose courses that complement your home curriculum, don't just pick easy ones",
      academicPreparationAdvice: "Review French academic expectations, improve technical writing skills",
      bestCoursesRecommendation: "Advanced Algorithms with Prof. Martin - excellent and challenging",
      coursesToAvoid: "Avoid courses that require perfect French if you're not fluent",
      hostCourses: [
        {
          name: "Advanced Algorithms",
          code: "CS301",
          ects: 6,
          difficulty: "Difficult",
          examTypes: ["Written Exam", "Project"],
          teachingStyle: "Theoretical with practical applications",
          workload: "Heavy",
          recommendation: "Highly recommended - excellent professor",
          type: "Core"
        },
        {
          name: "Database Systems",
          code: "CS205",
          ects: 6,
          difficulty: "Moderate",
          examTypes: ["Project", "Oral Exam"],
          teachingStyle: "Mixed theory and practice",
          workload: "Moderate",
          recommendation: "Good course but similar to home university",
          type: "Core"
        }
      ],
      equivalentCourses: [
        {
          hostCourseName: "Advanced Algorithms",
          homeCourseName: "Algorithms and Data Structures II",
          hostCourseCode: "CS301",
          homeCourseCode: "CS302",
          ects: 6,
          matchQuality: "Good",
          approvalDifficulty: "Easy",
          notes: "More theoretical than home course but good match"
        }
      ]
    },
    experience: {
      personalExperience: "My exchange in Paris was transformative. Living in Cité Universitaire gave me an incredible international experience. The academic environment at Sorbonne was more theoretical than I expected, which challenged me in new ways. French students were initially reserved but became great friends once I made an effort to engage. The city's rich history and culture provided endless learning opportunities outside the classroom.",
      adviceForFutureStudents: "Embrace the cultural differences and don't be afraid to make mistakes with the language. Join international student organizations early - they're your gateway to both local and international friendships. Budget wisely but don't miss out on cultural experiences.",
      favoriteMemory: "Late-night discussions with international friends about our different academic systems and cultures",
      biggestChallenge: "Navigating the French administrative system and academic expectations",
      unexpectedDiscovery: "How much I enjoyed the theoretical approach to computer science",
      academicRating: 4,
      socialLifeRating: 5,
      culturalImmersionRating: 5,
      costOfLivingRating: 3,
      accommodationRating: 4,
      overallRating: 5,
      socialTips: "Join ESN Paris, attend international student events, be open to French social customs",
      culturalTips: "Visit museums on free days, attend lectures at Sorbonne open to public, explore different neighborhoods",
      travelTips: "Use Eurail pass for weekend trips, visit châteaux around Paris, explore Loire Valley",
      academicTips: "Participate in study groups, ask professors for clarification, adapt to essay-writing style",
      practicalTips: "Get CAF housing assistance, open French bank account, learn metro system well",
      languagesLearned: "Improved French significantly, learned technical CS vocabulary in French",
      skillsDeveloped: "Theoretical analysis, academic writing, cross-cultural communication",
      careerImpact: "Considering pursuing a Master's in France, gained international perspective on CS",
      personalGrowth: "Became more independent and culturally aware, improved confidence",
      recommendExchange: "yes",
      recommendationReason: "Life-changing experience that broadened my academic and personal horizons",
      wantToHelp: "yes",
      helpTopics: ["Academic Support", "Cultural Adaptation", "Making Friends & Social Life", "Practical Daily Life"],
      publicProfile: "yes",
      contactMethod: "email",
      email: "petros.test@example.com",
      nickname: "Petros"
    }
  },
  {
    id: "test-maria-2024",
    firstName: "Maria",
    lastName: "Georgiou",
    email: "maria.test@example.com",
    basicInfo: {
      homeUniversity: "University of Cyprus",
      homeDepartment: "Business Administration",
      hostUniversity: "ESADE Business School",
      hostCity: "Barcelona",
      hostCountry: "Spain",
      hostDepartment: "International Business",
      levelOfStudy: "Master",
      currentYear: "1st Year",
      exchangePeriod: "Semester",
      exchangeStartDate: "2024-02-01",
      exchangeEndDate: "2024-06-30",
      languageOfInstruction: "English",
      motivationForExchange: "To gain international business perspective and learn Spanish",
      academicGoals: "Focus on international marketing and European business practices"
    },
    livingExpenses: {
      monthlyRent: 800,
      monthlyFood: 300,
      monthlyTransport: 50,
      monthlyEntertainment: 250,
      monthlyUtilities: 80,
      monthlyOther: 120,
      totalMonthlyBudget: 1600,
      monthlyIncomeAmount: 1400,
      spendingHabit: "I enjoy good food and cultural activities, but budget carefully",
      budgetTips: "Cook at home, use student discounts, share apartment costs",
      cheapGroceryPlaces: "Mercadona, Lidl, local markets in Gràcia",
      cheapEatingPlaces: "Menu del día restaurants, university cafeteria, Boquería market",
      transportationTips: "Get T-jove transport card, bike-sharing is great for short distances",
      socialLifeTips: "Join intercambio language exchanges, attend free concerts and festivals",
      travelTips: "Use Vueling for cheap flights, train to other Spanish cities, weekend beach trips",
      overallBudgetAdvice: "€1400-1700/month needed, Barcelona can be expensive but offers great value"
    },
    accommodation: {
      accommodationType: "Shared Apartment",
      accommodationAddress: "Carrer de Verdi, Gràcia",
      neighborhood: "Gràcia",
      monthlyRent: 800,
      billsIncluded: "No",
      avgUtilityCost: 80,
      accommodationRating: 5,
      easyToFind: "Easy",
      wouldRecommend: "Yes",
      roommates: "Two Spanish students and one German exchange student",
      additionalNotes: "Perfect location in trendy Gràcia neighborhood, close to metro and university",
      amenities: ["Balcony", "Air Conditioning", "WiFi", "Washing Machine"],
      findingChallenges: "None - found through ESADE housing group",
      roomSize: "15 sqm private room",
      roomFurnished: "Fully Furnished",
      kitchenAccess: "Shared",
      internetIncluded: "Yes",
      laundryAccess: "In-unit",
      parkingAvailable: "No",
      nearbyAmenities: ["Metro Station", "Restaurants", "Bars", "Parks"],
      transportLinks: "Metro L3 and L4, easy access to university and city center"
    },
    courseMatching: {
      homeUniversity: "University of Cyprus",
      homeDepartment: "Business Administration",
      hostUniversity: "ESADE Business School",
      hostDepartment: "International Business",
      levelOfStudy: "Master",
      hostCourseCount: 4,
      homeCourseCount: 4,
      courseMatchingDifficult: "Easy",
      courseMatchingChallenges: "None major - excellent coordination between universities",
      timeSpentOnMatching: "1-2 weeks",
      creditsTransferredSuccessfully: 24,
      totalCreditsAttempted: 24,
      recommendCourses: "Yes",
      recommendationReason: "World-class professors and very practical approach",
      overallAcademicExperience: 5,
      biggestCourseChallenge: "High academic standards and competitive environment",
      academicAdviceForFuture: "Come prepared to work hard - standards are very high but rewarding",
      teachingQuality: 5,
      languageOfInstruction: "English",
      classSize: "Small (<20)",
      studentSupportServices: 5,
      courseSelectionTips: "Choose courses that ESADE is famous for - international marketing, entrepreneurship",
      academicPreparationAdvice: "Read business news regularly, prepare for case study methodology",
      bestCoursesRecommendation: "International Marketing with Prof. Rodriguez - industry connections",
      coursesToAvoid: "None - all courses are high quality",
      hostCourses: [
        {
          name: "International Marketing",
          code: "MKT401",
          ects: 6,
          difficulty: "Moderate",
          examTypes: ["Case Study", "Presentation"],
          teachingStyle: "Interactive with real company cases",
          workload: "Heavy",
          recommendation: "Must-take course at ESADE",
          type: "Core"
        }
      ],
      equivalentCourses: [
        {
          hostCourseName: "International Marketing",
          homeCourseName: "Global Marketing Management",
          hostCourseCode: "MKT401",
          homeCourseCode: "MKT350",
          ects: 6,
          matchQuality: "Perfect",
          approvalDifficulty: "Easy",
          notes: "Perfect match with enhanced practical focus"
        }
      ]
    },
    experience: {
      personalExperience: "Barcelona exceeded all my expectations! ESADE provided world-class business education with professors who had real industry experience. Living in Gràcia gave me authentic Spanish culture while still being international. The city's startup ecosystem was inspiring and I made connections that will last forever. Spanish work-life balance was a revelation compared to Cyprus pace.",
      adviceForFutureStudents: "Learn some Spanish before arriving - even basic level helps tremendously. Take advantage of networking events and company visits. Barcelona's startup scene is amazing for business students.",
      favoriteMemory: "Presenting our international marketing project to actual company executives",
      biggestChallenge: "Adapting to Spanish time schedules and social customs",
      unexpectedDiscovery: "How collaborative and team-oriented Spanish business culture is",
      academicRating: 5,
      socialLifeRating: 5,
      culturalImmersionRating: 4,
      costOfLivingRating: 3,
      accommodationRating: 5,
      overallRating: 5,
      socialTips: "Join ESADE student clubs, attend networking events, explore Barcelona's beach culture",
      culturalTips: "Learn about Catalan culture, attend local festivals, visit museums and galleries",
      travelTips: "Explore Costa Brava, visit Madrid and Valencia, day trips to Girona and Tarragona",
      academicTips: "Participate actively in case discussions, network with professors, attend guest lectures",
      practicalTips: "Get NIE number early, learn metro system, enjoy the food culture",
      languagesLearned: "Conversational Spanish, basic Catalan phrases",
      skillsDeveloped: "International business acumen, presentation skills, networking",
      careerImpact: "Considering job opportunities in Spain, gained valuable international experience",
      personalGrowth: "Became more confident in multicultural environments, improved communication skills",
      recommendExchange: "yes",
      recommendationReason: "Outstanding academic quality combined with amazing cultural experience",
      wantToHelp: "yes",
      helpTopics: ["Academic Support", "Cultural Adaptation", "Making Friends & Social Life", "Practical Daily Life"],
      publicProfile: "yes",
      contactMethod: "email",
      email: "maria.test@example.com",
      nickname: "Maria"
    }
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Starting comprehensive test data generation...");

    for (const student of testStudents) {
      console.log(`Creating test data for ${student.firstName} ${student.lastName}...`);

      // Create or update user
      const user = await prisma.user.upsert({
        where: { id: student.id },
        update: {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
        },
        create: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          role: "USER",
        },
      });

      // Create Basic Info submission
      const basicInfoSubmission = await prisma.form_submissions.create({
        data: {
          userId: user.id,
          type: "BASIC_INFO",
          title: `${student.firstName}'s Exchange to ${student.basicInfo.hostCity}`,
          data: student.basicInfo,
          status: "PUBLISHED",
        },
      });

      // Create Living Expenses submission
      await prisma.form_submissions.create({
        data: {
          userId: user.id,
          type: "LIVING_EXPENSES",
          title: `${student.firstName}'s Living Expenses in ${student.basicInfo.hostCity}`,
          data: {
            ...student.livingExpenses,
            _basicInfoId: basicInfoSubmission.id,
            _linkedSubmission: true,
          },
          status: "PUBLISHED",
        },
      });

      // Create Accommodation submission
      await prisma.form_submissions.create({
        data: {
          userId: user.id,
          type: "ACCOMMODATION",
          title: `${student.firstName}'s Accommodation in ${student.basicInfo.hostCity}`,
          data: {
            ...student.accommodation,
            _basicInfoId: basicInfoSubmission.id,
            _linkedSubmission: true,
          },
          status: "PUBLISHED",
        },
      });

      // Create Course Matching submission
      await prisma.form_submissions.create({
        data: {
          userId: user.id,
          type: "COURSE_MATCHING",
          title: `${student.firstName}'s Course Matching at ${student.basicInfo.hostUniversity}`,
          data: {
            ...student.courseMatching,
            _basicInfoId: basicInfoSubmission.id,
            _linkedSubmission: true,
          },
          status: "PUBLISHED",
        },
      });

      // Create Experience/Story submission
      await prisma.form_submissions.create({
        data: {
          userId: user.id,
          type: "EXPERIENCE",
          title: `${student.firstName}'s Experience in ${student.basicInfo.hostCity}`,
          data: {
            ...student.experience,
            _basicInfoId: basicInfoSubmission.id,
            _linkedSubmission: true,
          },
          status: "PUBLISHED",
        },
      });

      console.log(`✅ Created complete test data for ${student.firstName}`);
    }

    console.log("Test data generation completed successfully!");

    res.status(200).json({
      success: true,
      message: "Comprehensive test data generated successfully",
      studentsCreated: testStudents.length,
      submissionsCreated: testStudents.length * 5, // 5 submissions per student
      testStudents: testStudents.map(s => ({
        name: `${s.firstName} ${s.lastName}`,
        destination: `${s.basicInfo.hostCity}, ${s.basicInfo.hostCountry}`,
        university: s.basicInfo.hostUniversity,
        department: s.basicInfo.hostDepartment
      }))
    });
  } catch (error) {
    console.error("Error generating test data:", error);
    res.status(500).json({
      error: "Failed to generate test data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
