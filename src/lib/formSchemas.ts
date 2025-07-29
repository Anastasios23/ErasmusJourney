import * as z from "zod";

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

// Add other form schemas here...
