import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addRealisticMentors() {
  console.log("Adding realistic mentor data based on university agreements...");

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found. Please create a user first.");
    return;
  }

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
        universityInCyprus: "University of Nicosia",
        studyProgram: "Business Administration",
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

  console.log("Finished adding realistic mentor data.");
}

addRealisticMentors()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
