import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addTestMentorshipData() {
  console.log("Adding test mentorship data...");

  const user = await prisma.user.findFirst();
  if (!user) {
    console.error("No user found.");
    return;
  }

  const testMentors = [
    {
      title: "Mentorship Application - Maria Sophia",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "maria.sophia@example.com",
        instagramUsername: "maria_erasmus",
        linkedinProfile: "https://linkedin.com/in/mariasophia",
        languagesSpoken: ["English", "Greek", "German", "Spanish"],
        helpTopics: [
          "Accommodation Search",
          "University Application",
          "Cultural Adaptation",
          "Budget Planning",
          "Language Learning",
        ],
        availabilityLevel: "high",
        mentorshipExperience:
          "I've helped over 15 students prepare for their exchange programs.",
        additionalAdvice:
          "Berlin was life-changing. The German system is rigorous but rewarding!",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-day",
        specializations: ["Computer Science", "Engineering"],
        funFact: "I learned to make traditional German pretzels!",
        nickname: "Maria Sophia",
        preferredContactTime: "evenings",
        submissionType: "mentorship",
        hostUniversity: "Technische Universität Berlin",
        hostCity: "Berlin",
        hostCountry: "Germany",
        exchangePeriod: "Fall 2023",
      },
    },
    {
      title: "Mentorship Application - Andreas K.",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "andreas.k@example.com",
        facebookLink: "https://facebook.com/andreask",
        linkedinProfile: "https://linkedin.com/in/andreask",
        languagesSpoken: ["English", "Greek", "Italian", "French"],
        helpTopics: [
          "Academic Support",
          "Course Selection",
          "Social Activities",
          "Travel Tips",
          "Career Guidance",
        ],
        availabilityLevel: "moderate",
        mentorshipExperience:
          "I understand the challenges international students face.",
        additionalAdvice:
          "Florence is magical for art students. Learn basic Italian!",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-week",
        specializations: ["Art History", "Arts & Design", "Languages"],
        funFact: "I can identify Renaissance artists by their brushwork!",
        nickname: "Andreas K.",
        preferredContactTime: "weekends",
        submissionType: "mentorship",
        hostUniversity: "University of Florence",
        hostCity: "Florence",
        hostCountry: "Italy",
        exchangePeriod: "Spring 2023",
      },
    },
    {
      title: "Mentorship Application - Elena Rodriguez",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "elena.rodriguez@example.com",
        instagramUsername: "elena_in_barcelona",
        languagesSpoken: ["English", "Greek", "Spanish", "Catalan"],
        helpTopics: [
          "Accommodation Search",
          "Budget Planning",
          "Cultural Adaptation",
          "Language Learning",
          "Social Activities",
          "Travel Tips",
        ],
        availabilityLevel: "high",
        mentorshipExperience:
          "I've been mentoring for 2 years, especially with budget planning.",
        additionalAdvice:
          "Barcelona can be overwhelming. Start with basics and explore!",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-day",
        specializations: ["Business", "Psychology", "Social Work"],
        funFact: "I became a certified salsa dancer during my exchange!",
        nickname: "Elena Rodriguez",
        preferredContactTime: "flexible",
        submissionType: "mentorship",
        hostUniversity: "Universitat Pompeu Fabra",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        exchangePeriod: "Fall 2022",
      },
    },
  ];

  for (const mentorData of testMentors) {
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

  console.log("Finished adding test mentorship data.");
}

addTestMentorshipData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
