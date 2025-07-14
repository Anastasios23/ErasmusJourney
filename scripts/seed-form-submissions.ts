import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createFormSubmissions() {
  console.log("🌱 Creating form submissions...");

  // First, get some universities to reference
  const universities = await prisma.university.findMany({
    take: 5,
  });

  if (universities.length === 0) {
    console.log("❌ No universities found. Please run migration script first.");
    return;
  }

  // Create a test user if doesn't exist
  let testUser = await prisma.user.findFirst({
    where: { email: "maria.constantinou@student.ucy.ac.cy" },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: "maria.constantinou@student.ucy.ac.cy",
        firstName: "Maria",
        lastName: "Constantinou",
        password: "hashedpassword",
        nationality: "Cypriot",
        homeCity: "Nicosia",
        homeCountry: "Cyprus",
      },
    });
  }

  // Create another test user
  let testUser2 = await prisma.user.findFirst({
    where: { email: "andreas.georgiou@student.cut.ac.cy" },
  });

  if (!testUser2) {
    testUser2 = await prisma.user.create({
      data: {
        email: "andreas.georgiou@student.cut.ac.cy",
        firstName: "Andreas",
        lastName: "Georgiou",
        password: "hashedpassword",
        nationality: "Cypriot",
        homeCity: "Limassol",
        homeCountry: "Cyprus",
      },
    });
  }

  // Real form submissions
  const formSubmissions = [
    // Berlin - Technical University of Berlin
    {
      userId: testUser.id,
      type: "EXPERIENCE",
      title: "My Amazing Exchange in Berlin",
      data: {
        universityId: universities[0].id, // This will match the API query
        hostUniversity: "Technical University of Berlin",
        hostCity: "Berlin",
        hostCountry: "Germany",
        firstName: "Maria",
        lastName: "Constantinou",
        nationality: "Cypriot",
        universityInCyprus: "University of Cyprus",
        departmentInCyprus: "Computer Science",
        levelOfStudy: "Bachelor",
        exchangePeriod: "Fall 2023",
        // Ratings
        overallRating: 5,
        accommodationRating: 4,
        socialLifeRating: 5,
        academicsRating: 4,
        costOfLivingRating: 3,
        wouldRecommend: true,
        // Experience
        personalExperience:
          "Berlin was absolutely incredible! The technical education was world-class, and I learned so much about German engineering culture. The city has amazing nightlife, rich history, and great student life. I made friends from all over the world.",
        topTips: [
          "Get a student travel card for public transport discounts",
          "Join international student groups early to make friends",
          "Learn basic German phrases - locals appreciate the effort",
          "Visit museums on Sundays when many are free",
          "Take advantage of the excellent public transport system",
        ],
        challenges:
          "Language barrier initially, finding accommodation was competitive",
        highlights:
          "Working on real engineering projects, traveling around Europe on weekends",
      },
      status: "PUBLISHED",
    },

    // Berlin - Living Expenses
    {
      userId: testUser.id,
      type: "EXPERIENCE",
      title: "Living Costs in Berlin - My Experience",
      data: {
        universityId: universities[0].id,
        hostUniversity: "Technical University of Berlin",
        hostCity: "Berlin",
        hostCountry: "Germany",
        firstName: "Maria",
        lastName: "Constantinou",
        universityInCyprus: "University of Cyprus",
        departmentInCyprus: "Computer Science",
        exchangePeriod: "Fall 2023",
        // Living costs
        monthlyRent: 450,
        monthlyFood: 280,
        monthlyTransport: 85,
        monthlyEntertainment: 150,
        accommodationType: "Student Dormitory",
        // Tips
        topTips: [
          "Look for student dormitories early - they're much cheaper",
          "Shop at discount supermarkets like Aldi and Lidl",
          "Cook at home to save money on food",
          "Use student discounts everywhere possible",
        ],
      },
      status: "PUBLISHED",
    },

    // Barcelona - Course Matching
    {
      userId: testUser2.id,
      type: "COURSE_MATCHING",
      title: "Business Courses at UPC Barcelona",
      data: {
        universityId: universities[1]?.id || universities[0].id,
        hostUniversity: "Universitat Politècnica de Catalunya",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        firstName: "Andreas",
        lastName: "Georgiou",
        universityInCyprus: "Cyprus University of Technology",
        departmentInCyprus: "Business Administration",
        levelOfStudy: "Bachelor",
        exchangePeriod: "Spring 2024",
        // Course information
        hostCourses: [
          {
            code: "BUS301",
            name: "International Marketing",
            credits: 6,
            description:
              "Global marketing strategies and cultural considerations",
          },
          {
            code: "FIN350",
            name: "Corporate Finance",
            credits: 6,
            description: "Financial management and investment decisions",
          },
          {
            code: "MGT410",
            name: "Strategic Management",
            credits: 6,
            description: "Business strategy and competitive advantage",
          },
        ],
        recognizedCourses: [
          {
            cyprusCode: "BUS380",
            cyprusName: "Global Marketing",
            equivalentCredits: 6,
            recognitionStatus: "Full Recognition",
          },
          {
            cyprusCode: "FIN350",
            cyprusName: "Corporate Financial Management",
            equivalentCredits: 6,
            recognitionStatus: "Full Recognition",
          },
          {
            cyprusCode: "BUS450",
            cyprusName: "Strategic Management",
            equivalentCredits: 6,
            recognitionStatus: "Full Recognition",
          },
        ],
        // Ratings
        overallRating: 5,
        academicsRating: 5,
        wouldRecommend: true,
        topTips: [
          "All courses were taught in English and very practical",
          "Professors were very international and experienced",
          "Great networking opportunities with international students",
          "Course credit transfer was smooth and well-organized",
        ],
      },
      status: "PUBLISHED",
    },

    // Barcelona - Accommodation Experience
    {
      userId: testUser2.id,
      type: "ACCOMMODATION",
      title: "Student Housing in Barcelona",
      data: {
        universityId: universities[1]?.id || universities[0].id,
        hostUniversity: "Universitat Politècnica de Catalunya",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        firstName: "Andreas",
        lastName: "Georgiou",
        exchangePeriod: "Spring 2024",
        // Accommodation details
        accommodationType: "Shared Apartment",
        monthlyRent: 520,
        // Experience
        personalExperience:
          "I shared a 3-bedroom apartment with two other international students near the university. The location was perfect - 10 minutes walk to campus and close to the metro. Barcelona's student housing market is competitive but manageable if you start looking early.",
        topTips: [
          "Start looking for housing 2-3 months before arrival",
          "Use university housing services - they're reliable",
          "Consider areas like Gràcia or Sant Martí for better prices",
          "Always visit the place virtually before committing",
          "Budget extra for utilities and internet",
        ],
        // Ratings
        accommodationRating: 4,
        overallRating: 4,
        wouldRecommend: true,
      },
      status: "PUBLISHED",
    },

    // Prague - Full Experience
    {
      userId: testUser.id,
      type: "STORY",
      title: "A Semester in Beautiful Prague",
      data: {
        universityId: universities[2]?.id || universities[0].id,
        hostUniversity: "Charles University",
        hostCity: "Prague",
        hostCountry: "Czech Republic",
        firstName: "Maria",
        lastName: "Constantinou",
        universityInCyprus: "University of Cyprus",
        departmentInCyprus: "Computer Science",
        exchangePeriod: "Fall 2022",
        // Full experience story
        personalExperience:
          "Prague exceeded all my expectations! The city is like a fairy tale with its medieval architecture and cobblestone streets. Charles University has an incredible history and the computer science program was excellent. The cost of living is very affordable compared to other European cities, which meant I could travel and explore more. The Czech people are warm and welcoming, and there's a vibrant international student community.",
        // Ratings
        overallRating: 5,
        accommodationRating: 4,
        socialLifeRating: 5,
        academicsRating: 4,
        costOfLivingRating: 5,
        wouldRecommend: true,
        // Costs
        monthlyRent: 380,
        monthlyFood: 220,
        monthlyTransport: 35,
        monthlyEntertainment: 120,
        accommodationType: "Student Dormitory",
        // Tips
        topTips: [
          "Prague is incredibly affordable - great value for money",
          "Public transport is excellent and very cheap",
          "Learn a few Czech phrases to connect with locals",
          "Explore the beautiful historic city center",
          "Try traditional Czech cuisine and local beer",
          "Take weekend trips to other Central European cities",
        ],
        highlights:
          "Amazing architecture, affordable living, great travel opportunities, friendly people",
        challenges: "Language barrier, cold winters, some bureaucracy",
      },
      status: "PUBLISHED",
    },
  ];

  // Create the form submissions
  for (const submission of formSubmissions) {
    await prisma.formSubmission.create({
      data: submission,
    });
    console.log(
      `✅ Created ${submission.type} submission: ${submission.title}`,
    );
  }

  console.log(
    `🎉 Successfully created ${formSubmissions.length} form submissions!`,
  );
}

async function main() {
  try {
    await createFormSubmissions();
  } catch (error) {
    console.error("❌ Error creating form submissions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
