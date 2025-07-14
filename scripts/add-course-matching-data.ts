import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addCourseMatchingData() {
  console.log("🎓 Adding comprehensive course matching test data...");

  try {
    // Get universities for reference
    const universities = await prisma.university.findMany({
      take: 10,
    });

    if (universities.length === 0) {
      console.log(
        "❌ No universities found. Please run migration script first.",
      );
      return;
    }

    // Get or create test users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: "elena.pavlou@student.unic.ac.cy" },
        update: {},
        create: {
          email: "elena.pavlou@student.unic.ac.cy",
          firstName: "Elena",
          lastName: "Pavlou",
          password: "hashedpassword",
          nationality: "Cypriot",
          homeCity: "Limassol",
          homeCountry: "Cyprus",
        },
      }),
      prisma.user.upsert({
        where: { email: "dimitris.christou@student.cut.ac.cy" },
        update: {},
        create: {
          email: "dimitris.christou@student.cut.ac.cy",
          firstName: "Dimitris",
          lastName: "Christou",
          password: "hashedpassword",
          nationality: "Cypriot",
          homeCity: "Nicosia",
          homeCountry: "Cyprus",
        },
      }),
      prisma.user.upsert({
        where: { email: "sofia.antoniou@student.ucy.ac.cy" },
        update: {},
        create: {
          email: "sofia.antoniou@student.ucy.ac.cy",
          firstName: "Sofia",
          lastName: "Antoniou",
          password: "hashedpassword",
          nationality: "Cypriot",
          homeCity: "Paphos",
          homeCountry: "Cyprus",
        },
      }),
    ]);

    // Comprehensive course matching submissions
    const courseMatchingSubmissions = [
      // Berlin - Computer Science
      {
        userId: users[0].id,
        type: "COURSE_MATCHING",
        title: "Computer Science Courses at TU Berlin",
        data: {
          universityId: universities[0].id,
          hostUniversity: "Technical University of Berlin",
          hostCity: "Berlin",
          hostCountry: "Germany",
          firstName: "Elena",
          lastName: "Pavlou",
          nationality: "Cypriot",
          universityInCyprus: "University of Nicosia",
          departmentInCyprus: "Computer Science",
          levelOfStudy: "Bachelor",
          exchangePeriod: "Fall 2024",
          hostCourses: [
            {
              code: "CS101",
              name: "Algorithms and Data Structures",
              credits: 6,
              description:
                "Advanced algorithms, complexity analysis, and data structure implementation",
            },
            {
              code: "CS205",
              name: "Database Systems",
              credits: 6,
              description:
                "Relational databases, SQL, NoSQL, and database design principles",
            },
            {
              code: "CS301",
              name: "Machine Learning Fundamentals",
              credits: 8,
              description:
                "Introduction to ML algorithms, neural networks, and practical applications",
            },
            {
              code: "CS450",
              name: "Software Engineering",
              credits: 6,
              description:
                "Software development lifecycle, agile methodologies, and project management",
            },
          ],
          recognizedCourses: [
            {
              cyprusCode: "CS201",
              cyprusName: "Data Structures and Algorithms",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "CS350",
              cyprusName: "Database Management Systems",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "CS480",
              cyprusName: "Artificial Intelligence",
              equivalentCredits: 8,
              recognitionStatus: "Partial Recognition (6 ECTS)",
            },
            {
              cyprusCode: "CS370",
              cyprusName: "Software Engineering Principles",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
          ],
          overallRating: 5,
          academicsRating: 5,
          wouldRecommend: true,
          topTips: [
            "Course content is very up-to-date with industry standards",
            "Strong emphasis on practical programming assignments",
            "Excellent research opportunities with professors",
            "Good preparation for tech industry careers",
          ],
        },
        status: "PUBLISHED",
      },

      // Barcelona - Business Administration
      {
        userId: users[1].id,
        type: "COURSE_MATCHING",
        title: "International Business at UPC Barcelona",
        data: {
          universityId: universities[1]?.id || universities[0].id,
          hostUniversity: "Universitat Politècnica de Catalunya",
          hostCity: "Barcelona",
          hostCountry: "Spain",
          firstName: "Dimitris",
          lastName: "Christou",
          universityInCyprus: "Cyprus University of Technology",
          departmentInCyprus: "Business Administration",
          levelOfStudy: "Bachelor",
          exchangePeriod: "Spring 2024",
          hostCourses: [
            {
              code: "BUS301",
              name: "International Marketing Strategy",
              credits: 6,
              description:
                "Global marketing strategies, cultural considerations, and market analysis",
            },
            {
              code: "FIN350",
              name: "Corporate Finance and Investment",
              credits: 6,
              description:
                "Financial management, investment decisions, and capital budgeting",
            },
            {
              code: "MGT410",
              name: "Strategic Management",
              credits: 6,
              description:
                "Business strategy, competitive analysis, and organizational planning",
            },
            {
              code: "ECO320",
              name: "International Economics",
              credits: 6,
              description:
                "Global trade, monetary systems, and economic policy analysis",
            },
            {
              code: "MGT350",
              name: "Operations Management",
              credits: 6,
              description:
                "Supply chain management, quality control, and process optimization",
            },
          ],
          recognizedCourses: [
            {
              cyprusCode: "BUS380",
              cyprusName: "Global Marketing Management",
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
            {
              cyprusCode: "ECO301",
              cyprusName: "International Trade and Finance",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "MGT340",
              cyprusName: "Operations and Supply Chain Management",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
          ],
          overallRating: 5,
          academicsRating: 5,
          wouldRecommend: true,
          topTips: [
            "Excellent case study approach with real Spanish companies",
            "Strong international perspective from diverse student body",
            "Great networking opportunities with European businesses",
            "Perfect preparation for global business careers",
          ],
        },
        status: "PUBLISHED",
      },

      // Prague - Engineering
      {
        userId: users[2].id,
        type: "COURSE_MATCHING",
        title: "Mechanical Engineering at Czech Technical University",
        data: {
          universityId: universities[2]?.id || universities[0].id,
          hostUniversity: "Czech Technical University",
          hostCity: "Prague",
          hostCountry: "Czech Republic",
          firstName: "Sofia",
          lastName: "Antoniou",
          universityInCyprus: "University of Cyprus",
          departmentInCyprus: "Mechanical Engineering",
          levelOfStudy: "Master",
          exchangePeriod: "Fall 2023",
          hostCourses: [
            {
              code: "ME501",
              name: "Advanced Thermodynamics",
              credits: 7,
              description:
                "Advanced heat transfer, thermodynamic cycles, and energy systems",
            },
            {
              code: "ME550",
              name: "Computational Fluid Dynamics",
              credits: 6,
              description:
                "Numerical methods for fluid flow simulation and analysis",
            },
            {
              code: "ME420",
              name: "Materials Science and Engineering",
              credits: 6,
              description:
                "Advanced materials, composites, and manufacturing processes",
            },
            {
              code: "ME380",
              name: "Renewable Energy Systems",
              credits: 6,
              description:
                "Solar, wind, and hydroelectric power system design and optimization",
            },
          ],
          recognizedCourses: [
            {
              cyprusCode: "ME501",
              cyprusName: "Advanced Engineering Thermodynamics",
              equivalentCredits: 7,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "ME520",
              cyprusName: "Computational Methods in Engineering",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "ME410",
              cyprusName: "Advanced Materials Engineering",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "ME450",
              cyprusName: "Sustainable Energy Systems",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
          ],
          overallRating: 4,
          academicsRating: 4,
          wouldRecommend: true,
          topTips: [
            "Very hands-on approach with excellent lab facilities",
            "Strong focus on Central European engineering practices",
            "Great value for money with high-quality education",
            "Beautiful city with rich history and culture",
          ],
        },
        status: "PUBLISHED",
      },

      // Vienna - Architecture
      {
        userId: users[0].id,
        type: "COURSE_MATCHING",
        title: "Architecture Studies at TU Vienna",
        data: {
          universityId: universities[3]?.id || universities[0].id,
          hostUniversity: "Vienna University of Technology",
          hostCity: "Vienna",
          hostCountry: "Austria",
          firstName: "Elena",
          lastName: "Pavlou",
          universityInCyprus: "Frederick University",
          departmentInCyprus: "Architecture",
          levelOfStudy: "Bachelor",
          exchangePeriod: "Spring 2024",
          hostCourses: [
            {
              code: "ARC301",
              name: "Sustainable Architecture Design",
              credits: 8,
              description:
                "Green building design, energy efficiency, and sustainable materials",
            },
            {
              code: "ARC250",
              name: "Urban Planning and Development",
              credits: 6,
              description:
                "City planning principles, zoning, and urban development strategies",
            },
            {
              code: "ARC420",
              name: "Digital Architecture and BIM",
              credits: 6,
              description:
                "Building Information Modeling, 3D design, and digital fabrication",
            },
            {
              code: "ARC350",
              name: "History of European Architecture",
              credits: 4,
              description:
                "Architectural movements, styles, and cultural influences in Europe",
            },
          ],
          recognizedCourses: [
            {
              cyprusCode: "ARC380",
              cyprusName: "Sustainable Design Principles",
              equivalentCredits: 8,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "ARC320",
              cyprusName: "Urban Design and Planning",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "ARC450",
              cyprusName: "Digital Design Technologies",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "ARC200",
              cyprusName: "Architectural History",
              equivalentCredits: 4,
              recognitionStatus: "Full Recognition",
            },
          ],
          overallRating: 5,
          academicsRating: 5,
          wouldRecommend: true,
          topTips: [
            "Vienna is a perfect city to study European architecture",
            "Excellent integration of traditional and modern design approaches",
            "Great access to historical buildings and architectural sites",
            "Strong emphasis on sustainability and green building practices",
          ],
        },
        status: "PUBLISHED",
      },

      // Amsterdam - Psychology
      {
        userId: users[1].id,
        type: "COURSE_MATCHING",
        title: "Psychology Courses at University of Amsterdam",
        data: {
          universityId: universities[4]?.id || universities[0].id,
          hostUniversity: "University of Amsterdam",
          hostCity: "Amsterdam",
          hostCountry: "Netherlands",
          firstName: "Dimitris",
          lastName: "Christou",
          universityInCyprus: "University of Cyprus",
          departmentInCyprus: "Psychology",
          levelOfStudy: "Bachelor",
          exchangePeriod: "Fall 2024",
          hostCourses: [
            {
              code: "PSY301",
              name: "Cognitive Psychology",
              credits: 6,
              description:
                "Memory, attention, perception, and cognitive processes",
            },
            {
              code: "PSY250",
              name: "Social Psychology",
              credits: 6,
              description:
                "Group behavior, social influence, and interpersonal relationships",
            },
            {
              code: "PSY410",
              name: "Research Methods in Psychology",
              credits: 6,
              description:
                "Experimental design, statistical analysis, and research ethics",
            },
          ],
          recognizedCourses: [
            {
              cyprusCode: "PSY350",
              cyprusName: "Cognitive Psychology and Neuroscience",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "PSY280",
              cyprusName: "Social Psychology",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
            {
              cyprusCode: "PSY400",
              cyprusName: "Research Methods and Statistics",
              equivalentCredits: 6,
              recognitionStatus: "Full Recognition",
            },
          ],
          overallRating: 4,
          academicsRating: 4,
          wouldRecommend: true,
          topTips: [
            "Very international student body with diverse perspectives",
            "Strong research component with practical applications",
            "Excellent library and research facilities",
          ],
        },
        status: "PUBLISHED",
      },
    ];

    // Create the form submissions
    for (const submission of courseMatchingSubmissions) {
      await prisma.formSubmission.create({
        data: submission,
      });
      console.log(
        `✅ Created course matching for ${submission.data.hostUniversity} - ${submission.data.departmentInCyprus}`,
      );
    }

    console.log(
      `🎉 Successfully created ${courseMatchingSubmissions.length} course matching submissions!`,
    );

    // Display summary
    console.log("\n📊 Course Matching Data Summary:");
    console.log("- Berlin (TU Berlin): Computer Science - 4 courses");
    console.log("- Barcelona (UPC): Business Administration - 5 courses");
    console.log("- Prague (CTU): Mechanical Engineering - 4 courses");
    console.log("- Vienna (TU Vienna): Architecture - 4 courses");
    console.log("- Amsterdam (UvA): Psychology - 3 courses");
    console.log("\n🎯 All submissions include:");
    console.log(
      "- Host university course details (code, name, ECTS, description)",
    );
    console.log("- Cyprus university equivalent courses");
    console.log("- Recognition status for each course");
    console.log("- Student tips and recommendations");
  } catch (error) {
    console.error("❌ Error creating course matching data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addCourseMatchingData();
