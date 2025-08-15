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

interface ExpenseCategory {
  groceries: string;
  transportation: string;
  eatingOut: string;
  socialLife: string;
  travel: string;
  otherExpenses: string;
}

export default function LivingExpenses() {
  const { data: session } = useSession();
  const router = useRouter();
  const { addNotification } = useNotifications();

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
          setExpenses(livingData.expenses);
        }
        // Remove expenses from formData to avoid duplication
        const { expenses: _, ...restData } = livingData;
        setFormData(restData);
      }
    }
  }, [experienceLoading, experienceData]);

  const saveFormData = useCallback(async () => {
    try {
      setIsAutoSaving(true);
      const dataToSave = {
        ...formData,
        expenses: expenses,
      };
      await saveProgress({
        livingExpenses: dataToSave,
      });
      setIsAutoSaving(false);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error("Validation error:", error.message);
        toast.error(`Validation error: ${error.message}`);
      } else {
        console.error("Error saving draft:", error);
        toast.error("Failed to save draft. Please try again.");
      }
    }
  }, [formData, expenses, saveProgress]);

  // Auto-save when form data changes (debounced)
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
        saveFormData();
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [formData, expenses, saveFormData]);

  // Save before navigation
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
        saveFormData();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, expenses, saveFormData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const livingExpensesData = {
        ...formData,
        expenses: expenses,
      };

      // Save the current step data
      await saveProgress({
        livingExpenses: livingExpensesData,
      });

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
    <>
      <Head>
        <title>Living Expenses - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share your living expenses and budget tips"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  Step 4 of 5
                </Badge>
                <h1 className="text-2xl font-bold text-gray-900">
                  Living Expenses & Lifestyle
                </h1>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
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

            <div className="flex justify-between items-center pt-8">
              <Link href="/accommodation">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Accommodation
                </Button>
              </Link>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveFormData}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isAutoSaving ? "Auto-saving..." : "Save Draft"}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2">⏳</div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" />
                      Continue to Help Future Students
                    </>
                  )}
                </Button>
              </div>
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
    </>
  );
}
