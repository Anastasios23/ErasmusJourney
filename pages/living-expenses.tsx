import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Textarea } from "../src/components/ui/textarea";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { EnhancedInput } from "../src/components/ui/enhanced-input";
import {
  EnhancedSelect,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
  EnhancedSelectContent,
  EnhancedSelectItem,
} from "../src/components/ui/enhanced-select";
import { EnhancedTextarea } from "../src/components/ui/enhanced-textarea";
import {
  FormField,
  FormSection,
  FormGrid,
  DisabledFieldHint,
} from "../src/components/ui/form-components";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Separator } from "../src/components/ui/separator";
import Header from "../components/Header";
import { SubmissionGuard } from "../components/SubmissionGuard";
import {
  ArrowRight,
  ArrowLeft,
  Euro,
  Calculator,
  TrendingDown,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { useNotifications } from "../src/hooks/useNotifications";
import { useErasmusExperience } from "../src/hooks/useErasmusExperience";
import { FormType } from "../src/types/forms";
import { ValidationError } from "../src/utils/apiErrorHandler";
import { useFormProgress } from "../src/context/FormProgressContext";
import { FormProgressBar } from "../components/forms/FormProgressBar";
import { StepNavigation } from "../components/forms/StepNavigation";
import { StepGuard } from "../components/forms/StepGuard";

interface ExpenseCategory {
  groceries: string;
  transportation: string;
  eatingOut: string;
  socialLife: string;
  travel: string;
  otherExpenses: string;
}

export default function LivingExpenses() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session } = useSession();
  const session = { user: { id: "anonymous", email: "anonymous@example.com" } }; // Mock session for dev
  const router = useRouter();
  const { addNotification } = useNotifications();
  const {
    setCurrentStep,
    markStepCompleted,
    currentStepNumber,
    completedStepNumbers,
  } = useFormProgress();

  // Experience hook for new single-submission system
  const {
    data: experienceData,
    loading: experienceLoading,
    error: experienceError,
    saveProgress,
    submitExperience,
  } = useErasmusExperience();

  const [formData, setFormData] = useState({
    spendingHabit: "",
    budgetTips: "",
    cheapGroceryPlaces: "",
    cheapEatingPlaces: "",
    transportationTips: "",
    socialLifeTips: "",
    travelTips: "",
    overallBudgetAdvice: "",
    monthlyIncomeSource: "",
    monthlyIncomeAmount: "",
    biggestExpense: "",
    unexpectedCosts: "",
    moneyManagementTools: "",
    currencyExchangeTips: "",
  });

  const [expenses, setExpenses] = useState<ExpenseCategory>({
    groceries: "",
    transportation: "",
    eatingOut: "",
    socialLife: "",
    travel: "",
    otherExpenses: "",
  });

  // Add loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load saved data when component mounts
  // Load experience data when component mounts
  useEffect(() => {
    if (!experienceLoading && experienceData) {
      console.log(
        "Loading experience data for living expenses:",
        experienceData,
      );

      // Load living expenses data if available
      if (experienceData.livingExpenses) {
        const livingData = experienceData.livingExpenses;
        console.log("Loading living expenses data:", livingData);

        if (livingData.expenses) {
          // Ensure all expense values are strings, not undefined
          const safeExpenses = Object.entries(livingData.expenses).reduce(
            (acc, [key, value]) => {
              acc[key as keyof ExpenseCategory] = (value as string) ?? "";
              return acc;
            },
            {} as ExpenseCategory,
          );
          setExpenses(safeExpenses);
        }

        // Remove expenses from formData to avoid duplication
        const { expenses: _, ...restData } = livingData;

        // Ensure all form data values are strings, not undefined
        const safeFormData = Object.entries(restData).reduce(
          (acc, [key, value]) => {
            acc[key] = value ?? "";
            return acc;
          },
          {} as Record<string, any>,
        );

        setFormData(safeFormData as any);
      }
    }
  }, [experienceLoading, experienceData]);

  useEffect(() => {
    setCurrentStep("living-expenses");
  }, [setCurrentStep]);

  // Save to localStorage helper function - defined early for use in useEffect
  const saveToLocalStorage = useCallback(() => {
    const draftKey = `erasmus_form_living-expenses`;
    const draftData = {
      type: "living-expenses",
      title: "Living Expenses Draft",
      data: {
        ...formData,
        expenses: expenses,
      },
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
  }, [formData, expenses]);

  // Auto-save to localStorage only (not API) when form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        Object.values(formData).some((value) =>
          typeof value === "string" ? value.trim() !== "" : !!value,
        ) ||
        Object.values(expenses).some((value) =>
          typeof value === "string" ? value.trim() !== "" : !!value,
        )
      ) {
        saveToLocalStorage();
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [formData, expenses, saveToLocalStorage]);

  // Save to localStorage before navigation/page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        Object.values(formData).some((value) =>
          typeof value === "string" ? value.trim() !== "" : !!value,
        ) ||
        Object.values(expenses).some((value) =>
          typeof value === "string" ? value.trim() !== "" : !!value,
        )
      ) {
        saveToLocalStorage();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, expenses, saveToLocalStorage]);

  // State for draft success/error messages
  const [draftSuccess, setDraftSuccess] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Save draft to database (triggered by Save Draft button)
  const handleSaveDraftToDatabase = useCallback(async () => {
    try {
      const livingExpensesData = {
        ...formData,
        expenses: expenses,
      };

      await saveProgress({
        livingExpenses: livingExpensesData,
      });

      setDraftSuccess("Draft saved successfully!");
      toast.success("Draft saved successfully!");
      setTimeout(() => setDraftSuccess(null), 3000);
    } catch (error) {
      console.error("Draft save error:", error);
      setDraftError("Failed to save draft. Please try again.");
      toast.error("Failed to save draft. Please try again.");
      setTimeout(() => setDraftError(null), 5000);
      throw error;
    }
  }, [formData, expenses, saveProgress]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpenseChange = (
    category: keyof ExpenseCategory,
    value: string,
  ) => {
    setExpenses((prev) => ({ ...prev, [category]: value }));
  };

  const getTotalExpenses = () => {
    const total = Object.values(expenses).reduce((sum, expense) => {
      const amount = parseFloat(expense) || 0;
      return sum + amount;
    }, 0);
    return total;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Validation
    const incomplete = !expenses.groceries || !expenses.transportation || !expenses.socialLife || !expenses.travel;
    if (incomplete) {
       const msg = "Please provide estimates for all core monthly expense categories.";
       setSubmitError(msg);
       toast.error(msg);
       setIsSubmitting(false);
       return;
    }

    // Always save to localStorage first when navigating
    saveToLocalStorage();

    try {
      const livingExpensesData = {
        ...formData,
        expenses: expenses,
      };

      // Save the current step data
      const saved = await saveProgress({
        livingExpenses: livingExpensesData,
      });

      if (!saved) {
        throw new Error("Failed to save progress. Please try again.");
      }

      // Mark step 4 as completed (wait for it to finish)
      await markStepCompleted("living-expenses");

      // Navigate to final step (Help Future Students)
      router.push("/help-future-students");
    } catch (error) {
      console.error("Error proceeding from living expenses:", error);
      const errorMessage =
        error instanceof ValidationError
          ? error.message
          : "Failed to save your information. Please try again.";

      setSubmitError(errorMessage);
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const expenseCategories = [
    {
      key: "groceries" as keyof ExpenseCategory,
      label: "Groceries",
      description: "Food shopping, household items",
      icon: "🛒",
    },
    {
      key: "transportation" as keyof ExpenseCategory,
      label: "Transportation",
      description: "Public transport, bike, car expenses",
      icon: "🚌",
    },
    {
      key: "eatingOut" as keyof ExpenseCategory,
      label: "Eating Out",
      description: "Restaurants, cafes, takeaway",
      icon: "🍕",
    },
    {
      key: "socialLife" as keyof ExpenseCategory,
      label: "Social Life",
      description: "Clubbing, events, entertainment",
      icon: "🎉",
    },
    {
      key: "travel" as keyof ExpenseCategory,
      label: "Travel",
      description: "Trips during Erasmus",
      icon: "✈️",
    },
    {
      key: "otherExpenses" as keyof ExpenseCategory,
      label: "Other Expenses",
      description: "Clothes, personal care, misc.",
      icon: "🛍️",
    },
  ];

  return (
    <SubmissionGuard>
      <Head>
        <title>Living Expenses - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share your living expenses and budget tips"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FormProgressBar
            steps={[
              { number: 1, name: "Basic Info", href: "/basic-information" },
              { number: 2, name: "Courses", href: "/course-matching" },
              { number: 3, name: "Accommodation", href: "/accommodation" },
              { number: 4, name: "Living Expenses", href: "/living-expenses" },
              { number: 5, name: "Experience", href: "/help-future-students" },
            ]}
            currentStep={currentStepNumber}
            completedSteps={completedStepNumbers}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <FormSection
              title="Monthly Expenses (Excluding Rent & Utilities)"
              subtitle="Please provide your average monthly expenses for each category"
              icon={Calculator}
            >
              <FormGrid columns={2}>
                {expenseCategories.map((category) => (
                  <FormField
                    key={category.key}
                    label={`${category.icon} ${category.label}`}
                    helperText={category.description}
                  >
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <EnhancedInput
                        id={category.key}
                        type="number"
                        placeholder="0"
                        value={expenses[category.key]}
                        onChange={(e) =>
                          handleExpenseChange(category.key, e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </FormField>
                ))}
              </FormGrid>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Total Monthly Expenses:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    €{getTotalExpenses().toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  This excludes rent and utilities
                </p>
              </div>
            </FormSection>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncomeAmount">
                      Monthly Income Amount (€)
                    </Label>
                    <Input
                      id="monthlyIncomeAmount"
                      type="number"
                      placeholder="e.g., 800"
                      value={formData.monthlyIncomeAmount}
                      onChange={(e) =>
                        handleInputChange("monthlyIncomeAmount", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unexpectedCosts">
                    Unexpected Costs/Hidden Expenses
                  </Label>
                  <Textarea
                    id="unexpectedCosts"
                    placeholder="Any costs you didn't anticipate (deposits, registration fees, etc.)..."
                    value={formData.unexpectedCosts}
                    onChange={(e) =>
                      handleInputChange("unexpectedCosts", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Spending Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Spending habit during your Erasmus
                    </Label>
                    <RadioGroup
                      value={formData.spendingHabit}
                      onValueChange={(value) =>
                        handleInputChange("spendingHabit", value)
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="very-careful"
                          id="very-careful"
                        />
                        <Label htmlFor="very-careful">
                          Very Careful (Budgeting Every Euro)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="careful" id="careful" />
                        <Label htmlFor="careful">
                          Careful (Occasionally Spending)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not-careful" id="not-careful" />
                        <Label htmlFor="not-careful">
                          Not Careful (Didn't Budget)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FormSection
              title="Budget Tips for Future Students"
              subtitle="Share your money-saving strategies and recommendations"
              icon={Lightbulb}
            >
              <FormField
                label="Cheap Places to Buy Groceries"
                helperText="Recommend specific stores, markets, or chains where students can save money"
              >
                <EnhancedTextarea
                  id="cheapGroceryPlaces"
                  placeholder="Recommend specific stores, markets, or chains where students can save money on groceries..."
                  value={formData.cheapGroceryPlaces}
                  onChange={(e) =>
                    handleInputChange("cheapGroceryPlaces", e.target.value)
                  }
                  rows={3}
                />
              </FormField>

              <FormField
                label="Cheap Places to Eat Out"
                helperText="Affordable restaurants, cafes, or food spots you discovered"
              >
                <EnhancedTextarea
                  id="cheapEatingPlaces"
                  placeholder="Recommend affordable restaurants, cafes, or food spots..."
                  value={formData.cheapEatingPlaces}
                  onChange={(e) =>
                    handleInputChange("cheapEatingPlaces", e.target.value)
                  }
                  rows={3}
                />
              </FormField>

              <FormField
                label="Transportation Money-Saving Tips"
                helperText="Student discounts, passes, and transportation hacks"
              >
                <EnhancedTextarea
                  id="transportationTips"
                  placeholder="Student discounts, monthly passes, bike rentals, etc..."
                  value={formData.transportationTips}
                  onChange={(e) =>
                    handleInputChange("transportationTips", e.target.value)
                  }
                  rows={3}
                />
              </FormField>

              <FormField
                label="Social Life on a Budget"
                helperText="Free events, student discounts, and entertainment tips"
              >
                <EnhancedTextarea
                  id="socialLifeTips"
                  placeholder="Free events, student discounts for entertainment, happy hours, etc..."
                  value={formData.socialLifeTips}
                  onChange={(e) =>
                    handleInputChange("socialLifeTips", e.target.value)
                  }
                  rows={3}
                />
              </FormField>

              <FormField
                label="Travel Tips and Budget Options"
                helperText="Ways to explore Europe affordably during your exchange"
              >
                <EnhancedTextarea
                  id="travelTips"
                  placeholder="Cheap flights, train passes, hostels, travel apps..."
                  value={formData.travelTips}
                  onChange={(e) =>
                    handleInputChange("travelTips", e.target.value)
                  }
                  rows={3}
                />
              </FormField>

              <FormField
                label="Overall Budget Advice"
                helperText="General money management tips you wish you knew before"
              >
                <EnhancedTextarea
                  id="overallBudgetAdvice"
                  placeholder="General tips for managing money during Erasmus that you wish you knew before..."
                  value={formData.overallBudgetAdvice}
                  onChange={(e) =>
                    handleInputChange("overallBudgetAdvice", e.target.value)
                  }
                  rows={4}
                />
              </FormField>
            </FormSection>

            {getTotalExpenses() > 0 && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Budget Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        €{getTotalExpenses().toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Monthly Expenses
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        €{formData.monthlyIncomeAmount || "0"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Monthly Income
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          (parseFloat(formData.monthlyIncomeAmount) || 0) -
                            getTotalExpenses() >=
                          0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        €
                        {(
                          (parseFloat(formData.monthlyIncomeAmount) || 0) -
                          getTotalExpenses()
                        ).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">Balance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-blue-50 p-4 rounded-lg mt-6">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Your expense data will be used to help
                future students better plan their budgets. This information
                contributes to our community knowledge base and may be shown in
                aggregate form to guide other students.
              </p>
            </div>

            <div className="pt-8">
              <StepNavigation
                currentStep={currentStepNumber}
                totalSteps={5}
                onPrevious={() => router.push("/accommodation")}
                onNext={handleSubmit}
                onSaveDraft={handleSaveDraftToDatabase}
                canProceed={!isSubmitting}
                isLastStep={false}
                isSubmitting={isSubmitting}
                showPrevious={true}
                showSaveDraft={true}
              />
            </div>

            {/* Error message display */}
            {submitError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
          </form>
        </div>
      </div>
    </SubmissionGuard>
  );
}
