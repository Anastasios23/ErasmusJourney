export type FormType =
  | "basic-info" // Changed from "basic-information"
  | "course-matching"
  | "accommodation"
  | "living-expenses" // Add this explicitly
  | "help-future-students"
  | "experience" // Add experience/story form
  | "story"; // Legacy support

export type FormStatus = "draft" | "submitted" | "published" | "loading";

// Add form data types for validation
export interface LivingExpensesFormData {
  currency: string;
  rent?: number | string | null;
  food?: number | string | null;
  transport?: number | string | null;
  social?: number | string | null;
  travel?: number | string | null;
  other?: number | string | null;
  spendingHabit?: string;
  budgetTips?: string;
  cheapGroceryPlaces?: string;
  cheapEatingPlaces?: string;
  transportationTips?: string;
  socialLifeTips?: string;
  travelTips?: string;
  overallBudgetAdvice?: string;
  monthlyIncomeAmount?: number | string | null;
}
