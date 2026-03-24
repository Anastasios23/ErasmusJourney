import type {
  PublicDestinationAccommodationInsights,
  PublicDestinationCourseEquivalences,
  PublicDestinationDetail,
} from "./publicDestinations";

export interface PendingAccommodationPublicContribution {
  type?: string;
  rent?: number;
  currency: string;
  area?: string;
  difficulty?: string;
  wouldRecommend?: boolean;
  reviewSnippet?: string;
}

export interface PendingCoursePublicContribution {
  homeUniversity: string;
  homeDepartment?: string;
  hostUniversity?: string;
  homeCourseName: string;
  hostCourseName: string;
  recognitionType: string;
  notes?: string;
}

export interface AdminPublicImpactPreview {
  slug: string;
  city: string;
  country: string;
  destination: {
    isNewDestination: boolean;
    before: PublicDestinationDetail | null;
    after: PublicDestinationDetail;
  };
  accommodation: {
    before: PublicDestinationAccommodationInsights | null;
    after: PublicDestinationAccommodationInsights;
    contribution: PendingAccommodationPublicContribution | null;
  };
  courses: {
    before: PublicDestinationCourseEquivalences | null;
    after: PublicDestinationCourseEquivalences;
    contributionCount: number;
    contributionExamples: PendingCoursePublicContribution[];
  };
}
