import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

// Sample destination data with realistic information
const SAMPLE_DESTINATIONS = [
  {
    city: "Berlin",
    country: "Germany",
    universities: [
      "Humboldt University of Berlin",
      "Technical University of Berlin",
      "Free University of Berlin",
    ],
    avgRent: 550,
    avgExpenses: 800,
    studentCount: 25,
  },
  {
    city: "Barcelona",
    country: "Spain",
    universities: [
      "University of Barcelona",
      "Pompeu Fabra University",
      "Polytechnic University of Catalonia",
    ],
    avgRent: 480,
    avgExpenses: 650,
    studentCount: 18,
  },
  {
    city: "Prague",
    country: "Czech Republic",
    universities: [
      "Charles University",
      "Czech Technical University",
      "University of Economics",
    ],
    avgRent: 320,
    avgExpenses: 550,
    studentCount: 15,
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    universities: [
      "University of Amsterdam",
      "VU Amsterdam",
      "Amsterdam University of Applied Sciences",
    ],
    avgRent: 750,
    avgExpenses: 950,
    studentCount: 20,
  },
  {
    city: "Vienna",
    country: "Austria",
    universities: [
      "University of Vienna",
      "Vienna University of Technology",
      "Vienna University of Economics and Business",
    ],
    avgRent: 450,
    avgExpenses: 700,
    studentCount: 12,
  },
  {
    city: "Lyon",
    country: "France",
    universities: [
      "University of Lyon",
      "INSA Lyon",
      "Jean Moulin University Lyon 3",
    ],
    avgRent: 520,
    avgExpenses: 750,
    studentCount: 14,
  },
];

// Sample Cyprus universities and departments
const CYPRUS_UNIVERSITIES = [
  {
    code: "UNIC",
    name: "University of Nicosia",
    departments: [
      "Computer Science",
      "Business Administration",
      "Engineering",
      "Medicine",
    ],
  },
  {
    code: "UCY",
    name: "University of Cyprus",
    departments: ["Psychology", "Law", "Economics", "Architecture"],
  },
  {
    code: "CUT",
    name: "Cyprus University of Technology",
    departments: ["Civil Engineering", "Electrical Engineering", "Multimedia"],
  },
];

// Sample student names for realistic data
const SAMPLE_NAMES = [
  { firstName: "Maria", lastName: "Georgiadou" },
  { firstName: "Andreas", lastName: "Papadopoulos" },
  { firstName: "Elena", lastName: "Dimitriou" },
  { firstName: "Christos", lastName: "Stavrou" },
  { firstName: "Sophia", lastName: "Ioannou" },
  { firstName: "Nikos", lastName: "Constantinou" },
  { firstName: "Anna", lastName: "Michaelides" },
  { firstName: "Petros", lastName: "Charalambous" },
  { firstName: "Katerina", lastName: "Nicolaou" },
  { firstName: "Marios", lastName: "Andreou" },
];

// Generate realistic expense breakdown
function generateExpenses(totalBudget: number) {
  return {
    groceries: Math.round(totalBudget * 0.25).toString(),
    transportation: Math.round(totalBudget * 0.15).toString(),
    eatingOut: Math.round(totalBudget * 0.2).toString(),
    socialLife: Math.round(totalBudget * 0.15).toString(),
    travel: Math.round(totalBudget * 0.15).toString(),
    otherExpenses: Math.round(totalBudget * 0.1).toString(),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const submissions = [];

    // Create fake users and submissions for each destination
    for (const destination of SAMPLE_DESTINATIONS) {
      const studentsForDestination = Math.min(
        destination.studentCount,
        SAMPLE_NAMES.length,
      );

      for (let i = 0; i < studentsForDestination; i++) {
        const student = SAMPLE_NAMES[i % SAMPLE_NAMES.length];
        const cyprusUni = CYPRUS_UNIVERSITIES[i % CYPRUS_UNIVERSITIES.length];
        const department =
          cyprusUni.departments[i % cyprusUni.departments.length];
        const hostUniversity =
          destination.universities[i % destination.universities.length];

        // Create or find user
        let user = await prisma.user.findFirst({
          where: {
            email: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@example.com`,
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@example.com`,
              firstName: student.firstName,
              lastName: student.lastName,
              nationality: "Cypriot",
            },
          });
        }

        // 1. Basic Information Submission
        const basicInfoSubmission = await prisma.form_submissions.create({
          data: {
            userId: user.id,
            type: "BASIC_INFO",
            title: "Basic Information Form",
            status: "SUBMITTED",
            data: {
              firstName: student.firstName,
              lastName: student.lastName,
              email: user.email,
              universityInCyprus: cyprusUni.code,
              departmentInCyprus: department,
              levelOfStudy: ["bachelor", "master"][
                Math.floor(Math.random() * 2)
              ],
              hostCity: destination.city,
              hostCountry: destination.country,
              hostUniversity: hostUniversity,
              exchangePeriod: ["semester1", "semester2", "full_year"][
                Math.floor(Math.random() * 3)
              ],
              nationality: "Cypriot",
            },
          },
        });

        // 2. Accommodation Submission
        const rentVariation = destination.avgRent + (Math.random() - 0.5) * 200;
        await prisma.form_submissions.create({
          data: {
            userId: user.id,
            type: "ACCOMMODATION",
            title: "Accommodation Experience",
            status: "SUBMITTED",
            data: {
              accommodationType: [
                "Student Residence",
                "Private Apartment",
                "Shared Apartment",
              ][Math.floor(Math.random() * 3)],
              monthlyRent: Math.round(rentVariation).toString(),
              billsIncluded: Math.random() > 0.6 ? "yes" : "no",
              accommodationRating: (4 + Math.random()).toFixed(1),
              wouldRecommend: Math.random() > 0.2 ? "yes" : "no",
              city: destination.city,
              country: destination.country,
              university: hostUniversity,
              basicInfoId: basicInfoSubmission.id,
            },
          },
        });

        // 3. Living Expenses Submission
        const expenseVariation =
          destination.avgExpenses + (Math.random() - 0.5) * 300;
        await prisma.form_submissions.create({
          data: {
            userId: user.id,
            type: "LIVING_EXPENSES",
            title: "Living Expenses Information",
            status: "SUBMITTED",
            data: {
              expenses: generateExpenses(expenseVariation),
              monthlyIncomeAmount: Math.round(
                rentVariation + expenseVariation + 200,
              ).toString(),
              spendingHabit: ["conservative", "moderate", "liberal"][
                Math.floor(Math.random() * 3)
              ],
              cheapGroceryPlaces: `Local markets and discount stores in ${destination.city}`,
              transportationTips: `Student discounts available for public transport in ${destination.city}`,
              overallBudgetAdvice: `Budget around €${Math.round(rentVariation + expenseVariation)} per month for ${destination.city}`,
              basicInfoId: basicInfoSubmission.id,
            },
          },
        });

        submissions.push({
          student: `${student.firstName} ${student.lastName}`,
          destination: `${destination.city}, ${destination.country}`,
          university: hostUniversity,
        });
      }
    }

    res.status(200).json({
      message: "Fake form submissions created successfully",
      submissions: submissions,
      destinationsCreated: SAMPLE_DESTINATIONS.length,
      totalSubmissions: submissions.length * 3, // 3 forms per student
    });
  } catch (error) {
    console.error("Error creating fake submissions:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
