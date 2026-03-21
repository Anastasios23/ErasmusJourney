import { z } from "zod";
import {
  BASIC_INFO_LEVEL_OPTIONS,
  BASIC_INFO_PERIOD_OPTIONS,
} from "./basicInformation";
import {
  ACCOMMODATION_TYPE_VALUES,
  BILLS_INCLUDED_VALUES,
  DIFFICULTY_FINDING_ACCOMMODATION_VALUES,
  HOW_FOUND_ACCOMMODATION_VALUES,
} from "./accommodation";
import { COURSE_RECOGNITION_VALUES } from "./courseMatching";

// ============================================
// STEP 1: Basic Information Schemas
// ============================================

const levelOfStudySchema = z.enum(BASIC_INFO_LEVEL_OPTIONS, {
  errorMap: () => ({ message: "Please select a level of study" }),
});

const exchangePeriodSchema = z.enum(BASIC_INFO_PERIOD_OPTIONS, {
  errorMap: () => ({ message: "Please select an exchange period" }),
});

const basicInformationSchemaBase = z.object({
  homeUniversity: z.string().min(1, "Home university is required"),
  homeUniversityId: z.string().optional(),
  homeDepartment: z.string().min(1, "Home department is required"),
  levelOfStudy: levelOfStudySchema,
  hostUniversity: z.string().min(1, "Host university is required"),
  hostUniversityId: z.string().optional(),
  hostCity: z.string().optional(),
  hostCountry: z.string().optional(),
  exchangeAcademicYear: z.string().min(1, "Exchange academic year is required"),
  exchangePeriod: exchangePeriodSchema,
  languageOfInstruction: z.string().optional(),
  exchangeStartDate: z.string().optional(),
  exchangeEndDate: z.string().optional(),
});

// Simplified schema for required fields only to avoid validation errors
export const basicInformationRequiredSchema = basicInformationSchemaBase.pick({
  homeUniversity: true,
  homeDepartment: true,
  levelOfStudy: true,
  hostUniversity: true,
  exchangeAcademicYear: true,
  exchangePeriod: true,
});

// Minimal schema for unified form step components
export const basicInformationStepSchema =
  basicInformationSchemaBase.superRefine((value, context) => {
    if (
      value.exchangeStartDate &&
      value.exchangeEndDate &&
      new Date(value.exchangeStartDate) >= new Date(value.exchangeEndDate)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exchangeEndDate"],
        message: "End date must be after start date",
      });
    }
  });

export const basicInformationDraftSchema = basicInformationSchemaBase
  .partial()
  .superRefine((value, context) => {
    if (
      value.exchangeStartDate &&
      value.exchangeEndDate &&
      new Date(value.exchangeStartDate) >= new Date(value.exchangeEndDate)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["exchangeEndDate"],
        message: "End date must be after start date",
      });
    }
  });

// Full schema for reference (not used for validation)
export const basicInformationSchema = basicInformationStepSchema;

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
        homeCourseCode: z.string().optional(),
        homeCourseName: z.string().min(1, "Home course name is required"),
        homeECTS: z
          .number()
          .min(0.5, "Home ECTS must be greater than 0")
          .max(60, "Home ECTS seems too high"),
        hostCourseCode: z.string().optional(),
        hostCourseName: z.string().min(1, "Host course name is required"),
        hostECTS: z
          .number()
          .min(0.5, "Host ECTS must be greater than 0")
          .max(60, "Host ECTS seems too high"),
        recognitionType: z.enum(COURSE_RECOGNITION_VALUES, {
          errorMap: () => ({ message: "Please select a recognition type" }),
        }),
        notes: z
          .string()
          .max(500, "Notes cannot exceed 500 characters")
          .optional(),
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
        id: z.string().min(1, "Course mapping ID is required"),
        homeCourseCode: z.string().optional(),
        homeCourseName: z
          .string()
          .trim()
          .min(1, "Home course name is required"),
        homeECTS: z
          .number({
            invalid_type_error: "Home ECTS is required",
            required_error: "Home ECTS is required",
          })
          .gt(0, "Home ECTS must be greater than 0"),
        hostCourseCode: z.string().optional(),
        hostCourseName: z
          .string()
          .trim()
          .min(1, "Host course name is required"),
        hostECTS: z
          .number({
            invalid_type_error: "Host ECTS is required",
            required_error: "Host ECTS is required",
          })
          .gt(0, "Host ECTS must be greater than 0"),
        recognitionType: z.enum(COURSE_RECOGNITION_VALUES, {
          errorMap: () => ({ message: "Recognition type is required" }),
        }),
        notes: z
          .string()
          .max(500, "Notes cannot exceed 500 characters")
          .optional(),
      }),
    )
    .min(1, "At least one course mapping is required"),
});

const courseMatchingDraftRowSchema = z.object({
  id: z.string().min(1).optional(),
  homeCourseCode: z.string().optional(),
  homeCourseName: z.string().optional(),
  homeECTS: z.number().nullable().optional(),
  hostCourseCode: z.string().optional(),
  hostCourseName: z.string().optional(),
  hostECTS: z.number().nullable().optional(),
  recognitionType: z
    .union([z.enum(COURSE_RECOGNITION_VALUES), z.literal("")])
    .optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
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
  accommodationType: z.enum(ACCOMMODATION_TYPE_VALUES, {
    errorMap: () => ({ message: "Accommodation type is required" }),
  }),
  monthlyRent: z
    .number({
      invalid_type_error: "Monthly rent is required",
      required_error: "Monthly rent is required",
    })
    .min(0, "Monthly rent cannot be negative")
    .max(10000, "Monthly rent seems too high"),
  currency: z.string().default("EUR"),
  billsIncluded: z.enum(BILLS_INCLUDED_VALUES, {
    errorMap: () => ({ message: "Please specify whether bills are included" }),
  }),
  areaOrNeighborhood: z
    .string()
    .trim()
    .max(120, "Area or neighborhood is too long")
    .optional(),
  minutesToUniversity: z
    .number()
    .int("Minutes to university must be a whole number")
    .min(0, "Minutes to university cannot be negative")
    .max(240, "Minutes to university seems too high")
    .optional(),
  howFoundAccommodation: z.enum(HOW_FOUND_ACCOMMODATION_VALUES).optional(),
  difficultyFindingAccommodation: z
    .enum(DIFFICULTY_FINDING_ACCOMMODATION_VALUES)
    .optional(),
  accommodationRating: z
    .number({
      invalid_type_error: "Accommodation rating is required",
      required_error: "Accommodation rating is required",
    })
    .min(1, "Please provide a rating")
    .max(5),
  wouldRecommend: z.boolean({
    invalid_type_error: "Please say whether you would recommend it",
    required_error: "Please say whether you would recommend it",
  }),
  accommodationReview: z
    .string()
    .trim()
    .max(1000, "Accommodation review is too long")
    .optional(),
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
  courses: courseMatchingStepSchema.shape.courses,
  accommodation: accommodationStepSchema,
  livingExpenses: livingExpensesStepSchema,
  experience: experienceStepSchema,
});

// ============================================
// Partial/Draft Schema (allows incomplete data)
// ============================================
export const erasmusExperienceDraftSchema = z.object({
  basicInfo: basicInformationDraftSchema.optional(),
  courses: z.array(courseMatchingDraftRowSchema).optional(),
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
