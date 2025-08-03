/**
 * Form Linking Utilities
 *
 * These utilities help manage the linking of form submissions to basic information forms,
 * enabling comprehensive student experience data collection across multiple form types.
 */

export interface FormLinkingData {
  basicInfoId?: string;
  linkedSubmission?: boolean;
  submissionChain?: string[]; // Track the order of submissions
}

export interface EnhancedSubmissionData {
  [key: string]: any;
  _basicInfoId?: string;
  _linkedSubmission?: boolean;
  _submissionOrder?: number;
  _formChain?: string[];
}

/**
 * Helper to create linking data for subsequent form submissions
 */
export function createFormLinkingData(
  basicInfoId: string,
  formType: string,
  previousChain: string[] = [],
): FormLinkingData {
  return {
    basicInfoId,
    linkedSubmission: true,
    submissionChain: [...previousChain, formType],
  };
}

/**
 * Extract basic info ID from form submission data
 */
export function extractBasicInfoId(submissionData: any): string | null {
  if (submissionData?._basicInfoId) {
    return submissionData._basicInfoId;
  }

  // Also check in the root data object
  if (submissionData?.data?._basicInfoId) {
    return submissionData.data._basicInfoId;
  }

  return null;
}

/**
 * Check if a submission is linked to a basic info form
 */
export function isLinkedSubmission(submissionData: any): boolean {
  return !!(
    submissionData?._linkedSubmission || submissionData?.data?._linkedSubmission
  );
}

/**
 * Get the form chain for a submission (order of forms filled)
 */
export function getFormChain(submissionData: any): string[] {
  return submissionData?._formChain || submissionData?.data?._formChain || [];
}

/**
 * Calculate completion percentage for a set of linked submissions
 */
export function calculateCompletionPercentage(
  linkedSubmissions: any[],
  requiredFormTypes: string[] = [
    "LIVING_EXPENSES",
    "ACCOMMODATION",
    "COURSE_MATCHING",
    "EXPERIENCE",
  ],
): number {
  const completedTypes = linkedSubmissions.map((sub) => sub.type);
  const completedCount = requiredFormTypes.filter((type) =>
    completedTypes.includes(type),
  ).length;

  return Math.round((completedCount / requiredFormTypes.length) * 100);
}

/**
 * Get missing form types for a set of linked submissions
 */
export function getMissingFormTypes(
  linkedSubmissions: any[],
  requiredFormTypes: string[] = [
    "LIVING_EXPENSES",
    "ACCOMMODATION",
    "COURSE_MATCHING",
    "EXPERIENCE",
  ],
): string[] {
  const completedTypes = linkedSubmissions.map((sub) => sub.type);
  return requiredFormTypes.filter((type) => !completedTypes.includes(type));
}

/**
 * Format form type for display
 */
export function formatFormType(formType: string): string {
  const typeMapping: Record<string, string> = {
    BASIC_INFO: "Basic Information",
    LIVING_EXPENSES: "Living Expenses",
    ACCOMMODATION: "Accommodation",
    COURSE_MATCHING: "Course Matching",
    EXPERIENCE: "Experience & Story",
    STORY: "Student Story",
  };

  return typeMapping[formType] || formType.replace(/_/g, " ").toLowerCase();
}

/**
 * Generate form URLs with basic info linking
 */
export function generateLinkedFormUrl(
  formType: string,
  basicInfoId?: string,
): string {
  const baseUrls: Record<string, string> = {
    "basic-info": "/basic-information",
    "living-expenses": "/living-expenses",
    accommodation: "/student-accommodations",
    "course-matching": "/course-matching",
    experience: "/share-story",
    story: "/share-story",
  };

  const baseUrl = baseUrls[formType] || `/${formType}`;

  if (basicInfoId && formType !== "basic-info") {
    return `${baseUrl}?basicInfoId=${basicInfoId}`;
  }

  return baseUrl;
}

/**
 * Validate that numeric fields are properly converted for analytics
 */
export function validateNumericFields(data: any, formType: string): boolean {
  const numericFields: Record<string, string[]> = {
    LIVING_EXPENSES: [
      "monthlyRent",
      "monthlyFood",
      "monthlyTransport",
      "monthlyEntertainment",
      "monthlyUtilities",
      "monthlyOther",
      "totalMonthlyBudget",
      "monthlyIncomeAmount",
    ],
    ACCOMMODATION: ["monthlyRent", "avgUtilityCost", "accommodationRating"],
    COURSE_MATCHING: ["hostCourseCount", "homeCourseCount"],
    EXPERIENCE: [
      "academicRating",
      "socialLifeRating",
      "culturalImmersionRating",
      "costOfLivingRating",
      "accommodationRating",
      "overallRating",
    ],
  };

  const requiredFields = numericFields[formType] || [];

  return requiredFields.every((field) => {
    const value = data[field];
    return value === undefined || value === null || typeof value === "number";
  });
}

/**
 * Create analytics-ready data structure from linked submissions
 */
export function createAnalyticsData(basicInfo: any, linkedSubmissions: any[]) {
  const analytics = {
    userId: basicInfo.userId,
    submissionId: basicInfo.id,
    basicInfo: basicInfo.data,
    submissionDate: basicInfo.createdAt,
    completionStatus: calculateCompletionPercentage(linkedSubmissions),
    forms: {} as Record<string, any>,
  };

  // Add linked submission data
  linkedSubmissions.forEach((submission) => {
    const formType = submission.type.toLowerCase();
    analytics.forms[formType] = {
      ...submission.data,
      submittedAt: submission.createdAt,
      status: submission.status,
    };
  });

  return analytics;
}
