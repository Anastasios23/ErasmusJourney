import { useQuery } from "@tanstack/react-query";

export interface GeneratedDestinationData {
  id: string;
  slug: string;
  city: string;
  country: string;

  // Aggregated data
  totalSubmissions: number;
  averageRating?: number;
  averageMonthlyCost?: number;
  averageAccommodationCost?: number;

  // Insights
  topNeighborhoods?: string[];
  commonPros?: string[];
  commonCons?: string[];
  budgetBreakdown?: {
    groceries?: number;
    transport?: number;
    social?: number;
    accommodation?: number;
    other?: number;
  };

  // Admin content
  adminTitle?: string;
  adminDescription?: string;
  adminImageUrl?: string;
  adminHighlights?: string[];
  adminGeneralInfo?: {
    language?: string;
    currency?: string;
    timeZone?: string;
    climate?: string;
    publicTransport?: string;
    visaInfo?: string;
  };

  // Status
  status: string;
  featured: boolean;
  lastCalculated: string;

  // Relations
  accommodations: GeneratedAccommodation[];
  courseExchanges: GeneratedCourseExchange[];
}

export interface GeneratedAccommodation {
  id: string;
  studentName?: string;
  accommodationType: string;
  neighborhood?: string;
  monthlyRent?: number;
  currency: string;
  title: string;
  description: string;
  pros?: string[];
  cons?: string[];
  tips?: string[];
  bookingAdvice?: string;
  featured: boolean;
  createdAt: string;
}

export interface GeneratedCourseExchange {
  id: string;
  studentName?: string;
  hostUniversity: string;
  fieldOfStudy?: string;
  studyLevel?: string;
  semester?: string;
  title: string;
  description: string;
  courseQuality?: number;
  professorQuality?: number;
  facilityQuality?: number;
  coursesEnrolled?: Array<{
    name: string;
    credits: number;
    difficulty: number;
    recommendation: string;
  }>;
  creditsEarned?: number;
  language?: string;
  academicChallenges?: string;
  academicHighlights?: string;
  tips?: string[];
  featured: boolean;
  createdAt: string;
}

// Hook to fetch generated destination data by slug
export function useGeneratedDestination(slug: string) {
  return useQuery<GeneratedDestinationData>({
    queryKey: ["generated-destination", slug],
    queryFn: async () => {
      const response = await fetch(`/api/destinations/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch destination");
      }
      return response.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
