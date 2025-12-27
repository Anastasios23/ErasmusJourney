import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "../src/hooks/use-toast";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ValidationError } from "../src/utils/apiErrorHandler";
import { useErasmusExperience } from "../src/hooks/useErasmusExperience";
import { useFormProgress } from "../src/context/FormProgressContext";
import { FormProgressBar } from "../components/forms/FormProgressBar";
import { StepNavigation } from "../components/forms/StepNavigation";
import { StepGuard } from "../components/forms/StepGuard";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Textarea } from "../src/components/ui/textarea";
import { EnhancedInput } from "../src/components/ui/enhanced-input";
import { EnhancedTextarea } from "../src/components/ui/enhanced-textarea";
import {
  FormField,
  FormSection,
  FormGrid,
} from "../src/components/ui/form-components";
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSection } from "@/components/ui/hero-section";
import Header from "../components/Header";
import { SubmissionGuard } from "../components/SubmissionGuard";
import { cn } from "../src/lib/utils";

interface ExpenseCategory {
  groceries: string;
  transportation: string;
  eatingOut: string;
  socialLife: string;
  travel: string;
  otherExpenses: string;
}

export default function LivingExpenses() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [sessionStatus, router]);

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load experience data when component mounts
  useEffect(() => {
    if (!experienceLoading && experienceData) {
      if (experienceData.livingExpenses) {
        const livingData = experienceData.livingExpenses;

        if (livingData.expenses) {
          const safeExpenses = Object.entries(livingData.expenses).reduce(
            (acc, [key, value]) => {
              acc[key as keyof ExpenseCategory] = (value as string) ?? "";
              return acc;
            },
            {} as ExpenseCategory,
          );
          setExpenses(safeExpenses);
        }

        const { expenses: _, ...restData } = livingData;
        const safeFormData = Object.entries(restData).reduce(
          (acc, [key, value]) => {
            acc[key] = value ?? "";
            return acc;
          },
          {} as Record<string, any>,
        );

        setFormData((prev) => ({ ...prev, ...(safeFormData as any) }));
      }
    }
  }, [experienceLoading, experienceData]);

  useEffect(() => {
    setCurrentStep("living-expenses");
  }, [setCurrentStep]);

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
    return Object.values(expenses).reduce((sum, expense) => {
      return sum + (parseFloat(expense) || 0);
    }, 0);
  };

  // Save to localStorage helper function
  const saveToLocalStorage = useCallback(() => {
    const draftKey = `erasmus_form_living-expenses`;
    const draftData = {
      type: "living-expenses",
      title: "Living Expenses Draft",
      data: { ...formData, expenses },
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
  }, [formData, expenses]);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasData =
        Object.values(formData).some((v) => v !== "") ||
        Object.values(expenses).some((v) => v !== "");
      if (hasData) {
        saveToLocalStorage();
        setShowSavedIndicator(true);
        setTimeout(() => setShowSavedIndicator(false), 2000);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, expenses, saveToLocalStorage]);

  // Save draft to database
  const handleSaveDraftToDatabase = useCallback(async () => {
    try {
      await saveProgress({
        livingExpenses: { ...formData, expenses },
      });
      toast({
        title: "Draft Saved",
        description: "Your financial details have been saved.",
      });
    } catch (error) {
      console.error("Draft save error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save draft.",
      });
    }
  }, [formData, expenses, saveProgress]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Validation
    const incomplete =
      !expenses.groceries ||
      !expenses.transportation ||
      !expenses.socialLife ||
      !expenses.travel;
    if (incomplete) {
      setSubmitError(
        "Please provide estimates for core monthly expense categories.",
      );
      toast({
        variant: "destructive",
        title: "Incomplete Data",
        description: "Please fill in the core expense categories.",
      });
      setIsSubmitting(false);
      return;
    }

    saveToLocalStorage();

    try {
      const saved = await saveProgress({
        livingExpenses: { ...formData, expenses },
      });

      if (!saved) throw new Error("Failed to save progress.");

      markStepCompleted("living-expenses");
      router.push("/help-future-students");
    } catch (error) {
      console.error("Error submitting living expenses:", error);
      setSubmitError("Failed to submit form. Please try again.");
      setIsSubmitting(false);
    }
  };

  const expenseCategories = [
    {
      key: "groceries" as keyof ExpenseCategory,
      label: "Groceries",
      icon: "solar:cart-large-minimalistic-linear",
      color: "text-blue-500",
    },
    {
      key: "transportation" as keyof ExpenseCategory,
      label: "Transport",
      icon: "solar:bus-linear",
      color: "text-emerald-500",
    },
    {
      key: "eatingOut" as keyof ExpenseCategory,
      label: "Eating Out",
      icon: "solar:cup-hot-linear",
      color: "text-orange-500",
    },
    {
      key: "socialLife" as keyof ExpenseCategory,
      label: "Social Life",
      icon: "solar:music-note-2-linear",
      color: "text-purple-500",
    },
    {
      key: "travel" as keyof ExpenseCategory,
      label: "Travel",
      icon: "solar:plain-linear",
      color: "text-indigo-500",
    },
    {
      key: "otherExpenses" as keyof ExpenseCategory,
      label: "Other",
      icon: "solar:bag-heart-linear",
      color: "text-pink-500",
    },
  ];

  return (
    <StepGuard requiredStep={4}>
      <SubmissionGuard>
        <Head>
          <title>Living Expenses - Erasmus Journey Platform</title>
        </Head>

        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <Header />

          <HeroSection
            badge="Step 4 of 5"
            badgeIcon="solar:wallet-money-linear"
            title="Living Expenses"
            description="Help others budget for their journey. Share your average monthly costs and money-saving tips from your time abroad."
            gradient="orange"
            size="sm"
          />

          <div className="pb-16 px-4">
            <div className="max-w-4xl mx-auto -mt-8 relative z-20">
              {/* Progress Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 mb-8">
                <FormProgressBar
                  steps={[
                    {
                      number: 1,
                      name: "Basic Info",
                      href: "/basic-information",
                    },
                    { number: 2, name: "Courses", href: "/course-matching" },
                    {
                      number: 3,
                      name: "Accommodation",
                      href: "/accommodation",
                    },
                    {
                      number: 4,
                      name: "Living Expenses",
                      href: "/living-expenses",
                    },
                    {
                      number: 5,
                      name: "Experience",
                      href: "/help-future-students",
                    },
                  ]}
                  currentStep={currentStepNumber}
                  completedSteps={completedStepNumbers}
                />
              </div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Monthly Expenses Grid */}
                <FormSection
                  variant="orange"
                  title="Monthly Budget Breakdown"
                  subtitle="Average monthly spending (excluding rent & utilities)"
                  icon="solar:calculator-minimalistic-linear"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {expenseCategories.map((cat) => (
                      <motion.div
                        key={cat.key}
                        whileHover={{ scale: 1.01 }}
                        className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={cn(
                              "p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors",
                              cat.color,
                            )}
                          >
                            <Icon icon={cat.icon} className="w-5 h-5" />
                          </div>
                          <Label
                            htmlFor={cat.key}
                            className="font-bold text-slate-700 dark:text-slate-300"
                          >
                            {cat.label}
                          </Label>
                        </div>
                        <EnhancedInput
                          id={cat.key}
                          type="number"
                          placeholder="0"
                          value={expenses[cat.key]}
                          onChange={(e) =>
                            handleExpenseChange(cat.key, e.target.value)
                          }
                          icon={
                            <Icon
                              icon="solar:euro-linear"
                              className="w-4 h-4"
                            />
                          }
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Total Summary Card */}
                  <motion.div
                    layout
                    className="mt-8 p-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl text-white shadow-lg shadow-orange-200 dark:shadow-none overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Icon icon="solar:wallet-linear" className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <p className="text-orange-100 text-sm font-bold uppercase tracking-wider mb-1">
                          Total Monthly Expenses
                        </p>
                        <h3 className="text-4xl font-black">
                          €{getTotalExpenses().toFixed(2)}
                        </h3>
                        <p className="text-orange-100/80 text-xs mt-2 font-medium italic">
                          * Excluding rent and utilities
                        </p>
                      </div>
                      <div className="h-px md:h-12 md:w-px bg-white/20" />
                      <div className="flex-1 max-w-xs">
                        <Label className="text-orange-100 text-xs font-bold uppercase mb-2 block">
                          Monthly Income (€)
                        </Label>
                        <EnhancedInput
                          type="number"
                          placeholder="e.g. 800"
                          value={formData.monthlyIncomeAmount}
                          onChange={(e) =>
                            handleInputChange(
                              "monthlyIncomeAmount",
                              e.target.value,
                            )
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:bg-white/20"
                        />
                      </div>
                    </div>
                  </motion.div>
                </FormSection>

                {/* Spending Habits */}
                <FormSection
                  variant="orange"
                  title="Spending Habits"
                  subtitle="How did you manage your finances?"
                  icon="solar:hand-money-linear"
                >
                  <FormField label="Your Spending Style" required>
                    <RadioGroup
                      value={formData.spendingHabit}
                      onValueChange={(v) =>
                        handleInputChange("spendingHabit", v)
                      }
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
                    >
                      {[
                        {
                          id: "very-careful",
                          label: "Very Careful",
                          desc: "Budgeted every euro",
                          icon: "solar:shield-check-linear",
                        },
                        {
                          id: "careful",
                          label: "Careful",
                          desc: "Occasional spending",
                          icon: "solar:scale-linear",
                        },
                        {
                          id: "not-careful",
                          label: "Not Careful",
                          desc: "Didn't track budget",
                          icon: "solar:clover-linear",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          className={cn(
                            "relative flex flex-col p-4 rounded-2xl border transition-all duration-200 cursor-pointer group",
                            formData.spendingHabit === opt.id
                              ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800"
                              : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-orange-100",
                          )}
                          onClick={() =>
                            handleInputChange("spendingHabit", opt.id)
                          }
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                formData.spendingHabit === opt.id
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-slate-50 text-slate-400",
                              )}
                            >
                              <Icon icon={opt.icon} className="w-5 h-5" />
                            </div>
                            <RadioGroupItem value={opt.id} id={opt.id} />
                          </div>
                          <Label
                            htmlFor={opt.id}
                            className="font-bold text-slate-900 dark:text-white cursor-pointer"
                          >
                            {opt.label}
                          </Label>
                          <p className="text-xs text-slate-500 mt-1">
                            {opt.desc}
                          </p>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormField>

                  <FormField
                    label="Unexpected Costs"
                    helperText="Any hidden fees or surprise expenses?"
                  >
                    <EnhancedTextarea
                      placeholder="e.g. Registration fees, deposits, insurance..."
                      value={formData.unexpectedCosts}
                      onChange={(e) =>
                        handleInputChange("unexpectedCosts", e.target.value)
                      }
                    />
                  </FormField>
                </FormSection>

                {/* Budget Tips */}
                <FormSection
                  variant="orange"
                  title="Money-Saving Tips"
                  subtitle="Share your local knowledge with future students"
                  icon="solar:lightbulb-minimalistic-linear"
                >
                  <FormGrid columns={2}>
                    <FormField
                      label="Cheap Groceries"
                      helperText="Best supermarkets or local markets"
                    >
                      <EnhancedTextarea
                        placeholder="e.g. Lidl, local farmers markets on Saturdays..."
                        value={formData.cheapGroceryPlaces}
                        onChange={(e) =>
                          handleInputChange(
                            "cheapGroceryPlaces",
                            e.target.value,
                          )
                        }
                      />
                    </FormField>
                    <FormField
                      label="Affordable Dining"
                      helperText="Student-friendly restaurants or cafes"
                    >
                      <EnhancedTextarea
                        placeholder="e.g. University canteen, specific street food spots..."
                        value={formData.cheapEatingPlaces}
                        onChange={(e) =>
                          handleInputChange("cheapEatingPlaces", e.target.value)
                        }
                      />
                    </FormField>
                    <FormField
                      label="Transport Hacks"
                      helperText="Student passes or bike rentals"
                    >
                      <EnhancedTextarea
                        placeholder="e.g. Monthly student metro card, bike sharing apps..."
                        value={formData.transportationTips}
                        onChange={(e) =>
                          handleInputChange(
                            "transportationTips",
                            e.target.value,
                          )
                        }
                      />
                    </FormField>
                    <FormField
                      label="Social Life"
                      helperText="Free events or happy hours"
                    >
                      <EnhancedTextarea
                        placeholder="e.g. Free museum days, student nights at clubs..."
                        value={formData.socialLifeTips}
                        onChange={(e) =>
                          handleInputChange("socialLifeTips", e.target.value)
                        }
                      />
                    </FormField>
                  </FormGrid>

                  <FormField
                    label="Overall Budget Advice"
                    helperText="What do you wish you knew before you left?"
                  >
                    <EnhancedTextarea
                      placeholder="General tips for managing money during Erasmus..."
                      value={formData.overallBudgetAdvice}
                      onChange={(e) =>
                        handleInputChange("overallBudgetAdvice", e.target.value)
                      }
                      className="min-h-[120px]"
                    />
                  </FormField>
                </FormSection>

                {/* Navigation */}
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

                {/* Auto-save indicator */}
                <div className="fixed top-24 right-6 z-50">
                  <AnimatePresence>
                    {showSavedIndicator && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center bg-orange-500/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-medium shadow-2xl border border-orange-400/50"
                      >
                        <Icon
                          icon="solar:check-circle-linear"
                          className="w-4 h-4 mr-2"
                        />
                        Changes saved
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {submitError && (
                  <Alert
                    variant="destructive"
                    className="mt-4 rounded-2xl border-red-100 bg-red-50 dark:bg-red-900/20"
                  >
                    <Icon
                      icon="solar:danger-circle-linear"
                      className="w-5 h-5"
                    />
                    <AlertDescription className="font-medium">
                      {submitError}
                    </AlertDescription>
                  </Alert>
                )}
              </motion.form>
            </div>
          </div>
        </div>
      </SubmissionGuard>
    </StepGuard>
  );
}
