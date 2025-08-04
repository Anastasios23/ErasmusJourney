/\*

- Multi-Step Erasmus Form Design
-
- This file outlines the structure for a unified multi-step form
- that replaces the current separate form system.
  \*/

// 1. MAIN FORM COMPONENT STRUCTURE
// ================================

// File: pages/erasmus-experience-form.tsx
interface ErasmusFormData {
// Step 1: Basic Information
basicInfo: {
firstName: string;
lastName: string;
email: string;
dateOfBirth: string;
nationality: string;
phoneNumber: string;
homeUniversity: string;
homeDepartment: string;
levelOfStudy: string;
currentYear: string;
studentId: string;
hostUniversity: string;
hostCountry: string;
hostCity: string;
hostDepartment: string;
exchangePeriod: string;
exchangeStartDate: string;
exchangeEndDate: string;
languageOfInstruction: string;
languageProficiencyLevel?: string;
motivationForExchange?: string;
academicGoals?: string;
};

// Step 2: Course Matching
courses: {
hostCourseCount: number;
homeCourseCount: number;
courseMatchingDifficult: string;
courseMatchingChallenges?: string;
recommendCourses: string;
recommendationReason?: string;
hostCourses: Array<{
name: string;
code?: string;
ects: number;
difficulty?: string;
examTypes?: string;
type?: string;
}>;
equivalentCourses: Array<{
hostCourseName: string;
homeCourseName: string;
ects: number;
matchQuality?: string;
}>;
};

// Step 3: Accommodation
accommodation: {
accommodationType: string;
accommodationAddress: string;
neighborhood?: string;
monthlyRent: number;
billsIncluded: string;
avgUtilityCost?: number;
easyToFind: string;
findingChallenges?: string;
bookingLink?: string;
landlordName?: string;
landlordEmail?: string;
landlordPhone?: string;
roomSize?: string;
roomFurnished?: string;
kitchenAccess?: string;
internetIncluded?: string;
laundryAccess?: string;
parkingAvailable?: string;
nearbyAmenities: string[];
transportLinks?: string;
accommodationRating: number;
wouldRecommend: string;
recommendationReason?: string;
additionalNotes?: string;
};

// Step 4: Living Expenses
livingExpenses: {
monthlyRent: number;
monthlyFood?: number;
monthlyTransport?: number;
monthlyEntertainment?: number;
monthlyUtilities?: number;
monthlyOther?: number;
monthlyIncomeAmount?: number;
spendingHabit?: string;
budgetTips?: string;
cheapGroceryPlaces?: string;
cheapEatingPlaces?: string;
transportationTips?: string;
socialLifeTips?: string;
travelTips?: string;
overallBudgetAdvice?: string;
totalMonthlyBudget?: number;
expenses?: Record<string, number>;
};

// Step 5: Experience & Help Future Students
experience: {
personalExperience: string;
adviceForFutureStudents: string;
favoriteMemory?: string;
biggestChallenge?: string;
unexpectedDiscovery?: string;
academicRating?: number;
socialLifeRating?: number;
culturalImmersionRating?: number;
costOfLivingRating?: number;
accommodationRating?: number;
overallRating: number;
socialTips?: string;
culturalTips?: string;
travelTips?: string;
academicTips?: string;
practicalTips?: string;
languagesLearned?: string;
skillsDeveloped?: string;
careerImpact?: string;
personalGrowth?: string;
recommendExchange: string;
recommendationReason?: string;
wantToHelp: string;
helpTopics?: string[];
publicProfile: string;
contactMethod?: string;
email?: string;
nickname?: string;
instagramUsername?: string;
facebookLink?: string;
linkedinProfile?: string;
personalWebsite?: string;
phoneNumber?: string;
};
}

// 2. FORM STATE MANAGEMENT
// ========================

interface FormState {
currentStep: number;
completedSteps: number[];
formData: Partial<ErasmusFormData>;
validationErrors: Record<string, string>;
isSubmitting: boolean;
isDraftSaved: boolean;
lastSavedAt?: Date;
}

// 3. STEP CONFIGURATION
// =====================

interface FormStep {
id: number;
title: string;
subtitle: string;
icon: React.ComponentType;
fields: string[];
validationSchema: any; // Zod schema
isOptional?: boolean;
estimatedTime: string;
}

const FORM_STEPS: FormStep[] = [
{
id: 1,
title: "Basic Information",
subtitle: "Your academic and exchange details",
icon: UserIcon,
fields: ["basicInfo"],
validationSchema: basicInformationSchema,
estimatedTime: "5 min"
},
{
id: 2,
title: "Course Matching",
subtitle: "Academic courses and equivalences",
icon: BookOpenIcon,
fields: ["courses"],
validationSchema: courseMatchingSchema,
estimatedTime: "10 min"
},
{
id: 3,
title: "Accommodation",
subtitle: "Housing details and recommendations",
icon: HomeIcon,
fields: ["accommodation"],
validationSchema: enhancedAccommodationSchema,
estimatedTime: "8 min"
},
{
id: 4,
title: "Living Expenses",
subtitle: "Budget and cost information",
icon: EuroIcon,
fields: ["livingExpenses"],
validationSchema: enhancedLivingExpensesSchema,
estimatedTime: "7 min"
},
{
id: 5,
title: "Share Experience",
subtitle: "Help future Erasmus students",
icon: HeartIcon,
fields: ["experience"],
validationSchema: experienceStorySchema,
estimatedTime: "15 min"
}
];

// 4. DATABASE SCHEMA CHANGES
// ===========================

// Instead of separate submissions, create a single comprehensive submission:

model ErasmusSubmission {
id String @id @default(cuid())
userId String
user User @relation(fields: [userId], references: [id])

// Form step completion tracking
currentStep Int @default(1)
completedSteps Int[] @default([])
isComplete Boolean @default(false)

// All form data in a single JSON field
formData Json

// Metadata
status SubmissionStatus @default(DRAFT)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
submittedAt DateTime?

// Prevent multiple submissions per user
@@unique([userId])
}

enum SubmissionStatus {
DRAFT
IN_PROGRESS
COMPLETED
PUBLISHED
}

// 5. API ENDPOINTS
// ================

// GET /api/erasmus-form/[userId] - Get user's form data
// PUT /api/erasmus-form/[userId] - Save form data (auto-save)
// POST /api/erasmus-form/submit - Submit completed form
// DELETE /api/erasmus-form/[userId] - Delete draft

// 6. COMPONENT STRUCTURE
// ======================

// pages/erasmus-experience-form.tsx - Main form container
// components/forms/
// ├── FormProvider.tsx - Context provider for form state
// ├── StepNavigation.tsx - Progress indicator and navigation
// ├── StepContainer.tsx - Wrapper for each step
// ├── AutoSave.tsx - Auto-save functionality
// └── steps/
// ├── BasicInformationStep.tsx
// ├── CourseMatchingStep.tsx
// ├── AccommodationStep.tsx
// ├── LivingExpensesStep.tsx
// └── ExperienceStep.tsx

export { FORM_STEPS, type ErasmusFormData, type FormState, type FormStep };
