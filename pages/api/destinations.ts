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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get admin destinations (public data only)
    const adminDestinations = await prisma.adminDestination.findMany({
      where: { active: true },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });

    // Get form submissions to calculate student counts and additional data
    const formSubmissions = await prisma.formSubmission.findMany({
      where: { status: "SUBMITTED" },
      select: {
        data: true,
        type: true,
      },
    });

    // Process destinations and add computed data
    const publicDestinations: PublicDestination[] = adminDestinations.map((dest) => {
      // Calculate student count based on form submissions for this destination
      const citySubmissions = formSubmissions.filter((sub) => {
        const data = sub.data as any;
        const submissionCity = data.hostCity || data.city;
        const submissionCountry = data.hostCountry || data.country;
        
        return (
          submissionCity?.toLowerCase().includes(dest.city.toLowerCase()) ||
          submissionCountry?.toLowerCase().includes(dest.country.toLowerCase())
        );
      });

      // Extract universities from submissions
      const universities = new Set<string>();
      citySubmissions.forEach((sub) => {
        const data = sub.data as any;
        if (data.hostUniversity) universities.add(data.hostUniversity);
        if (data.university) universities.add(data.university);
      });

      // Determine cost level based on any cached student data
      let costOfLiving: "low" | "medium" | "high" = "medium";
      let averageRent = 0;
      
      if (dest.studentDataCache) {
        const studentData = dest.studentDataCache as any;
        const avgRent = studentData.livingCosts?.avgMonthlyRent || 0;
        
        if (avgRent < 400) costOfLiving = "low";
        else if (avgRent > 700) costOfLiving = "high";
        
        averageRent = avgRent;
      }

      return {
        id: dest.id,
        name: dest.name,
        city: dest.city,
        country: dest.country,
        description: dest.description,
        imageUrl: dest.imageUrl || `/images/destinations/${dest.city.toLowerCase()}.svg`,
        climate: dest.climate,
        highlights: (dest.highlights as string[]) || [],
        featured: dest.featured,
        studentCount: citySubmissions.length,
        avgCostPerMonth: averageRent || undefined,
        popularUniversities: Array.from(universities).slice(0, 3),
        
        // Additional fields for frontend compatibility
        university: Array.from(universities)[0] || `University of ${dest.city}`,
        universityShort: Array.from(universities)[0]?.split(' ').map(w => w[0]).join('') || dest.city.slice(0, 3).toUpperCase(),
        partnerUniversities: Array.from(universities),
        language: (dest.generalInfo as any)?.language || "English",
        costOfLiving,
        averageRent: averageRent || undefined,
        popularWith: ["Business", "Engineering", "Arts"],
        userStories: [],
        userAccommodationTips: [],
        userCourseMatches: [],
        userReviews: [],
      };
    });

    // Add some default destinations if none exist
    if (publicDestinations.length === 0) {
      const defaultDestinations: PublicDestination[] = [
        {
          id: "berlin-germany",
          name: "Berlin",
          city: "Berlin", 
          country: "Germany",
          description: "Vibrant capital with rich history, excellent universities, and affordable living costs.",
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
          description: "Mediterranean coastal city known for architecture, culture, and excellent student life.",
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
      
      return res.status(200).json(defaultDestinations);
    }

    return res.status(200).json(publicDestinations);

  } catch (error) {
    console.error("Error fetching public destinations:", error);
    return res.status(500).json({
      error: "Failed to fetch destinations",
      message: "Internal server error",
    });
  }
}
