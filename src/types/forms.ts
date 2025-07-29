export type FormType =
  | "basic-info" // Changed from "basic-information"
  | "course-matching"
  | "accommodation"
  | "living-expenses" // Add this explicitly
  | "help-future-students";

export type FormStatus = "draft" | "submitted" | "published" | "loading";

// Add form data types for validation
export interface LivingExpensesFormData {
  spendingHabit: string;
  budgetTips: string;
  cheapGroceryPlaces: string;
  cheapEatingPlaces: string;
  transportationTips: string;
  socialLifeTips: string;
  travelTips: string;
  overallBudgetAdvice: string;
  monthlyIncomeAmount: string;
  expenses: Record<string, string>;
  // ... other fields
}
