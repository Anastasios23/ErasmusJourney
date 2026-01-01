import { z } from "zod";

// ============================================
// STEP 1: Basic Information Schemas
// ============================================

// Simplified schema for required fields only to avoid validation errors
export const basicInformationRequiredSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  universityInCyprus: z.string().min(1, "Cyprus university is required"),
  departmentInCyprus: z.string().min(1, "Department is required"),
  levelOfStudy: z.enum(["bachelor", "master", "phd"], {
    errorMap: () => ({ message: "Please select a level of study" }),
  }),
  currentYear: z.string().min(1, "Academic year is required"),

  hostUniversity: z.string().min(1, "Host university is required"),
  hostCountry: z.string().min(1, "Host country is required"),
  hostCity: z.string().min(1, "Host city is required"),
  exchangePeriod: z.enum(["semester1", "semester2", "full_year"], {
    errorMap: () => ({ message: "Please select exchange period" }),
  }),
});

// Minimal schema for unified form step components
export const basicInformationStepSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  homeUniversity: z.string().min(1, "Home university is required"),
  hostUniversity: z.string().min(1, "Host university is required"),
  hostCountry: z.string().min(1, "Host country is required"),
  hostCity: z.string().min(1, "Host city is required"),
  exchangePeriod: z.string().min(1, "Exchange period is required"),
  currentYear: z.string().min(1, "Current year is required"),
  // Optional fields
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  phoneNumber: z.string().optional(),
  homeUniversityId: z.string().optional(),
  hostUniversityId: z.string().optional(),
  homeDepartment: z.string().optional(),
  hostDepartment: z.string().optional(),
  levelOfStudy: z.string().optional(),
  studentId: z.string().optional(),
  exchangeStartDate: z.string().optional(),
  exchangeEndDate: z.string().optional(),
  languageOfInstruction: z.string().optional(),
  languageProficiencyLevel: z.string().optional(),
  motivationForExchange: z.string().optional(),
  academicGoals: z.string().optional(),
});

// Full schema for reference (not used for validation)
export const basicInformationSchema = z.object({
  // Personal Information
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),

  // Academic Information
  universityInCyprus: z.string().min(1, "Cyprus university is required"),
  departmentInCyprus: z.string().min(1, "Department is required"),
  levelOfStudy: z.enum(["bachelor", "master", "phd"], {
    errorMap: () => ({ message: "Please select a level of study" }),
  }),
  currentYear: z.string().optional(),
  gpa: z.string().optional(),
  studentId: z.string().optional(),
  academicAdvisor: z.string().optional(),

  // Exchange Information
  exchangePeriod: z.enum(["semester1", "semester2", "full_year"], {
    errorMap: () => ({ message: "Please select exchange period" }),
  }),
  exchangeStartDate: z.string().optional(),
  exchangeEndDate: z.string().optional(),
  hostUniversity: z.string().min(1, "Host university is required"),
  hostCountry: z.string().min(1, "Host country is required"),
  hostCity: z.string().min(1, "Host city is required"),
  hostDepartment: z.string().min(1, "Host department is required"),
  hostCoordinator: z.string().optional(),

  // Language Requirements
  languageOfInstruction: z.string().optional(),
  languageProficiencyLevel: z.string().optional(),
  languageCertificates: z.string().optional(),

  // Motivation and Goals
  motivationForExchange: z.string().optional(),
  academicGoals: z.string().optional(),
  personalGoals: z.string().optional(),
  careerGoals: z.string().optional(),

  // Additional Information
  previousExchangeExperience: z.string().optional(),
  extracurricularActivities: z.string().optional(),
  specialNeeds: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  medicalConditions: z.string().optional(),
  additionalNotes: z.string().max(1000, "Notes too long").optional(),

  // Preferences
  accommodationPreference: z.string().optional(),
  buddyProgramInterest: z.string().optional(),
  orientationProgramInterest: z.string().optional(),
});

// Course Matching Form Schema
export const courseMappingSchema = z.object({
  levelOfStudy: z.enum(["bachelor", "master", "phd"]),
  hostUniversity: z.string().min(1, "Host university is required"),
  hostDepartment: z.string().min(1, "Host department is required"),
  homeUniversity: z.string().min(1, "Home university is required"),
  homeDepartment: z.string().min(1, "Home department is required"),

  courses: z
    .array(
      z.object({
        hostCourseCode: z.string().min(1, "Course code is required"),
        hostCourseName: z.string().min(1, "Course name is required"),
        hostCourseCredits: z
          .number()
          .min(1, "Credits must be at least 1")
          .max(30, "Credits too high"),
        difficulty: z.enum(["easy", "medium", "hard"], {
          errorMap: () => ({ message: "Please select difficulty level" }),
        }),
        examTypes: z
          .array(z.string())
          .min(1, "At least one exam type required"),
        grade: z.string().optional(),

        // Cyprus equivalent
        cyprusCourseCode: z.string().min(1, "Cyprus course code is required"),
        cyprusCourseName: z.string().min(1, "Cyprus course name is required"),
        cyprusCourseCredits: z
          .number()
          .min(1, "Credits must be at least 1")
          .max(30, "Credits too high"),
        transferApproved: z.boolean(),
      }),
    )
    .min(1, "At least one course mapping is required"),

  overallExperience: z
    .string()
    .max(1000, "Experience description too long")
    .optional(),
  recommendationNotes: z
    .string()
    .max(500, "Recommendation notes too long")
    .optional(),
});

// ============================================
// STEP 2: Course Matching - Minimal Schema for Step Component
// ============================================
export const courseMatchingStepSchema = z.object({
  courses: z
    .array(
      z.object({
        id: z.string(),
        homeCourseCode: z.string().optional(),
        homeCourseName: z.string().min(1, "Home course name is required"),
        homeCredits: z.string().min(1, "Credits are required"),
        hostCourseCode: z.string().optional(),
        hostCourseName: z.string().min(1, "Host course name is required"),
        hostCredits: z.string().min(1, "Credits are required"),
      }),
    )
    .min(1, "At least one course mapping is required"),
});

// Accommodation Form Schema
export const accommodationSchema = z.object({
  // Basic Information
  accommodationType: z.enum(
    [
      "private_apartment",
      "shared_apartment",
      "student_residence",
      "homestay",
      "other",
    ],
    {
      errorMap: () => ({ message: "Please select accommodation type" }),
    },
  ),
  city: z.string().min(1, "City is required"),
  neighborhood: z.string().min(1, "Neighborhood is required"),
  address: z.string().min(1, "Address is required"),

  // Cost Information
  monthlyRent: z
    .number()
    .min(0, "Rent cannot be negative")
    .max(5000, "Rent seems too high"),
  billsIncluded: z.enum(["yes", "no", "partial"], {
    errorMap: () => ({ message: "Please specify if bills are included" }),
  }),
  avgUtilityCost: z
    .number()
    .min(0, "Utility cost cannot be negative")
    .optional(),

  // Contact Information
  landlordName: z.string().min(1, "Landlord name is required"),
  landlordEmail: z.string().email("Invalid email address").optional(),
  landlordPhone: z.string().min(1, "Landlord phone is required"),
  bookingLink: z.string().url("Invalid URL").optional(),

  // Rating and Experience
  accommodationRating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  easyToFind: z.enum(
    ["very_easy", "easy", "moderate", "difficult", "very_difficult"],
    {
      errorMap: () => ({ message: "Please rate how easy it was to find" }),
    },
  ),
  findingChallenges: z
    .string()
    .max(500, "Challenges description too long")
    .optional(),
  wouldRecommend: z.enum(["yes", "no", "maybe"], {
    errorMap: () => ({
      message: "Please specify if you'd recommend this place",
    }),
  }),
  recommendationReason: z
    .string()
    .max(500, "Recommendation reason too long")
    .optional(),

  // Property Details
  roomSize: z.string().optional(),
  roomFurnished: z.enum(["fully", "partially", "unfurnished"]).optional(),
  kitchenAccess: z.enum(["private", "shared", "none"]).optional(),
  internetIncluded: z.boolean().optional(),
  laundryAccess: z.enum(["in_unit", "building", "nearby", "none"]).optional(),
  parkingAvailable: z.boolean().optional(),

  // Amenities and Transport
  nearbyAmenities: z.array(z.string()).optional(),
  transportLinks: z
    .string()
    .max(300, "Transport links description too long")
    .optional(),
  additionalNotes: z.string().max(1000, "Additional notes too long").optional(),
});

// ============================================
// STEP 3: Accommodation - Minimal Schema for Step Component
// ============================================
export const accommodationStepSchema = z.object({
  type: z.string().min(1, "Accommodation type is required"),
  rent: z.string().min(1, "Monthly rent is required"),
  currency: z.string().default("EUR"),
  rating: z.number().min(1, "Please provide a rating").max(5),
  review: z.string().min(1, "Please write a brief review"),
  // Optional fields
  duration: z.string().optional(),
  address: z.string().optional(),
  distanceToUniversity: z.string().optional(),
});

// Living Expenses Form Schema
export const livingExpensesSchema = z.object({
  type: z.literal("living-expenses"),
  title: z.string(),
  data: z.object({
    spendingHabit: z.string().optional(),
    expenses: z.object({
      groceries: z.string(),
      transportation: z.string(),
      eatingOut: z.string(),
      socialLife: z.string(),
      travel: z.string(),
      otherExpenses: z.string(),
    }),
    monthlyIncomeAmount: z.string().optional(),
    // ... other fields optional
  }),
});

// ============================================
// STEP 4: Living Expenses - Minimal Schema for Step Component
// ============================================
export const livingExpensesStepSchema = z.object({
  currency: z.string().default("EUR"),
  rent: z.string().optional(), // Pre-filled from accommodation
  food: z.string().min(1, "Food expenses are required"),
  transport: z.string().min(1, "Transport expenses are required"),
  social: z.string().min(1, "Social expenses are required"),
  travel: z.string().min(1, "Travel expenses are required"),
  other: z.string().optional(),
});

// Help Future Students Form Schema
export const helpFutureStudentsSchema = z.object({
  // Mentor Information
  mentorName: z.string().min(1, "Name is required").max(100, "Name too long"),
  mentorEmail: z.string().email("Invalid email address"),
  cyprusUniversity: z.string().min(1, "Cyprus university is required"),
  hostUniversity: z.string().min(1, "Host university is required"),
  exchangeYear: z.string().min(1, "Exchange year is required"),

  // Availability
  availableForMentoring: z.boolean(),
  preferredContactMethod: z.enum(
    ["email", "video_call", "phone", "messaging"],
    {
      errorMap: () => ({ message: "Please select preferred contact method" }),
    },
  ),
  availableTopics: z
    .array(z.string())
    .min(1, "Please select at least one topic you can help with"),

  // Experience Summary
  exchangeHighlights: z
    .string()
    .min(50, "Please provide more detailed highlights")
    .max(1000, "Highlights too long"),
  challengesFaced: z
    .string()
    .min(20, "Please describe challenges faced")
    .max(500, "Challenges description too long"),
  adviceForFuture: z
    .string()
    .min(50, "Please provide more detailed advice")
    .max(1000, "Advice too long"),

  // Contact Preferences
  responseTimeExpected: z.enum(["24_hours", "48_hours", "week", "flexible"], {
    errorMap: () => ({ message: "Please specify expected response time" }),
  }),
  languagesSpoken: z
    .array(z.string())
    .min(1, "Please specify at least one language"),
  mentorshipDuration: z.enum(
    ["before_exchange", "during_exchange", "after_exchange", "all_phases"],
    {
      errorMap: () => ({
        message: "Please specify when you can provide mentorship",
      }),
    },
  ),

  // Additional Information
  socialMediaHandles: z
    .string()
    .max(200, "Social media handles too long")
    .optional(),
  additionalNotes: z.string().max(500, "Additional notes too long").optional(),
});

// ============================================
// STEP 5: Experience/Help Future Students - Minimal Schema for Step Component
// ============================================
export const experienceStepSchema = z.object({
  overallRating: z
    .number()
    .min(1, "Please rate your overall experience")
    .max(5),
  bestExperience: z.string().min(1, "Please share your best experience"),
  generalTips: z.string().min(1, "Please share your tips"),
  // Optional fields
  worstExperience: z.string().optional(),
  academicAdvice: z.string().optional(),
  socialAdvice: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

// ============================================
// Combined Form Data Schema (for final submission)
// ============================================
export const erasmusExperienceFormSchema = z.object({
  basicInfo: basicInformationStepSchema,
  courses: z.array(z.any()), // Flexible for course mappings
  accommodation: accommodationStepSchema,
  livingExpenses: livingExpensesStepSchema,
  experience: experienceStepSchema,
});

// ============================================
// Partial/Draft Schema (allows incomplete data)
// ============================================
export const erasmusExperienceDraftSchema = z.object({
  basicInfo: basicInformationStepSchema.partial().optional(),
  courses: z.array(z.any()).optional(),
  accommodation: accommodationStepSchema.partial().optional(),
  livingExpenses: livingExpensesStepSchema.partial().optional(),
  experience: experienceStepSchema.partial().optional(),
  currentStep: z.number().optional(),
  completedSteps: z.array(z.number()).optional(),
});

// Export type definitions for TypeScript
export type BasicInformationFormData = z.infer<typeof basicInformationSchema>;
export type BasicInformationStepData = z.infer<
  typeof basicInformationStepSchema
>;
export type CourseMappingFormData = z.infer<typeof courseMappingSchema>;
export type CourseMatchingStepData = z.infer<typeof courseMatchingStepSchema>;
export type AccommodationFormData = z.infer<typeof accommodationSchema>;
export type AccommodationStepData = z.infer<typeof accommodationStepSchema>;
export type LivingExpensesFormData = z.infer<typeof livingExpensesSchema>;
export type LivingExpensesStepData = z.infer<typeof livingExpensesStepSchema>;
export type HelpFutureStudentsFormData = z.infer<
  typeof helpFutureStudentsSchema
>;
export type ExperienceStepData = z.infer<typeof experienceStepSchema>;
export type ErasmusExperienceFormData = z.infer<
  typeof erasmusExperienceFormSchema
>;
export type ErasmusExperienceDraftData = z.infer<
  typeof erasmusExperienceDraftSchema
>;

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validate a single step's data
 */
export function validateStep(
  step: number,
  data: any,
): { success: boolean; errors: Record<string, string> } {
  const schemas: Record<number, z.ZodSchema> = {
    1: basicInformationStepSchema,
    2: courseMatchingStepSchema,
    3: accommodationStepSchema,
    4: livingExpensesStepSchema,
    5: experienceStepSchema,
  };

  const schema = schemas[step];
  if (!schema) {
    return { success: false, errors: { _form: "Invalid step number" } };
  }

  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join(".");
    errors[path || "_form"] = err.message;
  });

  return { success: false, errors };
}

/**
 * Validate the entire form for submission
 */
export function validateFullForm(data: any): {
  success: boolean;
  errors: Record<string, string>;
} {
  const result = erasmusExperienceFormSchema.safeParse(data);
  if (result.success) {
    return { success: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join(".");
    errors[path || "_form"] = err.message;
  });

  return { success: false, errors };
}

/**
 * Get step-specific validation schema
 */
export function getStepSchema(step: number): z.ZodSchema | null {
  const schemas: Record<number, z.ZodSchema> = {
    1: basicInformationStepSchema,
    2: courseMatchingStepSchema,
    3: accommodationStepSchema,
    4: livingExpensesStepSchema,
    5: experienceStepSchema,
  };

  return schemas[step] || null;
}
