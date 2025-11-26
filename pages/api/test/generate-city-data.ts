import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ message: "Only available in development" });
  }

  try {
    const { city = "Barcelona", country = "Spain", count = 3 } = req.body;

    console.log(`Generating ${count} test submissions for ${city}, ${country}`);

    // Create test users and submissions
    const submissions = [];

    for (let i = 0; i < count; i++) {
      // Create test user
      const user = await prisma.user.create({
        data: {
          email: `test.student.${city.toLowerCase()}.${i}@example.com`,
          firstName: `Student${i + 1}`,
          lastName: `Test`,
          role: "USER",
        },
      });

      console.log(`Created test user: ${user.id}`);

      // Create basic info submission
      const basicInfo = await prisma.form_submissions.create({
        data: {
          userId: user.id,
          type: "BASIC_INFO",
          title: "Basic Information",
          status: "PUBLISHED",
          data: {
            firstName: `Student${i + 1}`,
            lastName: "Test",
            email: user.email,
            hostUniversity: `University of ${city}`,
            hostCity: city,
            hostCountry: country,
            homeDepartment: "Computer Science",
            levelOfStudy: "Bachelor",
            exchangePeriod: "Semester",
            exchangeStartDate: "2024-09-01",
            exchangeEndDate: "2025-01-31",
            languageOfInstruction: "English",
          },
        },
      });

      // Create living expenses submission
      const livingExpenses = await prisma.form_submissions.create({
        data: {
          userId: user.id,
          type: "LIVING_EXPENSES",
          title: "Living Expenses",
          status: "PUBLISHED",
          data: {
            monthlyRent: 450 + (i * 100), // Varying rent: 450, 550, 650
            monthlyFood: 250 + (i * 50),   // Varying food: 250, 300, 350
            monthlyTransport: 50 + (i * 20), // Varying transport: 50, 70, 90
            monthlyEntertainment: 100 + (i * 30), // Varying entertainment: 100, 130, 160
            monthlyUtilities: 80 + (i * 20), // Varying utilities: 80, 100, 120
            monthlyOther: 50,
            totalMonthlyBudget: 980 + (i * 220), // Total will be calculated
            cheapGroceryPlaces: `Mercadona, Lidl, Local market ${i + 1}`,
            cheapEatingPlaces: `University cafeteria, Kebab place on Main St ${i + 1}`,
            transportationTips: `Get a student travel card for ${city}. Bus system is efficient.`,
            socialLifeTips: `Join student groups early. Best bars in ${city} center.`,
            overallBudgetAdvice: `Budget around €${980 + (i * 220)} per month for ${city}. Can be cheaper if you cook.`,
            _basicInfoId: basicInfo.id,
          },
        },
      });

      // Create accommodation submission
      const accommodation = await prisma.form_submissions.create({
        data: {
          userId: user.id,
          type: "ACCOMMODATION",
          title: "Accommodation Experience",
          status: "PUBLISHED",
          data: {
            accommodationType: i === 0 ? "Student Residence" : i === 1 ? "Shared Apartment" : "Private Apartment",
            accommodationAddress: `Test Street ${i + 1}, ${city}`,
            monthlyRent: 450 + (i * 100),
            billsIncluded: i === 0 ? "Yes" : "Partially",
            accommodationRating: 4 + (i * 0.3), // Ratings: 4.0, 4.3, 4.6
            easyToFind: i === 0 ? "Easy" : i === 1 ? "Moderate" : "Difficult",
            wouldRecommend: i < 2 ? "Definitely" : "Probably",
            additionalNotes: `Great location in ${city}. Close to university and city center.`,
            _basicInfoId: basicInfo.id,
          },
        },
      });

      // Create experience story submission
      const experience = await prisma.form_submissions.create({
        data: {
          userId: user.id,
          type: "EXPERIENCE",
          title: "My Erasmus Experience & Story",
          status: "PUBLISHED",
          data: {
            personalExperience: `My time in ${city} was absolutely amazing! The city has such a vibrant student life and the university is excellent. I learned so much about the culture and made friends from all over Europe. The food scene is incredible and there's always something happening. I would definitely recommend ${city} to anyone considering studying abroad.`,
            
            adviceForFutureStudents: `Start learning the local language before you arrive. Join student organizations immediately - they're the best way to make friends. Don't be afraid to explore the city and try new things. ${city} has so much to offer!`,
            
            favoriteMemory: `Late night conversations with my flatmates from different countries, sharing stories and learning about each other's cultures.`,
            
            biggestChallenge: `Language barrier in the first few weeks, but locals are very patient and helpful.`,
            
            unexpectedDiscovery: `The incredible student discounts available everywhere in ${city}. Almost every restaurant, museum, and attraction offers student rates.`,
            
            // Ratings (varying slightly between students)
            academicRating: 4 + (i * 0.2),      // 4.0, 4.2, 4.4
            socialLifeRating: 4.5 + (i * 0.1),   // 4.5, 4.6, 4.7  
            culturalImmersionRating: 4.2 + (i * 0.2), // 4.2, 4.4, 4.6
            costOfLivingRating: 3.5 + (i * 0.3),  // 3.5, 3.8, 4.1
            accommodationRating: 4 + (i * 0.3),   // 4.0, 4.3, 4.6
            overallRating: 4.2 + (i * 0.2),       // 4.2, 4.4, 4.6
            
            // Tips by category
            socialTips: `Join the international student WhatsApp groups. Go to the weekly international nights at local bars. Best social spots: ${city} student district.`,
            
            culturalTips: `Learn basic greetings in the local language. Try traditional food at local markets. Attend cultural festivals - they happen year-round in ${city}.`,
            
            travelTips: `Get a European rail pass for weekend trips. Budget airlines are cheap from ${city}. Must-visit nearby cities from ${city}: Valencia, Madrid, Toulouse.`,
            
            academicTips: `Professors are very approachable. Don't hesitate to ask questions. Group projects are common - great way to meet local students.`,
            
            practicalTips: `Open a local bank account ASAP. Get a student ID for discounts. Use public transport apps for easy navigation around ${city}.`,
            
            // Personal development
            languagesLearned: i === 0 ? "Spanish (intermediate)" : i === 1 ? "Spanish (basic), Catalan (basic)" : "Spanish (advanced)",
            skillsDeveloped: "Independence, adaptability, intercultural communication, problem-solving",
            careerImpact: `This experience opened doors to international opportunities and gave me confidence to work in multicultural environments.`,
            personalGrowth: `I became much more independent and confident. Learning to navigate life in a different culture really broadened my perspective.`,
            
            // Recommendation
            recommendExchange: "yes",
            recommendationReason: `${city} offers the perfect combination of excellent academics, vibrant social life, and cultural richness. It's an ideal place for personal and academic growth.`,
            
            // Contact preferences  
            wantToHelp: i < 2 ? "yes" : "maybe",
            publicProfile: "yes",
            contactMethod: "email",
            email: user.email,
            nickname: `${city}Student${i + 1}`,
            helpTopics: [
              "Accommodation & Housing",
              "Budget & Financial Planning", 
              "Social Life & Making Friends",
              "Academic Support",
              ...(i === 0 ? ["Language Learning"] : []),
              ...(i === 1 ? ["Transportation & Travel"] : []),
              ...(i === 2 ? ["Cultural Adaptation"] : []),
            ],
            
            _basicInfoId: basicInfo.id,
          },
        },
      });

      submissions.push({
        userId: user.id,
        basicInfo: basicInfo.id,
        livingExpenses: livingExpenses.id,
        accommodation: accommodation.id,
        experience: experience.id,
      });

      console.log(`Created complete submission set for user ${user.id}`);
    }

    // Test the aggregation
    const { aggregateCityData } = await import("../../../src/services/cityAggregationService");
    const aggregatedData = await aggregateCityData(city, country);

    res.status(200).json({
      message: `Successfully created ${count} test submissions for ${city}, ${country}`,
      submissions,
      aggregatedData,
      testEndpoint: `/api/destinations/city-aggregated?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
    });
  } catch (error) {
    console.error("Error generating test data:", error);
    res.status(500).json({
      error: "Failed to generate test data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
