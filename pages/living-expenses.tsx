import { useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Textarea } from "../src/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
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
} from "lucide-react";
import { useNotifications } from "../src/hooks/useNotifications";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Living Expenses Form submitted:", { formData, expenses });

    toast.success(
      "🎉 Thank you! Your living expenses data has been saved and will help future students plan their budgets.",
    );

    addNotification({
      type: "success",
      title: "Submission Received",
      message: "Your living expenses information was saved.",
      read: false,
      actionUrl: "/dashboard",
      actionLabel: "View Dashboard",
    });

    setTimeout(() => {
      router.push("/help-future-students");
    }, 2000);
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Monthly Expenses (Excluding Rent & Utilities)
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Please provide your average monthly expenses for each category
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {expenseCategories.map((category) => (
                    <div key={category.key} className="space-y-2">
                      <Label
                        htmlFor={category.key}
                        className="flex items-center"
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.label}
                      </Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
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
                      <p className="text-xs text-gray-500">
                        {category.description}
                      </p>
                    </div>
                  ))}
                </div>

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
              </CardContent>
            </Card>

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

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Budget Tips for Future Students
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="cheapGroceryPlaces">
                      Cheap Places to Buy Groceries
                    </Label>
                    <Textarea
                      id="cheapGroceryPlaces"
                      placeholder="Recommend specific stores, markets, or chains where students can save money on groceries..."
                      value={formData.cheapGroceryPlaces}
                      onChange={(e) =>
                        handleInputChange("cheapGroceryPlaces", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cheapEatingPlaces">
                      Cheap Places to Eat Out
                    </Label>
                    <Textarea
                      id="cheapEatingPlaces"
                      placeholder="Recommend affordable restaurants, cafes, or food spots..."
                      value={formData.cheapEatingPlaces}
                      onChange={(e) =>
                        handleInputChange("cheapEatingPlaces", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transportationTips">
                      Transportation Money-Saving Tips
                    </Label>
                    <Textarea
                      id="transportationTips"
                      placeholder="Student discounts, monthly passes, bike rentals, etc..."
                      value={formData.transportationTips}
                      onChange={(e) =>
                        handleInputChange("transportationTips", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialLifeTips">
                      Social Life on a Budget
                    </Label>
                    <Textarea
                      id="socialLifeTips"
                      placeholder="Free events, student discounts for entertainment, happy hours, etc..."
                      value={formData.socialLifeTips}
                      onChange={(e) =>
                        handleInputChange("socialLifeTips", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travelTips">
                      Travel Tips and Budget Options
                    </Label>
                    <Textarea
                      id="travelTips"
                      placeholder="Cheap flights, train passes, hostels, travel apps..."
                      value={formData.travelTips}
                      onChange={(e) =>
                        handleInputChange("travelTips", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overallBudgetAdvice">
                      Overall Budget Advice
                    </Label>
                    <Textarea
                      id="overallBudgetAdvice"
                      placeholder="General tips for managing money during Erasmus that you wish you knew before..."
                      value={formData.overallBudgetAdvice}
                      onChange={(e) =>
                        handleInputChange("overallBudgetAdvice", e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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

              <Button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
              >
                Continue to Help Future Students
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
