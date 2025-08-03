import * as z from "zod";

// Legacy schemas (keeping for backward compatibility)
export const accommodationFormSchema = z.object({
  accommodationAddress: z.string().min(1, "Address is required"),
  accommodationType: z.string().min(1, "Accommodation type is required"),
  monthlyRent: z.string().min(1, "Monthly rent is required"),
  billsIncluded: z.string().min(1, "Please specify if bills are included"),
  accommodationRating: z.string().min(1, "Please provide a rating"),
  easyToFind: z.string().min(1, "Please indicate if it was easy to find"),
  wouldRecommend: z.string().min(1, "Please indicate if you would recommend"),
});

export const livingExpensesSchema = z.object({
  type: z.literal("living-expenses"),
  title: z.string(),
  data: z.object({
    spendingHabit: z.string().optional(),
    budgetTips: z.string().optional(),
    cheapGroceryPlaces: z.string().optional(),
    cheapEatingPlaces: z.string().optional(),
    transportationTips: z.string().optional(),
    socialLifeTips: z.string().optional(),
    travelTips: z.string().optional(),
    overallBudgetAdvice: z.string().optional(),
    monthlyIncomeAmount: z.string().optional(),
    expenses: z.record(z.string()).optional(),
  }),
});

// ========== ENHANCED SCHEMAS FOR COMPREHENSIVE STUDENT EXPERIENCE DATA ==========

// Basic Information Schema - Core student and exchange details
export const basicInformationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),

  // Academic Information (Home)
  homeUniversity: z.string().min(1, "Home university is required"),
  homeDepartment: z.string().min(1, "Home department is required"),
  levelOfStudy: z.enum(["Bachelor", "Master", "PhD"], {
    required_error: "Level of study is required",
  }),
  currentYear: z.string().min(1, "Current year is required"),
  studentId: z.string().min(1, "Student ID is required"),

  // Exchange Information (Host)
  hostUniversity: z.string().min(1, "Host university is required"),
  hostCountry: z.string().min(1, "Host country is required"),
  hostCity: z.string().min(1, "Host city is required"),
  hostDepartment: z.string().min(1, "Host department is required"),

  // Study Period
  exchangePeriod: z.enum(["Semester", "Full Year"], {
    required_error: "Exchange period is required",
  }),
  exchangeStartDate: z.string().min(1, "Start date is required"),
  exchangeEndDate: z.string().min(1, "End date is required"),

  // Language
  languageOfInstruction: z
    .string()
    .min(1, "Language of instruction is required"),
  languageProficiencyLevel: z.string().optional(),

  // Motivation (optional for basic info, detailed in experience form)
  motivationForExchange: z.string().optional(),
  academicGoals: z.string().optional(),
});

// Enhanced Living Expenses Schema - Detailed budget and cost information with numeric validation
export const enhancedLivingExpensesSchema = z.object({
  // Monthly Expenses (as numbers for calculations)
  monthlyRent: z.coerce
    .number()
    .min(0, "Monthly rent must be positive")
    .optional(),
  monthlyFood: z.coerce
    .number()
    .min(0, "Food expenses must be positive")
    .optional(),
  monthlyTransport: z.coerce
    .number()
    .min(0, "Transport expenses must be positive")
    .optional(),
  monthlyEntertainment: z.coerce
    .number()
    .min(0, "Entertainment expenses must be positive")
    .optional(),
  monthlyUtilities: z.coerce
    .number()
    .min(0, "Utilities must be positive")
    .optional(),
  monthlyOther: z.coerce
    .number()
    .min(0, "Other expenses must be positive")
    .optional(),

  // Income
  monthlyIncomeAmount: z.coerce
    .number()
    .min(0, "Income must be positive")
    .optional(),

  // Budget Tips and Advice
  spendingHabit: z.string().optional(),
  budgetTips: z.string().optional(),
  cheapGroceryPlaces: z.string().optional(),
  cheapEatingPlaces: z.string().optional(),
  transportationTips: z.string().optional(),
  socialLifeTips: z.string().optional(),
  travelTips: z.string().optional(),
  overallBudgetAdvice: z.string().optional(),

  // Calculated fields
  totalMonthlyBudget: z.coerce.number().optional(),
  expenses: z.record(z.coerce.number()).optional(),
});

// Enhanced Accommodation Schema - Detailed housing information with numeric validation
export const enhancedAccommodationSchema = z.object({
  // Basic Accommodation Info
  accommodationType: z.enum([
    "Student Residence",
    "Shared Apartment",
    "Private Apartment",
    "Host Family",
    "Private Room",
    "Studio",
    "Other"
  ], { required_error: "Accommodation type is required" }),

  accommodationAddress: z.string().min(1, "Address is required"),
  neighborhood: z.string().optional(),

  // Cost Information (numeric for calculations)
  monthlyRent: z.coerce.number().min(0, "Monthly rent must be positive"),
  billsIncluded: z.enum(["Yes", "No", "Partially"], {
    required_error: "Please specify if bills are included",
  }),
  avgUtilityCost: z.coerce.number().min(0).optional(),

  // Experience Ratings (1-5 scale)
  accommodationRating: z.coerce
    .number()
    .min(1, "Please provide a rating")
    .max(5, "Rating must be between 1 and 5"),

  // Experience Questions
  easyToFind: z.enum(["Very Easy", "Easy", "Moderate", "Difficult", "Very Difficult"], {
    required_error: "Please indicate difficulty of finding accommodation",
  }),
  wouldRecommend: z.enum(["Definitely", "Probably", "Maybe", "Probably Not", "Definitely Not"], {
    required_error: "Please indicate if you would recommend",
  }),

  // Additional Details
  roommates: z.string().optional(),
  additionalNotes: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

// Course Matching Schema - Academic course information with numeric validation
export const courseMatchingSchema = z.object({
  // Course Counts
  hostCourseCount: z.coerce
    .number()
    .min(1, "Must take at least 1 course")
    .max(20, "Too many courses"),
  homeCourseCount: z.coerce
    .number()
    .min(1, "Must have at least 1 equivalent course")
    .max(20, "Too many courses"),

  // Course Matching Process
  courseMatchingDifficult: z.enum(["Very Easy", "Easy", "Moderate", "Difficult", "Very Difficult"], {
    required_error: "Please rate the difficulty of course matching",
  }),
  courseMatchingChallenges: z.string().optional(),

  // Course Recommendations
  recommendCourses: z.enum(["Yes", "No", "Some"], {
    required_error: "Please indicate if you recommend the courses",
  }),
  recommendationReason: z.string().optional(),

  // Detailed Course Information
  hostCourses: z.array(z.object({
    name: z.string().min(1, "Course name is required"),
    code: z.string().optional(),
    ects: z.coerce.number().min(0).max(30),
    difficulty: z.enum(["Very Easy", "Easy", "Moderate", "Difficult", "Very Difficult"]).optional(),
    examTypes: z.string().optional(),
    type: z.enum(["Core", "Elective", "Language", "Other"]).optional(),
  })).optional(),

  equivalentCourses: z.array(z.object({
    hostCourseName: z.string(),
    homeCourseName: z.string(),
    ects: z.coerce.number().min(0).max(30),
    matchQuality: z.enum(["Perfect", "Good", "Partial", "Poor"]).optional(),
  })).optional(),
});

// Experience Story Schema - Comprehensive experience narrative and ratings
export const experienceStorySchema = z.object({
  // Core Story Elements
  personalExperience: z.string().min(50, "Please provide a detailed personal experience (at least 50 characters)"),
  adviceForFutureStudents: z.string().min(20, "Please provide advice for future students"),
  favoriteMemory: z.string().optional(),
  biggestChallenge: z.string().optional(),
  unexpectedDiscovery: z.string().optional(),

  // Experience Ratings (1-5 scale)
  academicRating: z.coerce
    .number()
    .min(1, "Academic rating must be between 1 and 5")
    .max(5, "Academic rating must be between 1 and 5")
    .optional(),
  socialLifeRating: z.coerce
    .number()
    .min(1, "Social life rating must be between 1 and 5")
    .max(5, "Social life rating must be between 1 and 5")
    .optional(),
  culturalImmersionRating: z.coerce
    .number()
    .min(1, "Cultural immersion rating must be between 1 and 5")
    .max(5, "Cultural immersion rating must be between 1 and 5")
    .optional(),
  costOfLivingRating: z.coerce
    .number()
    .min(1, "Cost of living rating must be between 1 and 5")
    .max(5, "Cost of living rating must be between 1 and 5")
    .optional(),
  accommodationRating: z.coerce
    .number()
    .min(1, "Accommodation rating must be between 1 and 5")
    .max(5, "Accommodation rating must be between 1 and 5")
    .optional(),
  overallRating: z.coerce
    .number()
    .min(1, "Overall rating is required and must be between 1 and 5")
    .max(5, "Overall rating must be between 1 and 5"),

  // Tips by Category
  socialTips: z.string().optional(),
  culturalTips: z.string().optional(),
  travelTips: z.string().optional(),
  academicTips: z.string().optional(),
  practicalTips: z.string().optional(),

  // Personal Development
  languagesLearned: z.string().optional(),
  skillsDeveloped: z.string().optional(),
  careerImpact: z.string().optional(),
  personalGrowth: z.string().optional(),

  // Recommendation
  recommendExchange: z.enum(["yes", "maybe", "no"], {
    required_error: "Please indicate if you would recommend an exchange",
  }),
  recommendationReason: z.string().optional(),

  // Help & Contact Information
  wantToHelp: z.enum(["yes", "maybe", "no"], {
    required_error: "Please indicate if you want to help future students",
  }),
  helpTopics: z.array(z.string()).optional(),

  // Contact Details (conditional validation handled in component)
  publicProfile: z.enum(["yes", "no"], {
    required_error: "Please choose if you want a public profile",
  }),
  contactMethod: z.string().optional(),
  email: z.string().email().optional(),
  nickname: z.string().optional(),
  instagramUsername: z.string().optional(),
  facebookLink: z.string().url().optional().or(z.literal("")),
  linkedinProfile: z.string().url().optional().or(z.literal("")),
  personalWebsite: z.string().url().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
});

// Validation function for all form types
export function validateFormData(type: string, data: any) {
  switch (type) {
    case "experience":
    case "EXPERIENCE":
      return experienceStorySchema.parse(data);
    case "basic-info":
    case "BASIC_INFO":
      return basicInformationSchema.parse(data);
    case "accommodation":
    case "ACCOMMODATION":
      return enhancedAccommodationSchema.parse(data);
    case "living-expenses":
    case "LIVING_EXPENSES":
      return enhancedLivingExpensesSchema.parse(data);
    case "course-matching":
    case "COURSE_MATCHING":
      return courseMatchingSchema.parse(data);
    default:
      // For unknown types, just return the data as-is
      return data;
  }
}

// Enhanced Accommodation Schema - Housing details and recommendations
export const enhancedAccommodationSchema = z.object({
  // Basic Accommodation Info
  accommodationType: z.enum(
    [
      "University Dormitory",
      "Private Apartment",
      "Shared Apartment",
      "Homestay",
      "Student Residence",
      "Other",
    ],
    { required_error: "Accommodation type is required" },
  ),

  accommodationAddress: z.string().min(1, "Address is required"),
  neighborhood: z.string().optional(),

  // Cost Information (as numbers for calculations)
  monthlyRent: z.coerce.number().min(0, "Monthly rent must be positive"),
  billsIncluded: z.enum(["Yes", "No", "Partially"], {
    required_error: "Bills inclusion status is required",
  }),
  avgUtilityCost: z.coerce
    .number()
    .min(0, "Utility cost must be positive")
    .optional(),

  // Finding Accommodation
  easyToFind: z.enum(
    ["Very Easy", "Easy", "Moderate", "Difficult", "Very Difficult"],
    {
      required_error: "Ease of finding accommodation is required",
    },
  ),
  findingChallenges: z.string().optional(),
  bookingLink: z.string().url().optional().or(z.literal("")),

  // Contact Information
  landlordName: z.string().optional(),
  landlordEmail: z.string().email().optional().or(z.literal("")),
  landlordPhone: z.string().optional(),

  // Accommodation Features
  roomSize: z.string().optional(),
  roomFurnished: z
    .enum(["Fully Furnished", "Partially Furnished", "Unfurnished"])
    .optional(),
  kitchenAccess: z.enum(["Private", "Shared", "None"]).optional(),
  internetIncluded: z.enum(["Yes", "No"]).optional(),
  laundryAccess: z.enum(["In-unit", "Shared", "External"]).optional(),
  parkingAvailable: z.enum(["Yes", "No"]).optional(),

  // Nearby Amenities
  nearbyAmenities: z.array(z.string()).default([]),
  transportLinks: z.string().optional(),

  // Rating and Recommendation
  accommodationRating: z.coerce
    .number()
    .min(1)
    .max(5, "Rating must be between 1 and 5"),
  wouldRecommend: z.enum(["Yes", "No"], {
    required_error: "Recommendation status is required",
  }),
  recommendationReason: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// Enhanced Course Matching Schema - Academic experience and course details
export const enhancedCourseMatchingSchema = z.object({
  // Academic Level Info
  levelOfStudy: z.enum(["Bachelor", "Master", "PhD"], {
    required_error: "Level of study is required",
  }),

  // University Information
  homeUniversity: z.string().min(1, "Home university is required"),
  homeDepartment: z.string().min(1, "Home department is required"),
  hostUniversity: z.string().min(1, "Host university is required"),
  hostDepartment: z.string().min(1, "Host department is required"),

  // Course Numbers
  hostCourseCount: z.coerce
    .number()
    .min(1, "Number of host courses must be at least 1"),
  homeCourseCount: z.coerce
    .number()
    .min(1, "Number of home courses must be at least 1"),

  // Course Matching Experience
  courseMatchingDifficult: z.enum(
    ["Very Easy", "Easy", "Moderate", "Difficult", "Very Difficult"],
    {
      required_error: "Course matching difficulty is required",
    },
  ),
  courseMatchingChallenges: z.string().optional(),

  // Recommendations
  recommendCourses: z.enum(["Yes", "No"], {
    required_error: "Course recommendation status is required",
  }),
  recommendationReason: z.string().optional(),

  // Course Details (dynamic arrays)
  hostCourses: z
    .array(
      z.object({
        name: z.string().min(1, "Course name is required"),
        code: z.string().min(1, "Course code is required"),
        ects: z.coerce.number().min(1, "ECTS must be at least 1"),
        difficulty: z.enum([
          "Very Easy",
          "Easy",
          "Moderate",
          "Difficult",
          "Very Difficult",
        ]),
        examTypes: z.array(z.string()).default([]),
      }),
    )
    .default([]),

  equivalentCourses: z
    .array(
      z.object({
        name: z.string().min(1, "Course name is required"),
        code: z.string().min(1, "Course code is required"),
        ects: z.coerce.number().min(1, "ECTS must be at least 1"),
      }),
    )
    .default([]),

  // Additional Academic Info
  gradingSystem: z.string().optional(),
  academicWorkload: z
    .enum(["Very Light", "Light", "Moderate", "Heavy", "Very Heavy"])
    .optional(),
  teachingStyle: z.string().optional(),
});

// Experience/Story Schema - Comprehensive narrative and ratings
export const experienceSchema = z.object({
  // Overall Experience
  overallExperienceTitle: z.string().min(1, "Experience title is required"),
  overallExperienceContent: z
    .string()
    .min(100, "Experience content must be at least 100 characters"),

  // Ratings (1-5 scale for calculations)
  academicRating: z.coerce
    .number()
    .min(1)
    .max(5, "Academic rating must be between 1 and 5"),
  socialLifeRating: z.coerce
    .number()
    .min(1)
    .max(5, "Social life rating must be between 1 and 5"),
  culturalImmersionRating: z.coerce
    .number()
    .min(1)
    .max(5, "Cultural immersion rating must be between 1 and 5"),
  costOfLivingRating: z.coerce
    .number()
    .min(1)
    .max(5, "Cost of living rating must be between 1 and 5"),
  accommodationRating: z.coerce
    .number()
    .min(1)
    .max(5, "Accommodation rating must be between 1 and 5"),
  overallRating: z.coerce
    .number()
    .min(1)
    .max(5, "Overall rating must be between 1 and 5"),

  // Detailed Tips and Advice
  socialTips: z.string().optional(),
  culturalTips: z.string().optional(),
  travelTips: z.string().optional(),
  academicTips: z.string().optional(),

  // Challenges and Solutions
  biggestChallenges: z.string().optional(),
  howToOvercomeChallenges: z.string().optional(),

  // Highlights and Memories
  bestMemories: z.string().optional(),
  mustVisitPlaces: z.string().optional(),

  // Recommendations
  wouldRecommendExchange: z.enum(
    ["Definitely", "Probably", "Maybe", "Probably Not", "Definitely Not"],
    {
      required_error: "Recommendation status is required",
    },
  ),
  wouldRecommendDestination: z.enum(
    ["Definitely", "Probably", "Maybe", "Probably Not", "Definitely Not"],
    {
      required_error: "Destination recommendation is required",
    },
  ),
  adviceForFutureStudents: z.string().optional(),

  // Additional Information
  surprisesAndExpectations: z.string().optional(),
  personalGrowth: z.string().optional(),
  languageImprovement: z.string().optional(),
  careerImpact: z.string().optional(),

  // Media and Documentation
  photos: z
    .array(
      z.object({
        url: z.string().url(),
        caption: z.string().optional(),
        location: z.string().optional(),
      }),
    )
    .default([]),

  // Contact for future questions
  openToQuestions: z.enum(["Yes", "No"], {
    required_error: "Openness to questions is required",
  }),
  preferredContactMethod: z
    .enum(["Email", "Social Media", "Platform Message"])
    .optional(),
});

// Combined submission schema for validation
export const formSubmissionSchema = z.object({
  type: z.enum([
    "BASIC_INFO",
    "LIVING_EXPENSES",
    "ACCOMMODATION",
    "COURSE_MATCHING",
    "EXPERIENCE",
  ]),
  title: z.string().min(1, "Title is required"),
  data: z.object({}).passthrough(), // Allow any data structure
  status: z
    .enum(["DRAFT", "SUBMITTED", "PUBLISHED", "ARCHIVED"])
    .default("SUBMITTED"),
  basicInfoId: z.string().optional(), // Reference to basic info submission
});

// Type exports for TypeScript
export type BasicInformationData = z.infer<typeof basicInformationSchema>;
export type EnhancedLivingExpensesData = z.infer<
  typeof enhancedLivingExpensesSchema
>;
export type EnhancedAccommodationData = z.infer<
  typeof enhancedAccommodationSchema
>;
export type EnhancedCourseMatchingData = z.infer<
  typeof enhancedCourseMatchingSchema
>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type FormSubmissionData = z.infer<typeof formSubmissionSchema>;

// Form validation function
export function validateFormData(type: string, data: any) {
  switch (type) {
    case "BASIC_INFO":
    case "basic-info":
      return basicInformationSchema.parse(data);
    case "LIVING_EXPENSES":
    case "living-expenses":
      return enhancedLivingExpensesSchema.parse(data);
    case "ACCOMMODATION":
    case "accommodation":
      return enhancedAccommodationSchema.parse(data);
    case "COURSE_MATCHING":
    case "course-matching":
      return enhancedCourseMatchingSchema.parse(data);
    case "EXPERIENCE":
    case "experience":
    case "story":
      return experienceSchema.parse(data);
    default:
      throw new Error(`Unknown form type: ${type}`);
  }
}
