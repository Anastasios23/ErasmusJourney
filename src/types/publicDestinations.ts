export interface PublicDestinationListItem {
  slug: string;
  city: string;
  country: string;
  hostUniversityCount: number;
  submissionCount: number;
  latestReportSubmittedAt: string | null;
  isLimitedData: boolean;
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
  isLimitedData: boolean;
  averageRent: number | null;
  types: PublicDestinationAccommodationTypeInsight[];
  difficulty: PublicDestinationDifficultyInsight[];
}

export interface PublicDestinationCostSummary {
  currency: string;
  sampleSize: number;
  isLimitedData: boolean;
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
  credits?: number | null;
  recognitionType: string;
  notes?: string;
}

export interface PublicDestinationAreaInsight {
  name: string;
  count: number;
}

export interface PublicDestinationAccommodationInsights {
  slug: string;
  city: string;
  country: string;
  hostUniversityCount: number;
  submissionCount: number;
  latestReportSubmittedAt: string | null;
  isLimitedData: boolean;
  currency: string;
  sampleSize: number;
  rentSampleSize: number;
  averageRent: number | null;
  recommendationRate: number | null;
  recommendationSampleSize: number;
  recommendationYesCount: number;
  types: PublicDestinationAccommodationTypeInsight[];
  difficulty: PublicDestinationDifficultyInsight[];
  commonAreas: PublicDestinationAreaInsight[];
  reviewSnippets: string[];
}

export interface PublicDestinationCourseEquivalenceItem {
  homeCourseName: string;
  hostCourseName: string;
  hostUniversity?: string;
  credits?: number | null;
  recognitionType: string;
  notes?: string;
}

export interface PublicDestinationCourseEquivalenceGroup {
  homeUniversity: string;
  homeDepartment?: string;
  mappingCount: number;
  hostUniversities: string[];
  examples: PublicDestinationCourseEquivalenceItem[];
}

export interface PublicDestinationCourseEquivalences {
  slug: string;
  city: string;
  country: string;
  hostUniversityCount: number;
  submissionCount: number;
  latestReportSubmittedAt: string | null;
  isLimitedData: boolean;
  homeUniversityCount: number;
  totalMappings: number;
  groups: PublicDestinationCourseEquivalenceGroup[];
}

export interface PublicDestinationDetail {
  slug: string;
  city: string;
  country: string;
  hostUniversityCount: number;
  submissionCount: number;
  latestReportSubmittedAt: string | null;
  isLimitedData: boolean;
  averageRent: number | null;
  averageMonthlyCost: number | null;
  accommodationSummary: PublicDestinationAccommodationSummary;
  costSummary: PublicDestinationCostSummary;
  courseSampleSize: number;
  courseIsLimitedData: boolean;
  courseEquivalenceExamples: PublicDestinationCourseExample[];
  practicalTips: string[];
}

export interface PublicDestinationReadModelDetail {
  slug: string;
  city: string;
  country: string;
  hostUniversityCount: number;
  submissionCount: number;
  latestReportSubmittedAt: string | null;
  averageRent: number | null;
  averageMonthlyCost: number | null;
  detail: PublicDestinationDetail;
  accommodation: PublicDestinationAccommodationInsights;
  courseEquivalences: PublicDestinationCourseEquivalences;
}
