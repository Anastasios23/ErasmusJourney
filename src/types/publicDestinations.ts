export interface PublicDestinationListItem {
  slug: string;
  city: string;
  country: string;
  hostUniversityCount: number;
  submissionCount: number;
  averageRent: number | null;
  averageMonthlyCost: number | null;
}

export interface PublicDestinationAccommodationTypeInsight {
  type: string;
  count: number;
  averageRent: number | null;
}

export interface PublicDestinationDifficultyInsight {
  level: string;
  count: number;
}

export interface PublicDestinationAccommodationSummary {
  sampleSize: number;
  averageRent: number | null;
  types: PublicDestinationAccommodationTypeInsight[];
  difficulty: PublicDestinationDifficultyInsight[];
}

export interface PublicDestinationCostSummary {
  currency: string;
  sampleSize: number;
  averageRent: number | null;
  averageFood: number | null;
  averageTransport: number | null;
  averageSocial: number | null;
  averageTravel: number | null;
  averageOther: number | null;
  averageMonthlyCost: number | null;
}

export interface PublicDestinationCourseExample {
  homeCourseName: string;
  hostCourseName: string;
  recognitionType: string;
  notes: string;
}

export interface PublicDestinationDetail {
  slug: string;
  city: string;
  country: string;
  hostUniversityCount: number;
  submissionCount: number;
  averageRent: number | null;
  averageMonthlyCost: number | null;
  accommodationSummary: PublicDestinationAccommodationSummary;
  costSummary: PublicDestinationCostSummary;
  courseEquivalenceExamples: PublicDestinationCourseExample[];
  practicalTips: string[];
}
