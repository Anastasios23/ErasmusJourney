import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateMentorData() {
  console.log("Clearing existing mentorship data...");

  // Remove existing mentorship submissions
  await prisma.formSubmission.deleteMany({
    where: {
      type: "EXPERIENCE",
      data: {
        path: ["submissionType"],
        equals: "mentorship",
      },
    },
  });

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found. Please create a user first.");
    return;
  }

  console.log(
    "Adding updated mentor data based on real university agreements...",
  );

  const realisticMentors = [
    {
      title: "Mentorship Application - Elena Martinez",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "elena.martinez@example.com",
        instagramUsername: "elena_in_barcelona",
        languagesSpoken: ["English", "Greek", "Spanish", "Catalan"],
        helpTopics: [
          "University Application",
          "Accommodation Search",
          "Cultural Adaptation",
          "Academic Support",
        ],
        availabilityLevel: "high",
        mentorshipExperience:
          "I've been mentoring UNIC business students for 2 years, helping them navigate the Spanish academic system.",
        additionalAdvice:
          "Barcelona is an incredible city for business students. The startup ecosystem here is amazing, and I learned so much about international business practices. The city's blend of culture and innovation is perfect for growing professionally.",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-day",
        specializations: ["Business Administration", "International Business"],
        funFact:
          "I started my own consulting business after my exchange experience!",
        nickname: "Elena Martinez",
        preferredContactTime: "flexible",
        submissionType: "mentorship",

        // Cyprus university info
        universityInCyprus: "University of Nicosia",
        studyProgram: "Business Administration",

        // Host university info
        hostUniversity: "ESADE Business School",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        exchangePeriod: "Fall 2023",
      },
    },
    {
      title: "Mentorship Application - Andreas Nicolaou",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "andreas.nicolaou@example.com",
        linkedinProfile: "https://linkedin.com/in/andreasnicolaou",
        languagesSpoken: ["English", "Greek", "German"],
        helpTopics: [
          "Academic Support",
          "Course Selection",
          "Career Guidance",
          "Language Learning",
        ],
        availabilityLevel: "moderate",
        mentorshipExperience:
          "As a CUT engineering graduate, I help students prepare for the rigorous German technical education system.",
        additionalAdvice:
          "Engineering studies in Germany opened my eyes to precision and innovation. The technical education at TUM is world-class, and Munich's tech scene is thriving. It's the perfect place for ambitious engineering students.",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-week",
        specializations: ["Electrical Engineering", "Mechanical Engineering"],
        funFact: "I'm now working for BMW on electric vehicle technology!",
        nickname: "Andreas Nicolaou",
        preferredContactTime: "weekends",
        submissionType: "mentorship",

        universityInCyprus: "Cyprus University of Technology",
        studyProgram: "Electrical Engineering",
        hostUniversity: "Technical University of Munich",
        hostCity: "Munich",
        hostCountry: "Germany",
        exchangePeriod: "Spring 2023",
      },
    },
    {
      title: "Mentorship Application - Sofia Papadopoulos",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "sofia.papadopoulos@example.com",
        instagramUsername: "sofia_in_vienna",
        linkedinProfile: "https://linkedin.com/in/sofiapapadopoulos",
        languagesSpoken: ["English", "Greek", "German"],
        helpTopics: [
          "University Application",
          "Research Opportunities",
          "Cultural Adaptation",
          "Academic Support",
        ],
        availabilityLevel: "high",
        mentorshipExperience:
          "I help UCY psychology students understand the Austrian academic system and research opportunities.",
        additionalAdvice:
          "Studying psychology at the University of Vienna was transformative. The city's rich history in psychology, from Freud to modern research, provides an unparalleled learning environment. Vienna combines academic excellence with quality of life.",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-day",
        specializations: ["Psychology", "Social Sciences"],
        funFact:
          "I conducted research at the same institute where Freud once worked!",
        nickname: "Sofia Papadopoulos",
        preferredContactTime: "evenings",
        submissionType: "mentorship",

        universityInCyprus: "University of Cyprus",
        studyProgram: "Psychology",
        hostUniversity: "University of Vienna",
        hostCity: "Vienna",
        hostCountry: "Austria",
        exchangePeriod: "Fall 2022",
      },
    },
    {
      title: "Mentorship Application - Dimitris Constantinou",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "dimitris.constantinou@example.com",
        linkedinProfile: "https://linkedin.com/in/dimitrisconstantinou",
        languagesSpoken: ["English", "Greek", "Swedish"],
        helpTopics: [
          "Academic Support",
          "Course Selection",
          "Career Guidance",
          "Tech Industry",
        ],
        availabilityLevel: "moderate",
        mentorshipExperience:
          "I guide Frederick University CS students through the Nordic tech education system and startup opportunities.",
        additionalAdvice:
          "Studying computer science at KTH Stockholm was incredible. Sweden's tech innovation and startup culture is world-leading. The work-life balance and approach to technology for social good really shaped my perspective.",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-week",
        specializations: ["Computer Science", "Information Technology"],
        funFact:
          "I learned Swedish and now work remotely for a Stockholm-based AI startup!",
        nickname: "Dimitris Constantinou",
        preferredContactTime: "mornings",
        submissionType: "mentorship",

        universityInCyprus: "Frederick University",
        studyProgram: "Computer Science",
        hostUniversity: "KTH Royal Institute of Technology",
        hostCity: "Stockholm",
        hostCountry: "Sweden",
        exchangePeriod: "Spring 2024",
      },
    },
    {
      title: "Mentorship Application - Christina Ioannou",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "christina.ioannou@example.com",
        instagramUsername: "christina_in_milan",
        linkedinProfile: "https://linkedin.com/in/christinaioannou",
        languagesSpoken: ["English", "Greek", "Italian"],
        helpTopics: [
          "University Application",
          "Accommodation Search",
          "Internship Opportunities",
          "Cultural Adaptation",
        ],
        availabilityLevel: "high",
        mentorshipExperience:
          "I help EUC economics students navigate Italian business education and internship opportunities.",
        additionalAdvice:
          "My economics studies at Bocconi University in Milan were exceptional. Italy's blend of traditional business practices and modern innovation provided unique insights. Milan's fashion and finance sectors offer amazing internship opportunities.",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-day",
        specializations: ["Economics", "Business Administration"],
        funFact:
          "I interned at a luxury fashion house and learned about sustainable business practices!",
        nickname: "Christina Ioannou",
        preferredContactTime: "flexible",
        submissionType: "mentorship",

        universityInCyprus: "European University Cyprus",
        studyProgram: "Economics",
        hostUniversity: "Bocconi University",
        hostCity: "Milan",
        hostCountry: "Italy",
        exchangePeriod: "Fall 2023",
      },
    },
  ];

  for (const mentorData of realisticMentors) {
    try {
      await prisma.formSubmission.create({
        data: {
          title: mentorData.title,
          type: "EXPERIENCE",
          status: "PUBLISHED",
          userId: user.id,
          data: mentorData.data,
        },
      });
      console.log(`✓ Added mentor: ${mentorData.data.nickname}`);
    } catch (error) {
      console.error(
        `✗ Error adding mentor ${mentorData.data.nickname}:`,
        error,
      );
    }
  }

  console.log(
    "Finished updating mentor data to align with university agreements.",
  );
}

updateMentorData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
