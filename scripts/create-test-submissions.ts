import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧪 Creating test form submissions for admin systems...");

  // Create test users first
  const testUsers = await createTestUsers();
  console.log(`✅ Created ${testUsers.length} test users`);

  // 1. Create test DESTINATIONS submissions (Basic Information forms)
  const destinationSubmissions = await createDestinationSubmissions(testUsers);
  console.log(
    `✅ Created ${destinationSubmissions.length} destination submissions`,
  );

  // 2. Create test UNIVERSITY EXCHANGES submissions (Basic Info + Course Matching)
  const universitySubmissions =
    await createUniversityExchangeSubmissions(testUsers);
  console.log(
    `✅ Created ${universitySubmissions.length} university exchange submissions`,
  );

  // 3. Create test ACCOMMODATION submissions
  const accommodationSubmissions =
    await createAccommodationSubmissions(testUsers);
  console.log(
    `✅ Created ${accommodationSubmissions.length} accommodation submissions`,
  );

  console.log("\n🎉 Test submissions created! Ready for admin testing:");
  console.log(
    "📍 Visit /admin/destinations-enhanced to test destination reviews",
  );
  console.log(
    "🏛️ Visit /admin/university-exchanges to test university reviews",
  );
  console.log(
    "🏠 Visit /admin/student-accommodations to test accommodation reviews",
  );
}

async function createTestUsers() {
  const users = [];

  const testUserData = [
    {
      email: "maria.test@ucy.ac.cy",
      firstName: "Maria",
      lastName: "Konstantinou",
      password: "$2a$10$hash",
      role: "USER",
      studentId: "UCY2023001",
      nationality: "Cyprus",
      homeCity: "Limassol",
      homeCountry: "Cyprus",
    },
    {
      email: "andreas.test@cut.ac.cy",
      firstName: "Andreas",
      lastName: "Georgiou",
      password: "$2a$10$hash",
      role: "USER",
      studentId: "CUT2023002",
      nationality: "Cyprus",
      homeCity: "Nicosia",
      homeCountry: "Cyprus",
    },
    {
      email: "sophia.test@euc.ac.cy",
      firstName: "Sophia",
      lastName: "Dimitriou",
      password: "$2a$10$hash",
      role: "USER",
      studentId: "EUC2023003",
      nationality: "Cyprus",
      homeCity: "Paphos",
      homeCountry: "Cyprus",
    },
  ];

  for (const userData of testUserData) {
    try {
      const user = await prisma.user.create({
        data: userData,
      });
      users.push(user);
    } catch (error) {
      // User might already exist, try to find them
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser) {
        users.push(existingUser);
      }
    }
  }

  return users;
}

async function createDestinationSubmissions(users: any[]) {
  const submissions = [];

  const destinationData = [
    {
      user: users[0],
      data: {
        // Basic Information Form Data
        universityInCyprus: "University of Cyprus",
        hostUniversity: "University of Barcelona",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        studyLevel: "BACHELOR",
        fieldOfStudy: "Computer Science",
        studyPeriod: "Fall 2024",
        startDate: "2024-09-15",
        endDate: "2025-01-30",

        // Destination-specific experience
        overallExperience:
          "Amazing experience! Barcelona is a vibrant city with incredible culture and nightlife.",
        culturalHighlights: [
          "Sagrada Familia",
          "Park Güell",
          "Gothic Quarter",
          "Beach culture",
        ],
        challenges: [
          "Language barrier initially",
          "Finding accommodation",
          "Different academic system",
        ],
        recommendations:
          "Learn basic Spanish before going, join student organizations early",
        costOfLiving: {
          accommodation: 400,
          food: 250,
          transport: 50,
          entertainment: 150,
          total: 850,
        },
        weatherClimate: "Mediterranean climate, mild winters, warm summers",
        transportSystem:
          "Excellent metro and bus system, very student-friendly",
        socialLife: "Very active international student community",
      },
    },
    {
      user: users[1],
      data: {
        universityInCyprus: "Cyprus University of Technology",
        hostUniversity: "Technical University of Munich",
        hostCity: "Munich",
        hostCountry: "Germany",
        studyLevel: "MASTER",
        fieldOfStudy: "Mechanical Engineering",
        studyPeriod: "Spring 2024",
        startDate: "2024-02-15",
        endDate: "2024-07-30",

        overallExperience:
          "Excellent academic experience but expensive city. Great for engineering students.",
        culturalHighlights: [
          "Oktoberfest",
          "BMW Museum",
          "Neuschwanstein Castle day trips",
          "Alpine culture",
        ],
        challenges: [
          "High cost of living",
          "Competitive academic environment",
          "Complex bureaucracy",
        ],
        recommendations:
          "Budget carefully, apply for student housing early, join technical student clubs",
        costOfLiving: {
          accommodation: 600,
          food: 300,
          transport: 70,
          entertainment: 200,
          total: 1170,
        },
        weatherClimate:
          "Continental climate, cold winters with snow, pleasant summers",
        transportSystem: "World-class public transport, everything connected",
        socialLife: "Strong technical community, many international students",
      },
    },
    {
      user: users[2],
      data: {
        universityInCyprus: "European University Cyprus",
        hostUniversity: "University of Amsterdam",
        hostCity: "Amsterdam",
        hostCountry: "Netherlands",
        studyLevel: "BACHELOR",
        fieldOfStudy: "Business Administration",
        studyPeriod: "Full Year 2023-2024",
        startDate: "2023-09-01",
        endDate: "2024-06-30",

        overallExperience:
          "Life-changing year! Amsterdam is perfect for international students with incredible diversity.",
        culturalHighlights: [
          "Canal tours",
          "Rijksmuseum",
          "Cycling culture",
          "Multicultural environment",
        ],
        challenges: [
          "Finding housing (very competitive)",
          "Dutch directness",
          "Rainy weather",
        ],
        recommendations:
          "Start housing search 6 months early, get a bike immediately, embrace the international community",
        costOfLiving: {
          accommodation: 550,
          food: 280,
          transport: 40,
          entertainment: 180,
          total: 1050,
        },
        weatherClimate:
          "Maritime climate, mild but rainy, cycling weather most of the year",
        transportSystem: "Bikes everywhere! Also great public transport",
        socialLife: "Incredibly diverse and active international student scene",
      },
    },
  ];

  for (const item of destinationData) {
    const submission = await prisma.formSubmission.create({
      data: {
        userId: item.user.id,
        type: "basic-information",
        title: `Exchange Experience: ${item.data.hostCity}, ${item.data.hostCountry}`,
        data: item.data,
        status: "SUBMITTED",
      },
    });
    submissions.push(submission);
  }

  return submissions;
}

async function createUniversityExchangeSubmissions(users: any[]) {
  const submissions = [];

  const universityData = [
    {
      user: users[0],
      basicData: {
        universityInCyprus: "University of Cyprus",
        hostUniversity: "Sorbonne University",
        hostCity: "Paris",
        hostCountry: "France",
        studyLevel: "MASTER",
        fieldOfStudy: "Literature",
        studyPeriod: "Fall 2024",
      },
      courseData: {
        availableCourses: [
          {
            courseName: "French Literature in the 19th Century",
            courseCode: "FLIT301",
            ects: 6,
            difficultyLevel: "MEDIUM",
            examType: "WRITTEN",
            semester: "FALL",
            language: "French",
            prerequisites: ["Intermediate French"],
            description:
              "Comprehensive study of 19th century French literary movements",
          },
          {
            courseName: "Comparative European Literature",
            courseCode: "COMP401",
            ects: 8,
            difficultyLevel: "HARD",
            examType: "PROJECT",
            semester: "FALL",
            language: "English/French",
            prerequisites: ["Literary Theory"],
            description:
              "Cross-cultural analysis of European literary traditions",
          },
          {
            courseName: "Academic French Writing",
            courseCode: "FREN201",
            ects: 4,
            difficultyLevel: "MEDIUM",
            examType: "MIXED",
            semester: "FALL",
            language: "French",
            prerequisites: [],
            description: "Advanced academic writing skills in French",
          },
        ],
        totalEcts: 18,
        academicYear: "2024-2025",
        language: "French",
        specialRequirements: "B2 level French proficiency required",
        applicationDeadline: "March 15, 2024",
      },
    },
    {
      user: users[1],
      basicData: {
        universityInCyprus: "Cyprus University of Technology",
        hostUniversity: "ETH Zurich",
        hostCity: "Zurich",
        hostCountry: "Switzerland",
        studyLevel: "MASTER",
        fieldOfStudy: "Computer Science",
        studyPeriod: "Spring 2024",
      },
      courseData: {
        availableCourses: [
          {
            courseName: "Advanced Machine Learning",
            courseCode: "CS8803",
            ects: 8,
            difficultyLevel: "VERY_HARD",
            examType: "PROJECT",
            semester: "SPRING",
            language: "English",
            prerequisites: ["Linear Algebra", "Statistics", "Programming"],
            description: "Deep dive into ML algorithms and neural networks",
          },
          {
            courseName: "Distributed Systems",
            courseCode: "CS6210",
            ects: 6,
            difficultyLevel: "HARD",
            examType: "WRITTEN",
            semester: "SPRING",
            language: "English",
            prerequisites: ["Operating Systems", "Computer Networks"],
            description:
              "Design and implementation of distributed computing systems",
          },
          {
            courseName: "Human-Computer Interaction",
            courseCode: "CS6750",
            ects: 6,
            difficultyLevel: "MEDIUM",
            examType: "PROJECT",
            semester: "SPRING",
            language: "English",
            prerequisites: ["Design Principles"],
            description: "User-centered design and usability principles",
          },
        ],
        totalEcts: 20,
        academicYear: "2023-2024",
        language: "English",
        specialRequirements: "Strong programming background in Python/Java",
        applicationDeadline: "October 31, 2023",
      },
    },
  ];

  for (const item of universityData) {
    // Create Basic Information submission
    const basicSubmission = await prisma.formSubmission.create({
      data: {
        userId: item.user.id,
        type: "basic-information",
        title: `University Exchange: ${item.basicData.hostUniversity}`,
        data: item.basicData,
        status: "SUBMITTED",
      },
    });

    // Create Course Matching submission
    const courseSubmission = await prisma.formSubmission.create({
      data: {
        userId: item.user.id,
        type: "course-matching",
        title: `Course Matching: ${item.basicData.hostUniversity}`,
        data: {
          ...item.basicData,
          courseMatching: item.courseData,
        },
        status: "SUBMITTED",
      },
    });

    submissions.push(basicSubmission, courseSubmission);
  }

  return submissions;
}

async function createAccommodationSubmissions(users: any[]) {
  const submissions = [];

  const accommodationData = [
    {
      user: users[0],
      data: {
        // Basic info
        hostCity: "Barcelona",
        hostCountry: "Spain",
        hostUniversity: "University of Barcelona",
        studyPeriod: "Fall 2024",

        // Accommodation details
        housingType: "DORMITORY",
        neighborhood: "Eixample",
        distanceToUniversity: 2.5,
        monthlyRent: 450,
        roomType: "SINGLE",
        privateBathroom: true,
        amenities: [
          "WiFi",
          "Kitchen",
          "Laundry",
          "Study Room",
          "Gym",
          "24/7 Security",
        ],
        furnished: true,
        utilitiesIncluded: true,

        // Contact & application
        landlordContact: "residencia.eixample@ub.edu",
        deposit: 450,
        contractLength: "5 months",

        // Student experience & ratings
        overallRating: 4,
        cleanlinessRating: 4,
        locationRating: 5,
        valueRating: 4,
        noiseLevel: 2,
        safetyRating: 5,
        experienceDescription:
          "Great university dormitory in the heart of Barcelona! The location is perfect - walking distance to the university and metro stations. The building is modern with good facilities. The international community is amazing, made lots of friends from different countries. The only downside is it can get a bit noisy during weekends when people have parties, but overall a fantastic experience.",
        pros: [
          "Perfect location in city center",
          "Modern facilities and clean rooms",
          "Great international community",
          "All utilities included in rent",
          "24/7 security and support staff",
          "Close to metro and university",
        ],
        cons: [
          "Can be noisy on weekends",
          "Limited kitchen space during peak hours",
          "WiFi sometimes slow in evening",
          "No parking available",
        ],
        wouldRecommend: true,
      },
    },
    {
      user: users[1],
      data: {
        hostCity: "Munich",
        hostCountry: "Germany",
        hostUniversity: "Technical University of Munich",
        studyPeriod: "Spring 2024",

        housingType: "SHARED_FLAT",
        neighborhood: "Maxvorstadt",
        distanceToUniversity: 1.8,
        monthlyRent: 650,
        roomType: "SINGLE",
        privateBathroom: false,
        amenities: [
          "WiFi",
          "Kitchen",
          "Washing Machine",
          "Dishwasher",
          "Balcony",
        ],
        furnished: false,
        utilitiesIncluded: false,

        landlordContact: "+49 89 123456789 (Herr Mueller)",
        deposit: 1300,
        contractLength: "6 months",

        overallRating: 3,
        cleanlinessRating: 3,
        locationRating: 5,
        valueRating: 2,
        noiseLevel: 3,
        safetyRating: 4,
        experienceDescription:
          "Shared flat with 3 German students in excellent location near TUM. The area is perfect for students with lots of cafes and libraries nearby. However, the flat is quite expensive and had some cleanliness issues with shared bathroom. My flatmates were friendly but communication was sometimes difficult. The neighborhood is safe and well-connected but Munich rent prices are really high.",
        pros: [
          "Excellent location near university",
          "Good public transport connections",
          "Safe and student-friendly neighborhood",
          "Nice balcony with city view",
          "Friendly German flatmates",
          "Close to student facilities",
        ],
        cons: [
          "Very expensive rent + utilities",
          "Shared bathroom not always clean",
          "Had to buy all furniture",
          "High deposit requirement",
          "Language barrier with flatmates sometimes",
          "Heating costs extra in winter",
        ],
        wouldRecommend: false,
      },
    },
    {
      user: users[2],
      data: {
        hostCity: "Amsterdam",
        hostCountry: "Netherlands",
        hostUniversity: "University of Amsterdam",
        studyPeriod: "Full Year 2023-2024",

        housingType: "APARTMENT",
        neighborhood: "Jordaan",
        distanceToUniversity: 3.2,
        monthlyRent: 580,
        roomType: "STUDIO",
        privateBathroom: true,
        amenities: ["WiFi", "Kitchen", "Bike Storage", "Washing Machine"],
        furnished: true,
        utilitiesIncluded: true,

        landlordContact: "info@jordaan-housing.nl",
        deposit: 1160,
        contractLength: "10 months",

        overallRating: 5,
        cleanlinessRating: 5,
        locationRating: 4,
        valueRating: 4,
        noiseLevel: 1,
        safetyRating: 5,
        experienceDescription:
          "Perfect studio apartment in the charming Jordaan district! The apartment is small but very well-designed and cozy. Everything is included and the landlord is super responsive. The neighborhood has character with canals, cafes, and local markets. It's quieter than city center but still well-connected by bike and tram. Great value for Amsterdam standards and felt like a real local experience rather than just student housing.",
        pros: [
          "Beautiful historic neighborhood",
          "Fully furnished and equipped",
          "Very quiet and peaceful",
          "Responsive and helpful landlord",
          "All utilities included",
          "Bike storage in building",
          "Close to parks and canals",
        ],
        cons: [
          "Small space (typical for Amsterdam)",
          "Need bike to get to university quickly",
          "Few international students in area",
          "Limited storage space",
        ],
        wouldRecommend: true,
      },
    },
  ];

  for (const item of accommodationData) {
    const submission = await prisma.formSubmission.create({
      data: {
        userId: item.user.id,
        type: "accommodation",
        title: `Accommodation Experience: ${item.data.neighborhood}, ${item.data.hostCity}`,
        data: item.data,
        status: "SUBMITTED",
      },
    });
    submissions.push(submission);
  }

  return submissions;
}

main()
  .catch((e) => {
    console.error("❌ Error creating test submissions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
