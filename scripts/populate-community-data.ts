import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Adding more diverse community data...");

  // Get existing users
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log("No users found. Please run populate-sample-data.ts first.");
    return;
  }

  // Create more diverse stories
  const additionalStories = await createAdditionalStories(users);
  console.log(`✅ Created ${additionalStories.length} additional stories`);

  // Create more accommodation experiences
  const additionalAccommodations = await createAdditionalAccommodations(users);
  console.log(`✅ Created ${additionalAccommodations.length} additional accommodations`);

  // Create some basic information forms to show form completion stats
  const basicInfoForms = await createBasicInfoForms(users);
  console.log(`✅ Created ${basicInfoForms.length} basic information forms`);

  console.log("\n🎉 Community data population completed!");
}

async function createAdditionalStories(users: any[]) {
  const additionalStoryData = [
    {
      userId: users[4]?.id || users[0].id,
      type: "STORY",
      title: "Discovering Renaissance Art in Florence",
      status: "PUBLISHED",
      data: {
        firstName: "Marc",
        lastName: "Dubois",
        email: "marc.dubois@unic.ac.cy",
        universityInCyprus: "University of Nicosia",
        studyProgram: "Art History",
        hostUniversity: "University of Florence",
        hostCity: "Florence",
        hostCountry: "Italy",
        exchangePeriod: "Spring 2024",
        storyTitle: "Discovering Renaissance Art in Florence",
        overallDescription: "Florence was like stepping into a living art museum! As an art history student, studying in the birthplace of the Renaissance was absolutely incredible. Every day I walked past masterpieces, studied in libraries filled with original manuscripts, and learned from professors who are world experts in their fields. The city's compact size made it perfect for exploring on foot, and the Italian lifestyle taught me to appreciate the beauty in everyday moments.",
        academicExperience: "The University of Florence's art history department is phenomenal. Having classes inside historic palazzos and museums made learning incredibly immersive. My professor for 'Renaissance Painting' actually discovered several lost works, and we got to see conservation work in progress at the Uffizi.",
        culturalExperience: "Living in Florence means embracing la dolce vita! I learned to appreciate long, leisurely meals, afternoon riposo, and the Italian passion for beauty in all forms. Weekend trips to Siena, Pisa, and Rome enriched my understanding of Italian art and culture even more.",
        challenges: "The Italian bureaucracy was frustrating, and adapting to the more relaxed approach to deadlines took time. Learning Italian was essential for daily life, though most professors spoke excellent English.",
        personalGrowth: "This experience deepened my appreciation for art and history while teaching me to slow down and savor life's pleasures. I became more patient, more observant, and more passionate about preserving cultural heritage.",
        recommendations: "Get a monthly museum pass - you'll want to revisit favorites multiple times! Learn basic Italian before arriving. Take weekend trips to explore Tuscany's hill towns. And definitely take a cooking class - Italian cuisine is an art form too!",
        wouldRecommend: "Absolutely",
        overallRating: 5,
        socialLifeRating: 4,
        academicRating: 5,
        accommodationRating: 3,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&h=400&fit=crop",
            caption: "Morning coffee overlooking the Duomo"
          }
        ],
        tags: ["florence", "italy", "art-history", "renaissance", "culture"],
        funFact: "I discovered a previously uncatalogued fresco in my host family's basement!",
        bestMemory: "Watching the sunrise over Florence from Piazzale Michelangelo while sketching the cityscape."
      }
    },
    {
      userId: users[5]?.id || users[1].id,
      type: "STORY",
      title: "Psychology and Coffeehouse Culture in Vienna",
      status: "PUBLISHED",
      data: {
        firstName: "Isabella",
        lastName: "Schmidt",
        email: "isabella.schmidt@ucy.ac.cy",
        universityInCyprus: "University of Cyprus",
        studyProgram: "Psychology",
        hostUniversity: "University of Vienna",
        hostCity: "Vienna",
        hostCountry: "Austria",
        exchangePeriod: "Fall 2023",
        storyTitle: "Psychology and Coffeehouse Culture in Vienna",
        overallDescription: "Vienna was perfect for a psychology student! Studying in Freud's city while enjoying the sophisticated coffeehouse culture was like living in an intellectual dream. The university's psychology program is world-class, and the city's emphasis on mental health and well-being provided countless learning opportunities outside the classroom.",
        academicExperience: "The University of Vienna's psychology department has incredible resources. We visited Freud's former practice, participated in cutting-edge research, and learned from professors who are shaping modern psychological theory. The interdisciplinary approach was eye-opening.",
        culturalExperience: "Vienna's coffeehouse culture became central to my experience. I spent hours in traditional cafés reading psychology texts, writing papers, and discussing theories with fellow students. The city's intellectual atmosphere is unmatched.",
        challenges: "Austrian formality took adjustment, and the high cost of living required careful budgeting. The long, dark winters affected my mood, but I learned coping strategies that helped both personally and professionally.",
        personalGrowth: "This experience enhanced my analytical thinking and cultural sensitivity - crucial skills for psychology. I became more introspective and learned to appreciate the slower pace of life and deep intellectual conversations.",
        recommendations: "Embrace the coffeehouse culture - it's where real learning happens! Attend psychology conferences and seminars regularly. Learn German to access more research opportunities. Take advantage of Vienna's excellent mental health resources.",
        wouldRecommend: "Absolutely",
        overallRating: 5,
        socialLifeRating: 4,
        academicRating: 5,
        accommodationRating: 4,
        photos: [
          {
            url: "https://images.unsplash.com/photo-1548634403-6d4f3b216529?w=600&h=400&fit=crop",
            caption: "My favorite coffeehouse where I wrote my thesis"
          }
        ],
        tags: ["vienna", "austria", "psychology", "freud", "coffeehouse"],
        funFact: "I wrote my research paper in the same coffeehouse where it's rumored Jung and Freud had their famous disagreements!",
        bestMemory: "Presenting my cross-cultural psychology research at a university symposium to an audience of international scholars."
      }
    }
  ];

  const stories = [];
  for (const story of additionalStoryData) {
    try {
      const created = await prisma.formSubmission.create({ data: story });
      stories.push(created);
    } catch (error) {
      console.log(`Error creating additional story: ${story.title}`);
    }
  }
  
  return stories;
}

async function createAdditionalAccommodations(users: any[]) {
  const additionalAccommodationData = [
    {
      userId: users[3]?.id || users[0].id,
      type: "ACCOMMODATION",
      title: "Host Family Experience in Florence",
      status: "PUBLISHED",
      data: {
        firstName: "Sofia",
        lastName: "Komninos",
        email: "sofia.komninos@euc.ac.cy",
        universityInCyprus: "European University Cyprus",
        hostCity: "Florence",
        hostCountry: "Italy",
        hostUniversity: "University of Florence",
        accommodationType: "Host Family",
        accommodationName: "Famiglia Rossi",
        accommodationAddress: "Via dei Servi, Florence",
        neighborhood: "Historic Center",
        monthlyRent: 580,
        currency: "EUR",
        utilitiesIncluded: true,
        roomType: "Private room with shared family spaces",
        amenities: ["WiFi", "Meals included", "Laundry", "Italian language practice", "Family activities"],
        accommodationRating: 5,
        overallRating: 5,
        pros: [
          "Authentic Italian family experience",
          "Incredible home-cooked meals",
          "Language improvement through daily conversation",
          "Central location near university",
          "Family became like my Italian relatives"
        ],
        cons: [
          "Less independence than other options",
          "Need to respect family schedules",
          "More expensive than student housing",
          "Limited guest policy"
        ],
        tips: [
          "Research families carefully through university programs",
          "Be open to family traditions and schedules",
          "Help with household tasks to show appreciation",
          "Practice Italian beforehand for better integration"
        ],
        transportationAccess: "Perfect - walking distance to university and major attractions",
        safetyRating: 5,
        wouldRecommend: true,
        additionalNotes: "Living with an Italian family transformed my exchange experience. I not only improved my Italian dramatically but also gained deep insights into Italian culture and formed lifelong relationships.",
        photos: [
          {
            url: "https://images.unsplash.com/photo-1567191635154-0b2b10e7a1d3?w=600&h=400&fit=crop",
            caption: "Family dinner on the terrace overlooking Florence"
          }
        ]
      }
    },
    {
      userId: users[4]?.id || users[1].id,
      type: "ACCOMMODATION",
      title: "Modern Student Residence in Vienna",
      status: "PUBLISHED",
      data: {
        firstName: "Marc",
        lastName: "Dubois",
        email: "marc.dubois@unic.ac.cy",
        universityInCyprus: "University of Nicosia",
        hostCity: "Vienna",
        hostCountry: "Austria",
        hostUniversity: "University of Vienna",
        accommodationType: "Student Residence",
        accommodationName: "Student House Mariahilf",
        accommodationAddress: "Mariahilfer Straße, Vienna",
        neighborhood: "Mariahilf",
        monthlyRent: 450,
        currency: "EUR",
        utilitiesIncluded: true,
        roomType: "Studio apartment with kitchenette",
        amenities: ["WiFi", "Gym", "Common areas", "Study rooms", "Bike rental", "Rooftop terrace"],
        accommodationRating: 4,
        overallRating: 4,
        pros: [
          "Modern facilities and excellent maintenance",
          "Great international student community",
          "Central location with excellent transport links",
          "Organized social events and activities",
          "Good value for Vienna standards"
        ],
        cons: [
          "Can feel impersonal compared to shared apartments",
          "Waiting list for preferred room types",
          "Noise from neighboring rooms occasionally",
          "Limited cooking space in studio"
        ],
        tips: [
          "Apply early through ÖH (Austrian Student Union)",
          "Participate in residence social events",
          "Use common areas to meet other students",
          "Take advantage of the bike rental program"
        ],
        transportationAccess: "Excellent - U-Bahn station nearby, trams and buses frequent",
        safetyRating: 5,
        wouldRecommend: true,
        additionalNotes: "Great choice for students who want modern amenities and an international community while studying in Vienna. The residence organizes many cultural activities.",
        photos: [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
            caption: "Modern studio with view of Vienna's architecture"
          }
        ]
      }
    }
  ];

  const accommodations = [];
  for (const accommodation of additionalAccommodationData) {
    try {
      const created = await prisma.formSubmission.create({ data: accommodation });
      accommodations.push(created);
    } catch (error) {
      console.log(`Error creating additional accommodation: ${accommodation.title}`);
    }
  }
  
  return accommodations;
}

async function createBasicInfoForms(users: any[]) {
  const basicInfoData = [
    {
      userId: users[0].id,
      type: "BASIC_INFO",
      title: "Basic Information - Alexandra Petrou",
      status: "SUBMITTED",
      data: {
        firstName: "Alexandra",
        lastName: "Petrou",
        email: "alexandra.petrou@ucy.ac.cy",
        phoneNumber: "+357 99 123456",
        dateOfBirth: "2001-03-15",
        nationality: "Cyprus",
        address: "123 Ledra Street, Nicosia, Cyprus",
        universityInCyprus: "University of Cyprus",
        studyProgram: "Business Administration",
        academicYear: "3rd Year",
        levelOfStudy: "Bachelor",
        gpa: "8.5/10",
        languageSkills: {
          english: "Fluent",
          german: "Intermediate",
          french: "Basic"
        },
        motivationLetter: "I am passionate about international business and want to gain experience in Central European markets...",
        careerGoals: "International business consultant specializing in EU-Mediterranean trade"
      }
    },
    {
      userId: users[1].id,
      type: "BASIC_INFO",
      title: "Basic Information - Emma Rodriguez",
      status: "SUBMITTED",
      data: {
        firstName: "Emma",
        lastName: "Rodriguez",
        email: "emma.rodriguez@cut.ac.cy",
        phoneNumber: "+357 99 234567",
        dateOfBirth: "2000-07-22",
        nationality: "Spain",
        address: "456 Makarios Avenue, Limassol, Cyprus",
        universityInCyprus: "Cyprus University of Technology",
        studyProgram: "Architecture",
        academicYear: "4th Year",
        levelOfStudy: "Bachelor",
        gpa: "9.2/10",
        languageSkills: {
          spanish: "Native",
          english: "Fluent",
          catalan: "Fluent",
          italian: "Intermediate"
        },
        motivationLetter: "Architecture is my passion, and studying in Barcelona will allow me to learn from Gaudí's masterpieces...",
        careerGoals: "Sustainable architecture specialist focusing on Mediterranean urban planning"
      }
    }
  ];

  const forms = [];
  for (const form of basicInfoData) {
    try {
      const created = await prisma.formSubmission.create({ data: form });
      forms.push(created);
    } catch (error) {
      console.log(`Error creating basic info form: ${form.title}`);
    }
  }
  
  return forms;
}

main()
  .catch((e) => {
    console.error("Error in community data creation:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
