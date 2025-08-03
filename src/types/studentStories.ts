/**
 * Type definitions for Student Stories
 * Based on the actual API response from /api/student-stories
 */

export interface StudentStoryResponse {
  id: string;
  studentName: string;
  university: string;
  city: string;
  country: string;
  department: string;
  levelOfStudy: string;
  exchangePeriod: string;
  story: string;
  tips: string[] | string;
  helpTopics: string[];
  contactMethod: string | null;
  contactInfo: string | null;
  accommodationTips: string | null;
  budgetTips: BudgetTips | null;
  createdAt: string;
  isPublic: boolean;
}

export interface BudgetTips {
  cheapGroceries?: string;
  cheapEating?: string;
  transportation?: string;
  socialLife?: string;
  travel?: string;
  overall?: string;
}

export interface StudentStoriesApiResponse {
  stories: StudentStoryResponse[];
}

/**
 * Validation functions for student story data
 */
export function isValidStudentStory(data: any): data is StudentStoryResponse {
  return (
    typeof data === "object" &&
    typeof data.id === "string" &&
    typeof data.studentName === "string" &&
    typeof data.university === "string" &&
    typeof data.city === "string" &&
    typeof data.country === "string" &&
    typeof data.createdAt === "string" &&
    typeof data.isPublic === "boolean"
  );
}

export function validateStudentStoriesResponse(
  data: any,
): StudentStoriesApiResponse {
  if (!data || typeof data !== "object" || !Array.isArray(data.stories)) {
    throw new Error("Invalid student stories response format");
  }

  const validStories = data.stories.filter(isValidStudentStory);

  if (validStories.length !== data.stories.length) {
    console.warn(
      `Filtered out ${data.stories.length - validStories.length} invalid stories`,
    );
  }

  return { stories: validStories };
}

/**
 * Error types for better error handling
 */
export class StudentStoryError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_FOUND"
      | "VALIDATION_ERROR"
      | "API_ERROR"
      | "NETWORK_ERROR",
    public readonly details?: any,
  ) {
    super(message);
    this.name = "StudentStoryError";
  }
}

/**
 * Loading states for UI components
 */
export interface LoadingState {
  isLoading: boolean;
  error: StudentStoryError | null;
  lastUpdated: Date | null;
}

/**
 * Search and filter types
 */
export interface StoryFilters {
  search: string;
  category: string;
  city: string;
  country: string;
  university: string;
  helpTopics: string[];
}

export interface StorySearchParams extends Partial<StoryFilters> {
  page?: number;
  limit?: number;
  sortBy?: "date" | "name" | "university";
  sortOrder?: "asc" | "desc";
}
