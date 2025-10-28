import { z } from "zod";

/**
 * Validation schemas for submission data
 *
 * Enforces:
 * - EUR currency only
 * - Prices as integers (cents)
 * - Required fields
 * - Data quality constraints
 */

// Accommodation submission schema
export const AccommodationSubmissionSchema = z.object({
  type: z.enum([
    "STUDENT_RESIDENCE",
    "APARTMENT",
    "SHARED",
    "STUDIO",
    "HOMESTAY",
    "OTHER",
  ]),
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  monthlyRentCents: z
    .number()
    .int("Rent must be an integer (cents)")
    .min(10000, "Minimum rent is €100")
    .max(500000, "Maximum rent is €5000"),
  currency: z.literal("EUR"),
  city: z.string().min(2),
  country: z.string().min(2),
  neighborhood: z.string().optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000),
  pros: z
    .array(z.string().min(3).max(200))
    .min(1, "Add at least 1 pro")
    .max(10, "Maximum 10 pros"),
  cons: z
    .array(z.string().min(3).max(200))
    .min(1, "Add at least 1 con")
    .max(10, "Maximum 10 cons"),
  photos: z.array(z.string().url()).optional(),
  bookingUrl: z.string().url().optional(),
  contactInfo: z.string().optional(),
});

// Course exchange submission schema
export const CourseExchangeSchema = z.object({
  homeCourse: z.string().min(3, "Home course name required").max(200),
  hostCourse: z.string().min(3, "Host course name required").max(200),
  ects: z.number().int().min(1, "Minimum 1 ECTS").max(30, "Maximum 30 ECTS"),
  hostUniversity: z.string().min(3).max(200),
  semester: z.string().min(2),
  studyLevel: z.enum(["BACHELOR", "MASTER", "PHD"]).optional(),
  fieldOfStudy: z.string().optional(),
  courseQuality: z
    .number()
    .min(1, "Minimum rating is 1")
    .max(5, "Maximum rating is 5")
    .optional(),
  description: z.string().min(20).max(2000).optional(),
  workload: z.string().optional(),
  language: z.string().optional(),
  approved: z.boolean().optional(),
});

// Full experience submission schema
export const FullExperienceSchema = z.object({
  // Basic Info
  basicInfo: z.object({
    hostCity: z.string().min(2),
    hostCountry: z.string().min(2),
    hostUniversity: z.string().min(3),
    semester: z.string().min(2),
    academicYear: z.string().regex(/^\d{4}\/\d{4}$/),
    studyLevel: z.enum(["BACHELOR", "MASTER", "PHD"]),
    fieldOfStudy: z.string().optional(),
    duration: z.number().int().min(1).max(12).optional(), // months
  }),

  // Accommodation
  accommodation: AccommodationSubmissionSchema.optional(),

  // Courses
  courses: z
    .array(CourseExchangeSchema)
    .min(1, "Add at least 1 course")
    .max(15),

  // Living Expenses (all in cents, EUR)
  livingExpenses: z
    .object({
      monthlyFoodCents: z.number().int().min(0).optional(),
      monthlyTransportCents: z.number().int().min(0).optional(),
      monthlyEntertainmentCents: z.number().int().min(0).optional(),
      monthlyOtherCents: z.number().int().min(0).optional(),
      oneTimeExpensesCents: z.number().int().min(0).optional(),
      currency: z.literal("EUR"),
      notes: z.string().max(1000).optional(),
    })
    .optional(),

  // Overall Experience
  experience: z
    .object({
      overallRating: z.number().min(1).max(5),
      academicRating: z.number().min(1).max(5).optional(),
      socialRating: z.number().min(1).max(5).optional(),
      locationRating: z.number().min(1).max(5).optional(),
      highlights: z.string().min(20).max(2000),
      challenges: z.string().optional(),
      tips: z.array(z.string().min(10).max(500)).max(10).optional(),
      wouldRecommend: z.boolean(),
    })
    .optional(),
});

// Quick tip submission schema
export const QuickTipSchema = z.object({
  city: z.string().min(2),
  country: z.string().min(2),
  category: z.enum([
    "ACCOMMODATION",
    "TRANSPORT",
    "FOOD",
    "SOCIAL",
    "ACADEMIC",
    "VISA",
    "MONEY",
    "OTHER",
  ]),
  tip: z.string().min(20, "Tip must be at least 20 characters").max(500),
  title: z.string().min(5).max(100).optional(),
});

// Destination info submission schema
export const DestinationInfoSchema = z.object({
  city: z.string().min(2),
  country: z.string().min(2),
  description: z.string().min(50).max(5000),
  climate: z.string().optional(),
  costOfLivingDescription: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  photos: z.array(z.string().url()).optional(),
});

// Main submission wrapper
export const SubmissionDataSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ACCOMMODATION"),
    data: AccommodationSubmissionSchema,
  }),
  z.object({
    type: z.literal("COURSE_EXCHANGE"),
    data: CourseExchangeSchema,
  }),
  z.object({
    type: z.literal("FULL_EXPERIENCE"),
    data: FullExperienceSchema,
  }),
  z.object({
    type: z.literal("QUICK_TIP"),
    data: QuickTipSchema,
  }),
  z.object({
    type: z.literal("DESTINATION_INFO"),
    data: DestinationInfoSchema,
  }),
]);

// Helper function to convert euros to cents
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

// Helper function to convert cents to euros
export function centsToEuros(cents: number): number {
  return cents / 100;
}

// Helper to format price
export function formatPrice(cents: number, currency: string = "EUR"): string {
  const euros = centsToEuros(cents);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(euros);
}

// Validation helper for API routes
export function validateSubmission(data: unknown) {
  try {
    return {
      success: true,
      data: SubmissionDataSchema.parse(data),
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        data: null,
        error: {
          message: "Validation failed",
          issues: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
      };
    }
    return {
      success: false,
      data: null,
      error: { message: "Unknown validation error" },
    };
  }
}

// Type exports
export type AccommodationSubmission = z.infer<
  typeof AccommodationSubmissionSchema
>;
export type CourseExchangeSubmission = z.infer<typeof CourseExchangeSchema>;
export type FullExperienceSubmission = z.infer<typeof FullExperienceSchema>;
export type QuickTipSubmission = z.infer<typeof QuickTipSchema>;
export type DestinationInfoSubmission = z.infer<typeof DestinationInfoSchema>;
