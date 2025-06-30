import { useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import Head from "next/head";
import Link from "next/link";
import { authOptions } from "./api/auth/[...nextauth]";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Textarea } from "../src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
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

interface ExpenseCategory {
  groceries: string;
  transportation: string;
  eatingOut: string;
  socialLife: string;
  travel: string;
  otherExpenses: string;
}

export default function LivingExpenses() {
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
    // Handle form submission
  };

  const expenseCategories = [
    {
      key: "groceries" as keyof ExpenseCategory,
      label: "Groceries & Food Shopping",
      icon: "🛒",
    },
    {
      key: "transportation" as keyof ExpenseCategory,
      label: "Transportation (Public Transport, etc.)",
      icon: "🚌",
    },
    {
      key: "eatingOut" as keyof ExpenseCategory,
      label: "Eating Out & Restaurants",
      icon: "🍽️",
    },
    {
      key: "socialLife" as keyof ExpenseCategory,
      label: "Social Life & Entertainment",
      icon: "🎉",
    },
    {
      key: "travel" as keyof ExpenseCategory,
      label: "Travel & Weekend Trips",
      icon: "✈️",
    },
    {
      key: "otherExpenses" as keyof ExpenseCategory,
      label: "Other Expenses",
      icon: "💳",
    },
  ];

  return (
    <>
      <Head>
        <title>Living Expenses - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share your living expenses and budget tips from your Erasmus experience"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Living Expenses & Budget
              </h1>
              <p className="text-gray-600">
                Help future students plan their budget by sharing your expense
                breakdown and money-saving tips
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Monthly Expenses Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Monthly Expenses Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {expenseCategories.map((category) => (
                      <div key={category.key}>
                        <Label htmlFor={category.key}>
                          {category.icon} {category.label}
                        </Label>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id={category.key}
                            type="number"
                            placeholder="Enter monthly amount"
                            value={expenses[category.key]}
                            onChange={(e) =>
                              handleExpenseChange(category.key, e.target.value)
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">
                        Total Monthly Expenses:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        €{getTotalExpenses().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Income Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="h-5 w-5" />
                    Income & Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="monthlyIncomeSource">
                        Main source of funding
                      </Label>
                      <Select
                        value={formData.monthlyIncomeSource}
                        onValueChange={(value) =>
                          handleInputChange("monthlyIncomeSource", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select funding source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="erasmus-grant">
                            Erasmus Grant
                          </SelectItem>
                          <SelectItem value="family-support">
                            Family Support
                          </SelectItem>
                          <SelectItem value="part-time-job">
                            Part-time Job
                          </SelectItem>
                          <SelectItem value="savings">
                            Personal Savings
                          </SelectItem>
                          <SelectItem value="scholarship">
                            Scholarship
                          </SelectItem>
                          <SelectItem value="student-loan">
                            Student Loan
                          </SelectItem>
                          <SelectItem value="multiple-sources">
                            Multiple Sources
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="monthlyIncomeAmount">
                        Monthly budget/income (€)
                      </Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={formData.monthlyIncomeAmount}
                        onChange={(e) =>
                          handleInputChange(
                            "monthlyIncomeAmount",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="biggestExpense">
                      What was your biggest expense category?
                    </Label>
                    <Select
                      value={formData.biggestExpense}
                      onValueChange={(value) =>
                        handleInputChange("biggestExpense", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select biggest expense" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accommodation">
                          Accommodation
                        </SelectItem>
                        <SelectItem value="food">Food & Groceries</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="social">
                          Social Life & Entertainment
                        </SelectItem>
                        <SelectItem value="transportation">
                          Transportation
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="unexpectedCosts">
                      Any unexpected costs you didn't plan for?
                    </Label>
                    <Textarea
                      placeholder="Describe any surprise expenses..."
                      value={formData.unexpectedCosts}
                      onChange={(e) =>
                        handleInputChange("unexpectedCosts", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Spending Habits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Spending Habits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="spendingHabit">
                      How would you describe your spending habits?
                    </Label>
                    <RadioGroup
                      value={formData.spendingHabit}
                      onValueChange={(value) =>
                        handleInputChange("spendingHabit", value)
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="very-frugal" id="very-frugal" />
                        <Label htmlFor="very-frugal">
                          Very frugal - I saved wherever possible
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="budget-conscious"
                          id="budget-conscious"
                        />
                        <Label htmlFor="budget-conscious">
                          Budget-conscious but comfortable
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <Label htmlFor="moderate">
                          Moderate - balanced spending
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="comfortable" />
                        <Label htmlFor="comfortable">
                          Comfortable - money wasn't a major concern
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lived-it-up" id="lived-it-up" />
                        <Label htmlFor="lived-it-up">
                          Lived it up - YOLO approach
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="moneyManagementTools">
                      Did you use any budgeting apps or tools?
                    </Label>
                    <Textarea
                      placeholder="Mention any apps, spreadsheets, or methods you used to track expenses..."
                      value={formData.moneyManagementTools}
                      onChange={(e) =>
                        handleInputChange(
                          "moneyManagementTools",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="currencyExchangeTips">
                      Currency exchange and banking tips
                    </Label>
                    <Textarea
                      placeholder="Share tips about best exchange rates, banking fees, cards to use, etc..."
                      value={formData.currencyExchangeTips}
                      onChange={(e) =>
                        handleInputChange(
                          "currencyExchangeTips",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Money-Saving Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Money-Saving Tips & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="cheapGroceryPlaces">
                      Best places for cheap groceries
                    </Label>
                    <Textarea
                      placeholder="Share specific stores, markets, or areas for affordable food shopping..."
                      value={formData.cheapGroceryPlaces}
                      onChange={(e) =>
                        handleInputChange("cheapGroceryPlaces", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="cheapEatingPlaces">
                      Affordable restaurants and eating spots
                    </Label>
                    <Textarea
                      placeholder="Recommend budget-friendly places to eat out..."
                      value={formData.cheapEatingPlaces}
                      onChange={(e) =>
                        handleInputChange("cheapEatingPlaces", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="transportationTips">
                      Transportation money-saving tips
                    </Label>
                    <Textarea
                      placeholder="Share tips about student discounts, monthly passes, bike rentals, etc..."
                      value={formData.transportationTips}
                      onChange={(e) =>
                        handleInputChange("transportationTips", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="socialLifeTips">
                      Social life on a budget
                    </Label>
                    <Textarea
                      placeholder="How to have fun without breaking the bank..."
                      value={formData.socialLifeTips}
                      onChange={(e) =>
                        handleInputChange("socialLifeTips", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="travelTips">
                      Travel tips and cheap trip ideas
                    </Label>
                    <Textarea
                      placeholder="Share budget travel tips, best booking sites, cheap destinations..."
                      value={formData.travelTips}
                      onChange={(e) =>
                        handleInputChange("travelTips", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="overallBudgetAdvice">
                      Overall budget advice for future students
                    </Label>
                    <Textarea
                      placeholder="Your top budget tips and advice for managing money abroad..."
                      value={formData.overallBudgetAdvice}
                      onChange={(e) =>
                        handleInputChange("overallBudgetAdvice", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-between">
                <Link href="/accommodation">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                </Link>
                <Button type="submit">
                  Continue to Help Future Students
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
