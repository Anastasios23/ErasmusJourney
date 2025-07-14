import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestUser() {
  // Create a test user if none exists
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        universityInCyprus: "University of Cyprus",
        studyProgram: "Computer Science",
      },
    });
    console.log("Created test user");
  }

  return user;
}

async function addTestMentorshipData() {
  console.log("Adding test mentorship data...");

  const user = await createTestUser();

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
          "I've helped over 15 students prepare for their exchange programs. I love sharing my experiences and helping others navigate the challenges of studying abroad.",
        additionalAdvice:
          "My time in Berlin was life-changing. I learned so much about myself and gained confidence I never knew I had. The German academic system is rigorous but incredibly rewarding. Don't be afraid to ask questions and make mistakes - that's how you learn!",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-day",
        specializations: ["Computer Science", "Engineering"],
        funFact:
          "I learned to make traditional German pretzels and now bake them for my friends in Cyprus!",
        nickname: "Maria Sophia",
        preferredContactTime: "evenings",
        submissionType: "mentorship",

        // Host university experience
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
          "As someone who struggled initially with the Italian academic system, I understand the challenges international students face. I'm passionate about helping others succeed.",
        additionalAdvice:
          "Florence is a magical city for art and culture students. Take advantage of every museum, gallery, and cultural event. The Renaissance history comes alive when you're living there. Also, learn basic Italian - it makes such a difference!",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-week",
        specializations: ["Art History", "Arts & Design", "Languages"],
        funFact:
          "I can now identify most Renaissance artists just by looking at their brushwork techniques!",
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
        personalWebsite: "https://elenarodriguez.blog",
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
          "I've been mentoring students for 2 years now. I especially love helping with budget planning and finding affordable housing in expensive cities like Barcelona.",
        additionalAdvice:
          "Barcelona is incredible but can be overwhelming at first. Start with the basics - find a good neighborhood, learn some Spanish phrases, and don't be afraid to explore beyond the tourist areas. The real Barcelona is in the neighborhoods!",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-day",
        specializations: ["Business", "Psychology", "Social Work"],
        funFact:
          "I became a certified salsa dancer during my exchange and now teach classes in Cyprus!",
        nickname: "Elena Rodriguez",
        preferredContactTime: "flexible",
        submissionType: "mentorship",

        hostUniversity: "Universitat Pompeu Fabra",
        hostCity: "Barcelona",
        hostCountry: "Spain",
        exchangePeriod: "Fall 2022",
      },
    },
    {
      title: "Mentorship Application - Thomas M.",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "thomas.m@example.com",
        linkedinProfile: "https://linkedin.com/in/thomasm",
        languagesSpoken: ["English", "Greek", "French", "German"],
        helpTopics: [
          "University Application",
          "Academic Support",
          "Research Opportunities",
          "Career Guidance",
          "Emergency Situations",
        ],
        availabilityLevel: "moderate",
        mentorshipExperience:
          "I help students with academic planning and research opportunities. Having navigated the French higher education system, I understand the bureaucracy challenges.",
        additionalAdvice:
          "Paris can be intimidating but it's the most rewarding academic experience you'll ever have. The libraries, the lectures, the intellectual discussions - everything pushes you to think differently. Embrace the French way of academic debate!",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-week",
        specializations: ["Law", "Political Science", "Philosophy"],
        funFact:
          "I attended a lecture by a Nobel Prize winner at the Sorbonne - sitting in the same amphitheater where Marie Curie once taught!",
        nickname: "Thomas M.",
        preferredContactTime: "mornings",
        submissionType: "mentorship",

        hostUniversity: "Sorbonne University",
        hostCity: "Paris",
        hostCountry: "France",
        exchangePeriod: "Fall 2023",
      },
    },
    {
      title: "Mentorship Application - Sophia Chen",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "sophia.chen@example.com",
        instagramUsername: "sophia_in_amsterdam",
        languagesSpoken: ["English", "Greek", "Dutch", "Mandarin"],
        helpTopics: [
          "Accommodation Search",
          "Visa Requirements",
          "Cultural Adaptation",
          "Social Activities",
          "Language Learning",
        ],
        availabilityLevel: "high",
        mentorshipExperience:
          "I love helping students with practical matters like housing and visas. I remember how stressful the preparation was, so I try to make it easier for others.",
        additionalAdvice:
          "Amsterdam is perfect for students - bike everywhere, embrace the Dutch directness, and definitely join some student associations. The international community there is amazing and very welcoming.",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-day",
        specializations: ["Medicine", "Psychology", "Sciences"],
        funFact:
          "I learned to ice skate on Amsterdam's frozen canals during an unexpected cold winter!",
        nickname: "Sophia Chen",
        preferredContactTime: "evenings",
        submissionType: "mentorship",

        hostUniversity: "University of Amsterdam",
        hostCity: "Amsterdam",
        hostCountry: "Netherlands",
        exchangePeriod: "Spring 2024",
      },
    },
    {
      title: "Mentorship Application - David K.",
      data: {
        wantToHelp: "yes",
        contactMethod: "email",
        email: "david.k@example.com",
        linkedinProfile: "https://linkedin.com/in/davidk",
        personalWebsite: "https://davidkphotography.com",
        languagesSpoken: ["English", "Greek", "Czech", "German"],
        helpTopics: [
          "Budget Planning",
          "Travel Tips",
          "Cultural Adaptation",
          "Photography",
          "Social Activities",
        ],
        availabilityLevel: "moderate",
        mentorshipExperience:
          "I help students make the most of their exchange experience, especially with travel and cultural exploration. I believe studying abroad is about more than just academics.",
        additionalAdvice:
          "Prague is incredibly affordable and beautiful. Take weekend trips to other Czech cities, learn some basic Czech phrases, and definitely try the local beer culture (responsibly!). The city has so much history to discover.",
        publicProfile: "yes",
        allowPublicContact: "yes",
        responseTime: "within-week",
        specializations: ["Architecture", "Arts & Design", "History"],
        funFact:
          "I documented my entire exchange through photography and now sell prints to raise money for student scholarships!",
        nickname: "David K.",
        preferredContactTime: "weekends",
        submissionType: "mentorship",

        hostUniversity: "Charles University",
        hostCity: "Prague",
        hostCountry: "Czech Republic",
        exchangePeriod: "Fall 2022",
      },
    },
  ];

  for (const mentorData of testMentors) {
    try {
      await prisma.formSubmission.create({
        data: {
          title: mentorData.title,
          type: "MENTORSHIP",
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
