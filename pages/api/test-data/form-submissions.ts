import {
  calculateFormSubmissionLivingExpensesTotal,
  sanitizeFormSubmissionLivingExpensesData,
  type FormSubmissionLivingExpensesData,
} from "../../../src/lib/formSubmissionLivingExpenses";

type TestSubmissionData = {
  firstName: string;
  lastName: string;
  email: string;
  nationality: string;
  universityInCyprus: string;
  departmentInCyprus: string;
  levelOfStudy: string;
  exchangePeriod: string;
  hostCountry: string;
  hostUniversity: string;
  hostCity: string;
  accommodationType?: string;
  monthlyRent?: number;
  overallRating?: number;
  accommodationRating?: number;
  socialLifeRating?: number;
  academicsRating?: number;
  costOfLivingRating?: number;
  wouldRecommend?: boolean;
  topTips?: string[];
  personalExperience?: string;
  challenges?: string;
  highlights?: string;
} & Partial<FormSubmissionLivingExpensesData>;

export interface TestFormSubmission {
  id: string;
  userId: string;
  type: string;
  title: string;
  data: TestSubmissionData;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const TEST_FORM_SUBMISSIONS: TestFormSubmission[] = [
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
      overallRating: 4.5,
      accommodationRating: 4.0,
      socialLifeRating: 4.8,
      academicsRating: 4.3,
      costOfLivingRating: 3.8,
      wouldRecommend: true,
      topTips: [
        "Get the semester transport pass early.",
        "Join international student groups before arrival.",
        "Use the university cafeteria for affordable lunches.",
      ],
      personalExperience:
        "Strong academics, a large international community, and excellent nightlife.",
      challenges: "Affordable housing required a long search.",
      highlights: "Public transport, student events, and diverse neighborhoods.",
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
      currency: "EUR",
      rent: 480,
      food: 280,
      transport: 90,
      social: 120,
      travel: 70,
      other: 60,
      spendingHabit: "Moderate and planned",
      budgetTips: "WG rooms and student discounts make Berlin manageable.",
      overallRating: 4.2,
      accommodationRating: 4.2,
      socialLifeRating: 4.5,
      academicsRating: 4.5,
      costOfLivingRating: 3.7,
      wouldRecommend: true,
      topTips: [
        "Search for shared flats on WG-Gesucht.",
        "Use ISIC discounts whenever possible.",
        "Budget extra for weekend travel.",
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
      accommodationType: "Student Dormitory",
      accommodationRating: 3.8,
      socialLifeRating: 4.3,
      academicsRating: 4.1,
      costOfLivingRating: 4.0,
      wouldRecommend: true,
      topTips: [
        "Dorms are affordable but need early applications.",
        "Friedrichshain is popular with exchange students.",
        "Shop at Aldi and Lidl to save on groceries.",
      ],
    },
    status: "submitted",
    createdAt: "2024-02-01T09:45:00Z",
    updatedAt: "2024-02-01T09:45:00Z",
  },
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
      hostUniversity: "Polytechnic University of Catalonia",
      hostCity: "Barcelona",
      overallRating: 4.8,
      accommodationRating: 4.3,
      socialLifeRating: 5.0,
      academicsRating: 4.4,
      costOfLivingRating: 3.5,
      wouldRecommend: true,
      topTips: [
        "Live near a metro line.",
        "Join ESN Barcelona trips early.",
        "Free museum afternoons are worth planning around.",
      ],
      personalExperience:
        "Great weather, strong design culture, and an active student scene.",
      challenges: "Housing was competitive near the center.",
      highlights: "Beach access, architecture, and nightlife.",
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
      hostUniversity: "Polytechnic University of Catalonia",
      hostCity: "Barcelona",
      overallRating: 4.7,
      accommodationRating: 4.1,
      socialLifeRating: 4.9,
      academicsRating: 4.2,
      costOfLivingRating: 3.6,
      wouldRecommend: true,
      topTips: [
        "Use local markets for cheaper fresh food.",
        "Bike-sharing works well for short trips.",
        "Spend time in Gracia and El Born, not only the tourist center.",
      ],
      personalExperience:
        "Barcelona made it easy to balance classes, friends, and travel.",
    },
    status: "submitted",
    createdAt: "2024-01-25T11:30:00Z",
    updatedAt: "2024-01-25T11:30:00Z",
  },
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
      overallRating: 4.4,
      accommodationRating: 4.0,
      socialLifeRating: 4.2,
      academicsRating: 4.3,
      costOfLivingRating: 4.5,
      wouldRecommend: true,
      topTips: [
        "Prague offers excellent value for money.",
        "Public transport is reliable and cheap.",
        "Learn a few Czech phrases for day-to-day errands.",
      ],
      personalExperience:
        "Low costs and a beautiful city made Prague a very balanced exchange.",
      challenges: "The language barrier took a few weeks to adjust to.",
      highlights: "Historic center, affordable lifestyle, and easy weekend trips.",
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
      currency: "EUR",
      rent: 350,
      food: 200,
      transport: 35,
      social: 120,
      travel: 45,
      other: 40,
      spendingHabit: "Budget-conscious but social",
      budgetTips: "Cook most meals and rely on public transport.",
      overallRating: 4.6,
      accommodationRating: 4.2,
      socialLifeRating: 4.4,
      academicsRating: 4.1,
      costOfLivingRating: 4.3,
      wouldRecommend: true,
      topTips: [
        "Local markets are cheap and fresh.",
        "Student discounts apply almost everywhere.",
        "Use public transport instead of taxis.",
      ],
    },
    status: "submitted",
    createdAt: "2024-02-10T08:15:00Z",
    updatedAt: "2024-02-10T08:15:00Z",
  },
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
      overallRating: 4.3,
      accommodationRating: 3.9,
      socialLifeRating: 4.4,
      academicsRating: 4.6,
      costOfLivingRating: 3.2,
      wouldRecommend: true,
      topTips: [
        "Start the housing search early.",
        "A bike is essential for daily life.",
        "Join study associations for local connections.",
      ],
      personalExperience:
        "Expensive, but academically excellent and very international.",
      challenges: "Housing costs were the hardest part of the exchange.",
      highlights: "Strong university, canals, and English-friendly daily life.",
    },
    status: "submitted",
    createdAt: "2024-01-30T15:30:00Z",
    updatedAt: "2024-01-30T15:30:00Z",
  },
];

function average(values: number[]): number | null {
  if (!values.length) {
    return null;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function getTestDataByCity(city: string) {
  const citySubmissions = TEST_FORM_SUBMISSIONS.filter(
    (submission) =>
      submission.data.hostCity?.toLowerCase() === city.toLowerCase(),
  );

  if (citySubmissions.length === 0) {
    return null;
  }

  const livingExpenseSubmissions = citySubmissions.filter(
    (submission) => submission.type === "living-expenses",
  );

  const livingCosts = livingExpenseSubmissions.reduce(
    (acc, submission) => {
      const livingExpenses = sanitizeFormSubmissionLivingExpensesData(
        submission.data,
      );

      if (livingExpenses.rent !== null) acc.rent.push(livingExpenses.rent);
      if (livingExpenses.food !== null) acc.food.push(livingExpenses.food);
      if (livingExpenses.transport !== null) {
        acc.transport.push(livingExpenses.transport);
      }
      if (livingExpenses.social !== null) acc.social.push(livingExpenses.social);
      if (livingExpenses.travel !== null) acc.travel.push(livingExpenses.travel);
      if (livingExpenses.other !== null) acc.other.push(livingExpenses.other);

      const total = calculateFormSubmissionLivingExpensesTotal(submission.data);
      if (total > 0) {
        acc.total.push(total);
      }

      return acc;
    },
    {
      rent: [] as number[],
      food: [] as number[],
      transport: [] as number[],
      social: [] as number[],
      travel: [] as number[],
      other: [] as number[],
      total: [] as number[],
    },
  );

  const ratings = citySubmissions.reduce(
    (acc, submission) => {
      if (submission.data.overallRating) acc.overall.push(submission.data.overallRating);
      if (submission.data.accommodationRating) {
        acc.accommodation.push(submission.data.accommodationRating);
      }
      if (submission.data.socialLifeRating) {
        acc.socialLife.push(submission.data.socialLifeRating);
      }
      if (submission.data.academicsRating) {
        acc.academics.push(submission.data.academicsRating);
      }
      if (submission.data.costOfLivingRating) {
        acc.costOfLiving.push(submission.data.costOfLivingRating);
      }
      return acc;
    },
    {
      overall: [] as number[],
      accommodation: [] as number[],
      socialLife: [] as number[],
      academics: [] as number[],
      costOfLiving: [] as number[],
    },
  );

  const recommendations = citySubmissions.reduce(
    (acc, submission) => {
      if (submission.data.wouldRecommend !== undefined) {
        acc.total += 1;
        if (submission.data.wouldRecommend) {
          acc.positive += 1;
        }
      }
      return acc;
    },
    { positive: 0, total: 0 },
  );

  const allTips = citySubmissions.flatMap(
    (submission) => submission.data.topTips || [],
  );
  const uniqueTips = [...new Set(allTips)];

  const accommodationTypes = citySubmissions.reduce(
    (acc, submission) => {
      if (!submission.data.accommodationType) {
        return acc;
      }

      const type = submission.data.accommodationType;
      if (!acc[type]) {
        acc[type] = { count: 0, rents: [] as number[] };
      }

      acc[type].count += 1;

      if (typeof submission.data.monthlyRent === "number") {
        acc[type].rents.push(submission.data.monthlyRent);
      }

      return acc;
    },
    {} as Record<string, { count: number; rents: number[] }>,
  );

  const accommodationTypesArray = Object.entries(accommodationTypes).map(
    ([type, data]) => ({
      type,
      count: data.count,
      averageRent: average(data.rents),
    }),
  );

  return {
    totalSubmissions: citySubmissions.length,
    averages: {
      livingCosts: {
        rent: average(livingCosts.rent),
        food: average(livingCosts.food),
        transport: average(livingCosts.transport),
        social: average(livingCosts.social),
        travel: average(livingCosts.travel),
        other: average(livingCosts.other),
        total: average(livingCosts.total),
      },
      ratings: {
        overall:
          ratings.overall.length > 0
            ? Number(
                (
                  ratings.overall.reduce((sum, rating) => sum + rating, 0) /
                  ratings.overall.length
                ).toFixed(1),
              )
            : null,
        accommodation:
          ratings.accommodation.length > 0
            ? Number(
                (
                  ratings.accommodation.reduce((sum, rating) => sum + rating, 0) /
                  ratings.accommodation.length
                ).toFixed(1),
              )
            : null,
        socialLife:
          ratings.socialLife.length > 0
            ? Number(
                (
                  ratings.socialLife.reduce((sum, rating) => sum + rating, 0) /
                  ratings.socialLife.length
                ).toFixed(1),
              )
            : null,
        academics:
          ratings.academics.length > 0
            ? Number(
                (
                  ratings.academics.reduce((sum, rating) => sum + rating, 0) /
                  ratings.academics.length
                ).toFixed(1),
              )
            : null,
        costOfLiving:
          ratings.costOfLiving.length > 0
            ? Number(
                (
                  ratings.costOfLiving.reduce((sum, rating) => sum + rating, 0) /
                  ratings.costOfLiving.length
                ).toFixed(1),
              )
            : null,
      },
      recommendations: {
        wouldRecommend:
          recommendations.total > 0
            ? Math.round((recommendations.positive / recommendations.total) * 100)
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
