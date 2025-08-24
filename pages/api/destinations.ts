import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

// Public interface for destinations (without admin-only fields)
interface PublicDestination {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  imageUrl?: string;
  climate?: string;
  highlights?: string[];
  featured: boolean;
  studentCount: number;
  averageRating?: number;
  avgCostPerMonth?: number;
  popularUniversities?: string[];
  // Additional fields for compatibility with existing frontend
  university?: string;
  universityShort?: string;
  partnerUniversities?: string[];
  language?: string;
  costOfLiving?: "low" | "medium" | "high";
  averageRent?: number;
  popularWith?: string[];
  userStories?: any[];
  userAccommodationTips?: any[];
  userCourseMatches?: any[];
  userReviews?: any[];
}

// Fallback destinations returned when database queries fail
const FALLBACK_DESTINATIONS: PublicDestination[] = [
  {
    id: "berlin-germany",
    name: "Berlin",
    city: "Berlin",
    country: "Germany",
    description:
      "Vibrant capital with rich history, excellent universities, and affordable living costs.",
    imageUrl: "/images/destinations/berlin.svg",
    climate: "Continental",
    highlights: ["Rich History", "Vibrant Culture", "Affordable Living"],
    featured: true,
    studentCount: 25,
    university: "Humboldt University of Berlin",
    universityShort: "HUB",
    partnerUniversities: ["Humboldt University", "Technical University Berlin"],
    language: "German",
    costOfLiving: "medium",
    averageRent: 550,
    avgCostPerMonth: 550,
    popularUniversities: ["Humboldt University", "TU Berlin"],
    popularWith: ["Engineering", "Arts", "Business"],
    userStories: [],
    userAccommodationTips: [],
    userCourseMatches: [],
    userReviews: [],
  },
  {
    id: "barcelona-spain",
    name: "Barcelona",
    city: "Barcelona",
    country: "Spain",
    description:
      "Mediterranean coastal city known for architecture, culture, and excellent student life.",
    imageUrl: "/images/destinations/barcelona.svg",
    climate: "Mediterranean",
    highlights: ["Beautiful Architecture", "Beach City", "Great Food"],
    featured: true,
    studentCount: 18,
    university: "University of Barcelona",
    universityShort: "UB",
    partnerUniversities: ["University of Barcelona", "Pompeu Fabra University"],
    language: "Spanish",
    costOfLiving: "medium",
    averageRent: 480,
    avgCostPerMonth: 480,
    popularUniversities: ["University of Barcelona", "UPF"],
    popularWith: ["Business", "Arts", "Engineering"],
    userStories: [],
    userAccommodationTips: [],
    userCourseMatches: [],
    userReviews: [],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get both admin destinations and form-generated destinations
    const [adminDestinations, formGeneratedDestinations] = await Promise.all([
      prisma.adminDestination.findMany({
        where: { active: true },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      }),
      prisma.destination.findMany({
        include: {
          accommodations: true,
          courseExchanges: true,
        },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
      }),
    ]);

    // Get form submissions for calculating stats
    const formSubmissions = await prisma.formSubmission.findMany({
      where: { status: "PUBLISHED" }, // Only approved submissions
      select: {
        data: true,
        type: true,
      },
    });

    // Process both admin and form-generated destinations
    const allDestinations: PublicDestination[] = [];

    // Process admin destinations
    adminDestinations.forEach((dest) => {
      const citySubmissions = formSubmissions.filter((sub) => {
        const data = sub.data as any;
        const submissionCity = data.hostCity || data.city;
        const submissionCountry = data.hostCountry || data.country;

        return (
          submissionCity?.toLowerCase().includes(dest.city.toLowerCase()) ||
          submissionCountry?.toLowerCase().includes(dest.country.toLowerCase())
        );
      });

      const universities = new Set<string>();
      citySubmissions.forEach((sub) => {
        const data = sub.data as any;
        if (data.hostUniversity) universities.add(data.hostUniversity);
        if (data.university) universities.add(data.university);
      });

      let costOfLiving: "low" | "medium" | "high" = "medium";
      let averageRent = 0;

      if (dest.studentDataCache) {
        const studentData = dest.studentDataCache as any;
        const avgRent = studentData.livingCosts?.avgMonthlyRent || 0;

        if (avgRent < 400) costOfLiving = "low";
        else if (avgRent > 700) costOfLiving = "high";

        averageRent = avgRent;
      }

      allDestinations.push({
        id: dest.id,
        name: dest.name,
        city: dest.city,
        country: dest.country,
        description: dest.description,
        imageUrl:
          dest.imageUrl ||
          `/images/destinations/${dest.city.toLowerCase()}.svg`,
        climate: dest.climate,
        highlights: (dest.highlights as string[]) || [],
        featured: dest.featured,
        studentCount: citySubmissions.length,
        avgCostPerMonth: averageRent || undefined,
        popularUniversities: Array.from(universities).slice(0, 3),

        // Additional fields for frontend compatibility
        university: Array.from(universities)[0] || `University of ${dest.city}`,
        universityShort:
          Array.from(universities)[0]
            ?.split(" ")
            .map((w) => w[0])
            .join("") || dest.city.slice(0, 3).toUpperCase(),
        partnerUniversities: Array.from(universities),
        language: (dest.generalInfo as any)?.language || "English",
        costOfLiving,
        averageRent: averageRent || undefined,
        popularWith: ["Business", "Engineering", "Arts"],
        userStories: [],
        userAccommodationTips: [],
        userCourseMatches: [],
        userReviews: [],
      });
    });

    // Process form-generated destinations
    formGeneratedDestinations.forEach((dest) => {
      // Skip if we already have this destination from admin destinations
      const existingAdmin = adminDestinations.find(
        (admin) =>
          admin.city.toLowerCase() === dest.city?.toLowerCase() &&
          admin.country.toLowerCase() === dest.country.toLowerCase(),
      );

      if (existingAdmin) return;

      const citySubmissions = formSubmissions.filter((sub) => {
        const data = sub.data as any;
        const submissionCity = data.hostCity || data.city;
        const submissionCountry = data.hostCountry || data.country;

        return (
          submissionCity?.toLowerCase() === dest.city?.toLowerCase() &&
          submissionCountry?.toLowerCase() === dest.country.toLowerCase()
        );
      });

      // Calculate living expenses from submissions
      const livingExpensesSubmissions = citySubmissions.filter(
        (sub) => sub.type === "LIVING_EXPENSES",
      );
      let avgCostPerMonth = 0;
      let costOfLiving: "low" | "medium" | "high" = "medium";

      if (livingExpensesSubmissions.length > 0) {
        const totalExpenses = livingExpensesSubmissions.map((sub) => {
          const data = sub.data as any;
          return (
            parseFloat(data.rent || 0) +
            parseFloat(data.groceries || 0) +
            parseFloat(data.transportation || 0) +
            parseFloat(data.eatingOut || 0) +
            parseFloat(data.bills || 0) +
            parseFloat(data.entertainment || 0) +
            parseFloat(data.other || 0)
          );
        });

        avgCostPerMonth = Math.round(
          totalExpenses.reduce((sum, val) => sum + val, 0) /
            totalExpenses.length,
        );

        if (avgCostPerMonth < 600) costOfLiving = "low";
        else if (avgCostPerMonth > 1200) costOfLiving = "high";
      }

      const universities = new Set<string>();
      dest.courseExchanges.forEach((ce) => {
        if (dest.accommodations.length > 0) {
          universities.add(`University of ${dest.city}`);
        }
      });

      allDestinations.push({
        id: dest.id,
        name: dest.name,
        city: dest.city || "",
        country: dest.country,
        description:
          dest.description ||
          dest.summary ||
          `Discover ${dest.name} through real student experiences.`,
        imageUrl:
          dest.imageUrl ||
          `/images/destinations/${dest.city?.toLowerCase()}.svg`,
        climate: dest.climate || "Temperate",
        highlights: (dest.highlights as string[]) || [
          "Student Reviews",
          "Real Experiences",
        ],
        featured: dest.featured,
        studentCount: citySubmissions.length,
        avgCostPerMonth: avgCostPerMonth || undefined,
        popularUniversities: Array.from(universities).slice(0, 3),

        // Additional fields for frontend compatibility
        university: Array.from(universities)[0] || `University of ${dest.city}`,
        universityShort: dest.city?.slice(0, 3).toUpperCase() || "UNI",
        partnerUniversities: Array.from(universities),
        language: "English",
        costOfLiving,
        averageRent: avgCostPerMonth || undefined,
        popularWith: ["Exchange Students", "International Students"],
        userStories: [],
        userAccommodationTips: [],
        userCourseMatches: [],
        userReviews: [],
      });
    });

    // Add some default destinations if none exist
    if (allDestinations.length === 0) {
      return res.status(200).json(FALLBACK_DESTINATIONS);
    }

    return res.status(200).json(allDestinations);
  } catch (error) {
    console.error("Error fetching public destinations:", error);
    return res.status(200).json(FALLBACK_DESTINATIONS);
  }
}
