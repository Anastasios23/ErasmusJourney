// Test form submissions to populate destination averages
// This simulates real student form submissions for testing the averages system

export interface TestFormSubmission {
  id: string;
  userId: string;
  type: string;
  title: string;
  data: {
    // Basic Information
    firstName: string;
    lastName: string;
    email: string;
    nationality: string;
    universityInCyprus: string;
    departmentInCyprus: string;
    levelOfStudy: string;

    // Exchange Information
    exchangePeriod: string;
    hostCountry: string;
    hostUniversity: string;
    hostCity: string;

    // Living Expenses (when type is "living-expenses")
    monthlyRent?: number;
    monthlyFood?: number;
    monthlyTransport?: number;
    monthlyEntertainment?: number;
    accommodationType?: string;

    // Ratings (when type is "experience" or "story")
    overallRating?: number;
    accommodationRating?: number;
    socialLifeRating?: number;
    academicsRating?: number;
    costOfLivingRating?: number;
    wouldRecommend?: boolean;

    // Tips and Experience
    topTips?: string[];
    personalExperience?: string;
    challenges?: string;
    highlights?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const TEST_FORM_SUBMISSIONS: TestFormSubmission[] = [
  // Berlin Submissions
  {
    id: "berlin_001",
    userId: "user_001",
    type: "basic-info",
    title: "Maria's Exchange to Berlin",
    data: {
      firstName: "Maria",
      lastName: "Constantinou",
      email: "maria.c@example.com",
      nationality: "Greek Cypriot",
      universityInCyprus: "University of Cyprus",
      departmentInCyprus: "Computer Science",
      levelOfStudy: "bachelor",
      exchangePeriod: "semester1",
      hostCountry: "Germany",
      hostUniversity: "Technical University of Berlin",
      hostCity: "Berlin",
      monthlyRent: 420,
      monthlyFood: 300,
      monthlyTransport: 80,
      monthlyEntertainment: 150,
      accommodationType: "Student Dormitory",
      overallRating: 4.5,
      accommodationRating: 4.0,
      socialLifeRating: 4.8,
      academicsRating: 4.3,
      costOfLivingRating: 3.8,
      wouldRecommend: true,
      topTips: [
        "Get the semester student transport pass - saves a lot!",
        "Join the international student WhatsApp groups early",
        "Try the university cafeteria - cheap and good quality",
      ],
      personalExperience:
        "Amazing semester with great academic opportunities and vibrant nightlife.",
      challenges: "Finding affordable housing was challenging, apply early!",
      highlights: "Excellent public transport, diverse international community",
    },
    status: "submitted",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "berlin_002",
    userId: "user_002",
    type: "living-expenses",
    title: "David's Berlin Living Costs",
    data: {
      firstName: "David",
      lastName: "Leonidou",
      email: "david.l@example.com",
      nationality: "Greek Cypriot",
      universityInCyprus: "Cyprus University of Technology",
      departmentInCyprus: "Engineering",
      levelOfStudy: "master",
      exchangePeriod: "full_year",
      hostCountry: "Germany",
      hostUniversity: "Technical University of Berlin",
      hostCity: "Berlin",
      monthlyRent: 480,
      monthlyFood: 280,
      monthlyTransport: 90,
      monthlyEntertainment: 120,
      accommodationType: "Shared Apartment",
      overallRating: 4.2,
      accommodationRating: 4.2,
      socialLifeRating: 4.5,
      academicsRating: 4.5,
      costOfLivingRating: 3.7,
      wouldRecommend: true,
      topTips: [
        "Look for WG (shared apartments) on WG-Gesucht website",
        "Get ISIC student card for discounts everywhere",
        "Learn basic German phrases - locals appreciate it",
      ],
    },
    status: "submitted",
    createdAt: "2024-01-20T14:15:00Z",
    updatedAt: "2024-01-20T14:15:00Z",
  },
  {
    id: "berlin_003",
    userId: "user_003",
    type: "accommodation",
    title: "Sophie's Berlin Housing Guide",
    data: {
      firstName: "Sophie",
      lastName: "Karpasiti",
      email: "sophie.k@example.com",
      nationality: "Greek Cypriot",
      universityInCyprus: "University of Nicosia",
      departmentInCyprus: "Business Administration",
      levelOfStudy: "bachelor",
      exchangePeriod: "semester2",
      hostCountry: "Germany",
      hostUniversity: "Technical University of Berlin",
      hostCity: "Berlin",
      monthlyRent: 350,
      monthlyFood: 250,
      monthlyTransport: 85,
      monthlyEntertainment: 180,
      accommodationType: "Student Dormitory",
      overallRating: 4.0,
      accommodationRating: 3.8,
      socialLifeRating: 4.3,
      academicsRating: 4.1,
      costOfLivingRating: 4.0,
      wouldRecommend: true,
      topTips: [
        "Student dorms are affordable but apply 6 months in advance",
        "Mitte and Friedrichshain are great areas for students",
        "Use Lidl and Aldi for grocery shopping to save money",
      ],
    },
    status: "submitted",
    createdAt: "2024-02-01T09:45:00Z",
    updatedAt: "2024-02-01T09:45:00Z",
  },

  // Barcelona Submissions
  {
    id: "barcelona_001",
    userId: "user_004",
    type: "basic-info",
    title: "Andreas's Barcelona Experience",
    data: {
      firstName: "Andreas",
      lastName: "Philippou",
      email: "andreas.p@example.com",
      nationality: "Greek Cypriot",
      universityInCyprus: "University of Cyprus",
      departmentInCyprus: "Architecture",
      levelOfStudy: "bachelor",
      exchangePeriod: "semester1",
      hostCountry: "Spain",
      hostUniversity: "Universitat Politècnica de Catalunya",
      hostCity: "Barcelona",
      monthlyRent: 520,
      monthlyFood: 320,
      monthlyTransport: 50,
      monthlyEntertainment: 200,
      accommodationType: "Shared Apartment",
      overallRating: 4.8,
      accommodationRating: 4.3,
      socialLifeRating: 5.0,
      academicsRating: 4.4,
      costOfLivingRating: 3.5,
      wouldRecommend: true,
      topTips: [
        "Live near metro stations for easy access to university",
        "Join ESN Barcelona for amazing events and trips",
        "Learn basic Spanish - Catalan is bonus but not essential",
        "Take advantage of free museums on Sunday afternoons",
      ],
      personalExperience:
        "Incredible city with perfect weather, amazing food and the best student community!",
      challenges: "Housing market is competitive, start looking early",
      highlights: "Beach access, incredible architecture, vibrant nightlife",
    },
    status: "submitted",
    createdAt: "2024-01-10T16:20:00Z",
    updatedAt: "2024-01-10T16:20:00Z",
  },
  {
    id: "barcelona_002",
    userId: "user_005",
    type: "story",
    title: "Elena's Mediterranean Adventure",
    data: {
      firstName: "Elena",
      lastName: "Georgiou",
      email: "elena.g@example.com",
      nationality: "Greek Cypriot",
      universityInCyprus: "European University Cyprus",
      departmentInCyprus: "Marketing",
      levelOfStudy: "bachelor",
      exchangePeriod: "semester2",
      hostCountry: "Spain",
      hostUniversity: "Universitat Politècnica de Catalunya",
      hostCity: "Barcelona",
      monthlyRent: 500,
      monthlyFood: 300,
      monthlyTransport: 60,
      monthlyEntertainment: 180,
      accommodationType: "Student Residence",
      overallRating: 4.7,
      accommodationRating: 4.1,
      socialLifeRating: 4.9,
      academicsRating: 4.2,
      costOfLivingRating: 3.6,
      wouldRecommend: true,
      topTips: [
        "Try local markets like Boquería for fresh, affordable food",
        "Get a Bicing bike subscription for easy city transport",
        "Explore beyond tourist areas - Gràcia and El Born are amazing",
      ],
    },
    status: "submitted",
    createdAt: "2024-01-25T11:30:00Z",
    updatedAt: "2024-01-25T11:30:00Z",
  },

  // Prague Submissions
  {
    id: "prague_001",
    userId: "user_006",
    type: "basic-info",
    title: "Christos's Prague Experience",
    data: {
      firstName: "Christos",
      lastName: "Ioannou",
      email: "christos.i@example.com",
      nationality: "Greek Cypriot",
      universityInCyprus: "Cyprus University of Technology",
      departmentInCyprus: "Computer Science",
      levelOfStudy: "master",
      exchangePeriod: "full_year",
      hostCountry: "Czech Republic",
      hostUniversity: "Czech Technical University",
      hostCity: "Prague",
      monthlyRent: 380,
      monthlyFood: 220,
      monthlyTransport: 30,
      monthlyEntertainment: 100,
      accommodationType: "Student Dormitory",
      overallRating: 4.4,
      accommodationRating: 4.0,
      socialLifeRating: 4.2,
      academicsRating: 4.3,
      costOfLivingRating: 4.5,
      wouldRecommend: true,
      topTips: [
        "Prague is incredibly affordable - great value for money",
        "Public transport is excellent and very cheap",
        "Try traditional Czech food and local beer",
        "Explore the beautiful historic city center",
        "Learn a few Czech phrases to connect with locals",
      ],
      personalExperience:
        "Perfect balance of quality education, low costs, and beautiful historic setting.",
      challenges: "Language barrier initially, but people are helpful",
      highlights:
        "Stunning architecture, affordable lifestyle, excellent beer culture",
    },
    status: "submitted",
    createdAt: "2024-02-05T13:45:00Z",
    updatedAt: "2024-02-05T13:45:00Z",
  },
  {
    id: "prague_002",
    userId: "user_007",
    type: "living-expenses",
    title: "Anna's Prague Budget Breakdown",
    data: {
      firstName: "Anna",
      lastName: "Charalambous",
      email: "anna.c@example.com",
      nationality: "Greek Cypriot",
      universityInCyprus: "University of Nicosia",
      departmentInCyprus: "Psychology",
      levelOfStudy: "bachelor",
      exchangePeriod: "semester1",
      hostCountry: "Czech Republic",
      hostUniversity: "Charles University",
      hostCity: "Prague",
      monthlyRent: 350,
      monthlyFood: 200,
      monthlyTransport: 35,
      monthlyEntertainment: 120,
      accommodationType: "Shared Apartment",
      overallRating: 4.6,
      accommodationRating: 4.2,
      socialLifeRating: 4.4,
      academicsRating: 4.1,
      costOfLivingRating: 4.3,
      wouldRecommend: true,
      topTips: [
        "Shop at local markets for super fresh and cheap produce",
        "Get a student ISIC card for major discounts",
        "Use public transport - it's clean, efficient and cheap",
      ],
    },
    status: "submitted",
    createdAt: "2024-02-10T08:15:00Z",
    updatedAt: "2024-02-10T08:15:00Z",
  },

  // Amsterdam Submissions
  {
    id: "amsterdam_001",
    userId: "user_008",
    type: "basic-info",
    title: "Nikolas's Amsterdam Journey",
    data: {
      firstName: "Nikolas",
      lastName: "Stavros",
      email: "nikolas.s@example.com",
      nationality: "Greek Cypriot",
      universityInCyprus: "University of Cyprus",
      departmentInCyprus: "Economics",
      levelOfStudy: "master",
      exchangePeriod: "semester2",
      hostCountry: "Netherlands",
      hostUniversity: "University of Amsterdam",
      hostCity: "Amsterdam",
      monthlyRent: 650,
      monthlyFood: 380,
      monthlyTransport: 70,
      monthlyEntertainment: 220,
      accommodationType: "Private Studio",
      overallRating: 4.3,
      accommodationRating: 3.9,
      socialLifeRating: 4.4,
      academicsRating: 4.6,
      costOfLivingRating: 3.2,
      wouldRecommend: true,
      topTips: [
        "Housing is expensive and competitive - start early!",
        "Get a bike - it's the main transport method",
        "Learn to navigate the complex housing websites",
        "Join study associations for networking and events",
      ],
      personalExperience:
        "Expensive but incredible academic opportunities and international atmosphere.",
      challenges: "Very high cost of living, especially housing",
      highlights:
        "World-class university, excellent English proficiency, beautiful canals",
    },
    status: "submitted",
    createdAt: "2024-01-30T15:30:00Z",
    updatedAt: "2024-01-30T15:30:00Z",
  },
];

// Helper function to aggregate test data by city
export function getTestDataByCity(city: string) {
  const citySubmissions = TEST_FORM_SUBMISSIONS.filter(
    (submission) =>
      submission.data.hostCity?.toLowerCase() === city.toLowerCase(),
  );

  const totalSubmissions = citySubmissions.length;

  if (totalSubmissions === 0) {
    return null;
  }

  // Calculate averages
  const livingCosts = citySubmissions.reduce(
    (acc, submission) => {
      if (submission.data.monthlyRent)
        acc.rent.push(submission.data.monthlyRent);
      if (submission.data.monthlyFood)
        acc.food.push(submission.data.monthlyFood);
      if (submission.data.monthlyTransport)
        acc.transport.push(submission.data.monthlyTransport);
      if (submission.data.monthlyEntertainment)
        acc.entertainment.push(submission.data.monthlyEntertainment);
      return acc;
    },
    { rent: [], food: [], transport: [], entertainment: [] } as any,
  );

  const ratings = citySubmissions.reduce(
    (acc, submission) => {
      if (submission.data.overallRating)
        acc.overall.push(submission.data.overallRating);
      if (submission.data.accommodationRating)
        acc.accommodation.push(submission.data.accommodationRating);
      if (submission.data.socialLifeRating)
        acc.socialLife.push(submission.data.socialLifeRating);
      if (submission.data.academicsRating)
        acc.academics.push(submission.data.academicsRating);
      if (submission.data.costOfLivingRating)
        acc.costOfLiving.push(submission.data.costOfLivingRating);
      return acc;
    },
    {
      overall: [],
      accommodation: [],
      socialLife: [],
      academics: [],
      costOfLiving: [],
    } as any,
  );

  const recommendations = citySubmissions.reduce(
    (acc, submission) => {
      if (submission.data.wouldRecommend !== undefined) {
        acc.total++;
        if (submission.data.wouldRecommend) acc.positive++;
      }
      return acc;
    },
    { positive: 0, total: 0 },
  );

  // Calculate averages
  const avgRent =
    livingCosts.rent.length > 0
      ? Math.round(
          livingCosts.rent.reduce((a: number, b: number) => a + b, 0) /
            livingCosts.rent.length,
        )
      : null;
  const avgFood =
    livingCosts.food.length > 0
      ? Math.round(
          livingCosts.food.reduce((a: number, b: number) => a + b, 0) /
            livingCosts.food.length,
        )
      : null;
  const avgTransport =
    livingCosts.transport.length > 0
      ? Math.round(
          livingCosts.transport.reduce((a: number, b: number) => a + b, 0) /
            livingCosts.transport.length,
        )
      : null;
  const avgEntertainment =
    livingCosts.entertainment.length > 0
      ? Math.round(
          livingCosts.entertainment.reduce((a: number, b: number) => a + b, 0) /
            livingCosts.entertainment.length,
        )
      : null;

  const avgTotal =
    [avgRent, avgFood, avgTransport, avgEntertainment].filter((x) => x !== null)
      .length > 0
      ? [avgRent, avgFood, avgTransport, avgEntertainment].reduce(
          (a, b) => (a || 0) + (b || 0),
          0,
        )
      : null;

  // Get all tips
  const allTips = citySubmissions.flatMap(
    (submission) => submission.data.topTips || [],
  );
  const uniqueTips = [...new Set(allTips)];

  // Get accommodation types
  const accommodationTypes = citySubmissions.reduce((acc, submission) => {
    if (submission.data.accommodationType) {
      const type = submission.data.accommodationType;
      if (!acc[type]) {
        acc[type] = { count: 0, rents: [] };
      }
      acc[type].count++;
      if (submission.data.monthlyRent) {
        acc[type].rents.push(submission.data.monthlyRent);
      }
    }
    return acc;
  }, {} as any);

  const accommodationTypesArray = Object.entries(accommodationTypes).map(
    ([type, data]: [string, any]) => ({
      type,
      count: data.count,
      averageRent:
        data.rents.length > 0
          ? Math.round(
              data.rents.reduce((a: number, b: number) => a + b, 0) /
                data.rents.length,
            )
          : null,
    }),
  );

  return {
    totalSubmissions,
    averages: {
      livingCosts: {
        rent: avgRent,
        food: avgFood,
        transport: avgTransport,
        entertainment: avgEntertainment,
        total: avgTotal,
      },
      ratings: {
        overall:
          ratings.overall.length > 0
            ? Number(
                (
                  ratings.overall.reduce((a: number, b: number) => a + b, 0) /
                  ratings.overall.length
                ).toFixed(1),
              )
            : null,
        accommodation:
          ratings.accommodation.length > 0
            ? Number(
                (
                  ratings.accommodation.reduce(
                    (a: number, b: number) => a + b,
                    0,
                  ) / ratings.accommodation.length
                ).toFixed(1),
              )
            : null,
        socialLife:
          ratings.socialLife.length > 0
            ? Number(
                (
                  ratings.socialLife.reduce(
                    (a: number, b: number) => a + b,
                    0,
                  ) / ratings.socialLife.length
                ).toFixed(1),
              )
            : null,
        academics:
          ratings.academics.length > 0
            ? Number(
                (
                  ratings.academics.reduce((a: number, b: number) => a + b, 0) /
                  ratings.academics.length
                ).toFixed(1),
              )
            : null,
        costOfLiving:
          ratings.costOfLiving.length > 0
            ? Number(
                (
                  ratings.costOfLiving.reduce(
                    (a: number, b: number) => a + b,
                    0,
                  ) / ratings.costOfLiving.length
                ).toFixed(1),
              )
            : null,
      },
      recommendations: {
        wouldRecommend:
          recommendations.total > 0
            ? Math.round(
                (recommendations.positive / recommendations.total) * 100,
              )
            : 0,
        totalResponses: recommendations.total,
      },
    },
    topTips: uniqueTips.slice(0, 5),
    accommodationTypes: accommodationTypesArray,
    recentSubmissions: citySubmissions.slice(0, 4).map((submission) => ({
      id: submission.id,
      type: submission.type,
      title: submission.title,
      excerpt:
        submission.data.personalExperience ||
        submission.data.challenges ||
        "Student experience shared",
      author: `${submission.data.firstName} ${submission.data.lastName.charAt(0)}.`,
      createdAt: submission.createdAt,
    })),
  };
}
