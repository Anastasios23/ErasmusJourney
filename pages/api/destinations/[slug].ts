import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

// Interface for destination with aggregated data
interface DestinationWithDetails {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  imageUrl?: string;
  climate?: string;
  highlights?: string[];
  featured: boolean;
  slug: string;
  
  // Student data
  totalSubmissions: number;
  averageRating?: number;
  avgCostPerMonth?: number;
  avgMonthlyRent?: number;
  
  // Related data
  accommodations: any[];
  courseExchanges: any[];
  universities: any[];
  
  // Living expenses breakdown
  livingExpenses?: {
    rent: number;
    groceries: number;
    transportation: number;
    eatingOut: number;
    bills: number;
    entertainment: number;
    other: number;
    total: number;
  };
  
  // Admin fields
  adminTitle?: string;
  adminDescription?: string;
  adminImageUrl?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Invalid slug parameter" });
  }

  try {
    // First, try to find the destination by slug in the database
    let destination = await prisma.destination.findUnique({
      where: { slug },
      include: {
        accommodations: true,
        courseExchanges: true,
      },
    });

    // If not found in database, try to match against our default destinations
    if (!destination) {
      const defaultDestinations = [
        {
          id: "berlin-germany",
          name: "Berlin",
          city: "Berlin",
          country: "Germany",
          description: "Vibrant capital with rich history, excellent universities, and affordable living costs.",
          slug: "berlin-germany",
        },
        {
          id: "barcelona-spain", 
          name: "Barcelona",
          city: "Barcelona",
          country: "Spain",
          description: "Mediterranean coastal city known for architecture, culture, and excellent student life.",
          slug: "barcelona-spain",
        },
      ];

      const defaultDest = defaultDestinations.find(d => d.slug === slug);
      if (!defaultDest) {
        return res.status(404).json({ error: "Destination not found" });
      }

      // Return default destination with empty related data
      const result: DestinationWithDetails = {
        ...defaultDest,
        imageUrl: `/images/destinations/${defaultDest.city.toLowerCase()}.svg`,
        climate: defaultDest.city === "Berlin" ? "Continental" : "Mediterranean",
        highlights: defaultDest.city === "Berlin" 
          ? ["Rich History", "Vibrant Culture", "Affordable Living"]
          : ["Beautiful Architecture", "Beach City", "Great Food"],
        featured: true,
        totalSubmissions: 0,
        accommodations: [],
        courseExchanges: [],
        universities: [],
        adminTitle: defaultDest.name,
        adminDescription: defaultDest.description,
        adminImageUrl: `/images/destinations/${defaultDest.city.toLowerCase()}.svg`,
      };

      return res.status(200).json(result);
    }

    // Get related form submissions for this destination
    const formSubmissions = await prisma.formSubmission.findMany({
      where: {
        status: "SUBMITTED",
        OR: [
          {
            data: {
              path: ["hostCity"],
              string_contains: destination.city,
            },
          },
          {
            data: {
              path: ["city"],
              string_contains: destination.city,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Calculate living expenses from submissions
    const livingExpensesData = formSubmissions
      .filter(sub => sub.type === "LIVING_EXPENSES")
      .map(sub => sub.data as any);

    let avgLivingExpenses: any = {};
    if (livingExpensesData.length > 0) {
      const expenses = ["rent", "groceries", "transportation", "eatingOut", "bills", "entertainment", "other"];
      expenses.forEach(expense => {
        const values = livingExpensesData
          .map(data => parseFloat(data[expense] || "0"))
          .filter(val => !isNaN(val) && val > 0);
        
        avgLivingExpenses[expense] = values.length > 0 
          ? Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
          : 0;
      });
      
      avgLivingExpenses.total = Object.values(avgLivingExpenses).reduce((sum: number, val: any) => sum + (val || 0), 0);
    }

    // Extract universities from submissions
    const universities = new Set<string>();
    formSubmissions.forEach(sub => {
      const data = sub.data as any;
      if (data.hostUniversity) universities.add(data.hostUniversity);
      if (data.university) universities.add(data.university);
    });

    // Generate mock accommodations and course exchanges from submissions
    const accommodations = formSubmissions
      .filter(sub => sub.type === "ACCOMMODATION")
      .slice(0, 5) // Limit to 5 for now
      .map((sub, index) => ({
        id: `acc-${sub.id}`,
        studentName: sub.user?.firstName || "Anonymous",
        accommodationType: (sub.data as any).accommodationType || "Student Dorm",
        neighborhood: (sub.data as any).neighborhood || `${destination.city} Center`,
        monthlyRent: (sub.data as any).monthlyRent || 400 + index * 50,
        currency: "EUR",
        title: `${(sub.data as any).accommodationType || "Student Housing"} in ${destination.city}`,
        description: (sub.data as any).description || `Great accommodation experience in ${destination.city}`,
        pros: (sub.data as any).pros || ["Close to university", "Good value for money"],
        cons: (sub.data as any).cons || ["Can be noisy"],
        tips: (sub.data as any).tips || ["Book early for better prices"],
        featured: index === 0,
        visible: true,
      }));

    const courseExchanges = formSubmissions
      .filter(sub => sub.type === "COURSE_MATCHING")
      .slice(0, 5) // Limit to 5 for now
      .map((sub, index) => ({
        id: `course-${sub.id}`,
        studentName: sub.user?.firstName || "Anonymous",
        hostUniversity: (sub.data as any).hostUniversity || `University of ${destination.city}`,
        fieldOfStudy: (sub.data as any).fieldOfStudy || "Computer Science",
        studyLevel: (sub.data as any).studyLevel || "Bachelor",
        semester: (sub.data as any).semester || "Fall 2024",
        title: `${(sub.data as any).fieldOfStudy || "Academic"} Experience at ${destination.city}`,
        description: (sub.data as any).description || `Excellent academic experience in ${destination.city}`,
        courseQuality: (sub.data as any).courseQuality || 4,
        professorQuality: (sub.data as any).professorQuality || 4,
        facilityQuality: (sub.data as any).facilityQuality || 4,
        coursesEnrolled: (sub.data as any).courses || [],
        creditsEarned: (sub.data as any).creditsEarned || 30,
        language: (sub.data as any).language || "English",
        featured: index === 0,
        visible: true,
      }));

    // Build the response
    const result: DestinationWithDetails = {
      id: destination.id,
      name: destination.name,
      city: destination.city || "",
      country: destination.country,
      description: destination.description || destination.summary || "",
      imageUrl: destination.imageUrl || `/images/destinations/${destination.city?.toLowerCase()}.svg`,
      climate: destination.climate || "Temperate",
      highlights: destination.highlights ? (destination.highlights as string[]) : [],
      featured: destination.featured,
      slug: destination.slug,
      totalSubmissions: formSubmissions.length,
      accommodations,
      courseExchanges,
      universities: Array.from(universities).map(name => ({ name, studentCount: 1 })),
      livingExpenses: Object.keys(avgLivingExpenses).length > 0 ? avgLivingExpenses : undefined,
      adminTitle: destination.name,
      adminDescription: destination.description || destination.summary,
      adminImageUrl: destination.imageUrl,
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching destination details:", error);
    return res.status(500).json({
      error: "Failed to fetch destination details",
      message: "Internal server error",
    });
  }
}
