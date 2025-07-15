import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Label } from "../../src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import {
  Calculator,
  Euro,
  TrendingDown,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Badge } from "../../src/components/ui/badge";

interface BudgetBreakdown {
  rent: number;
  utilities: number;
  groceries: number;
  transport: number;
  entertainment: number;
  miscellaneous: number;
  total: number;
}

interface CountryCosts {
  [key: string]: {
    rentMultiplier: number;
    utilitiesAvg: number;
    groceriesAvg: number;
    transportAvg: number;
    entertainmentAvg: number;
  };
}

const countryCosts: CountryCosts = {
  Spain: {
    rentMultiplier: 1.0,
    utilitiesAvg: 80,
    groceriesAvg: 200,
    transportAvg: 40,
    entertainmentAvg: 120,
  },
  Italy: {
    rentMultiplier: 1.1,
    utilitiesAvg: 90,
    groceriesAvg: 220,
    transportAvg: 35,
    entertainmentAvg: 130,
  },
  France: {
    rentMultiplier: 1.3,
    utilitiesAvg: 100,
    groceriesAvg: 250,
    transportAvg: 50,
    entertainmentAvg: 150,
  },
  Germany: {
    rentMultiplier: 1.2,
    utilitiesAvg: 120,
    groceriesAvg: 280,
    transportAvg: 60,
    entertainmentAvg: 140,
  },
  Netherlands: {
    rentMultiplier: 1.5,
    utilitiesAvg: 130,
    groceriesAvg: 300,
    transportAvg: 70,
    entertainmentAvg: 160,
  },
  "Czech Republic": {
    rentMultiplier: 0.6,
    utilitiesAvg: 60,
    groceriesAvg: 150,
    transportAvg: 25,
    entertainmentAvg: 80,
  },
  Poland: {
    rentMultiplier: 0.5,
    utilitiesAvg: 50,
    groceriesAvg: 130,
    transportAvg: 20,
    entertainmentAvg: 70,
  },
  Belgium: {
    rentMultiplier: 1.1,
    utilitiesAvg: 95,
    groceriesAvg: 240,
    transportAvg: 45,
    entertainmentAvg: 135,
  },
};

export default function BudgetCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>("");
  const [desiredRent, setDesiredRent] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [accommodationType, setAccommodationType] = useState<string>("");
  const [breakdown, setBreakdown] = useState<BudgetBreakdown | null>(null);
  const [budgetAdvice, setBudgetAdvice] = useState<string>("");

  const calculateBudget = () => {
    if (!monthlyIncome || !desiredRent || !selectedCountry) return;

    const income = parseFloat(monthlyIncome);
    const rent = parseFloat(desiredRent);
    const countryData = countryCosts[selectedCountry];

    if (!countryData) return;

    // Apply accommodation type adjustments
    let rentAdjustment = 1;
    if (accommodationType === "shared-apartment") rentAdjustment = 0.7;
    else if (accommodationType === "student-residence") rentAdjustment = 0.8;
    else if (accommodationType === "studio") rentAdjustment = 1.2;
    else if (accommodationType === "private-apartment") rentAdjustment = 1.5;

    const adjustedRent = rent * rentAdjustment;

    const budget: BudgetBreakdown = {
      rent: adjustedRent,
      utilities: countryData.utilitiesAvg,
      groceries: countryData.groceriesAvg,
      transport: countryData.transportAvg,
      entertainment: countryData.entertainmentAvg,
      miscellaneous: income * 0.1, // 10% for miscellaneous
      total: 0,
    };

    budget.total =
      budget.rent +
      budget.utilities +
      budget.groceries +
      budget.transport +
      budget.entertainment +
      budget.miscellaneous;

    setBreakdown(budget);

    // Generate advice
    const rentPercentage = (budget.rent / income) * 100;
    const totalPercentage = (budget.total / income) * 100;

    let advice = "";
    if (rentPercentage > 40) {
      advice =
        "Your rent is quite high (>40% of income). Consider shared accommodation or look in cheaper neighborhoods.";
    } else if (rentPercentage > 30) {
      advice =
        "Your rent is reasonable but on the higher side. You should have enough for other expenses.";
    } else {
      advice =
        "Great! Your rent is within a healthy range (<30% of income). You'll have good flexibility for other expenses.";
    }

    if (totalPercentage > 90) {
      advice +=
        " Your total budget is very tight. Consider finding additional income sources or reducing expenses.";
    } else if (totalPercentage > 80) {
      advice +=
        " Your budget is tight but manageable. Try to find ways to save on groceries and entertainment.";
    } else {
      advice +=
        " You should have a comfortable buffer for savings and unexpected expenses.";
    }

    setBudgetAdvice(advice);
  };

  useEffect(() => {
    if (monthlyIncome && desiredRent && selectedCountry) {
      calculateBudget();
    }
  }, [monthlyIncome, desiredRent, selectedCountry, accommodationType]);

  const getBudgetColor = (percentage: number) => {
    if (percentage > 80) return "text-red-600";
    if (percentage > 60) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Budget Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="income">Monthly Income (€)</Label>
            <Input
              id="income"
              type="number"
              placeholder="e.g. 800"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="rent">Desired Rent (€)</Label>
            <Input
              id="rent"
              type="number"
              placeholder="e.g. 400"
              value={desiredRent}
              onChange={(e) => setDesiredRent(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country">Destination Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(countryCosts).map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="accommodation-type">Accommodation Type</Label>
            <Select
              value={accommodationType}
              onValueChange={setAccommodationType}
            >
              <SelectTrigger id="accommodation-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared-apartment">
                  Shared Apartment
                </SelectItem>
                <SelectItem value="student-residence">
                  Student Residence
                </SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="private-apartment">
                  Private Apartment
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {breakdown && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Monthly Budget Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Rent</span>
                  <span className="font-medium">
                    €{breakdown.rent.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Utilities</span>
                  <span className="font-medium">
                    €{breakdown.utilities.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Groceries</span>
                  <span className="font-medium">
                    €{breakdown.groceries.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transport</span>
                  <span className="font-medium">
                    €{breakdown.transport.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Entertainment</span>
                  <span className="font-medium">
                    €{breakdown.entertainment.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Miscellaneous</span>
                  <span className="font-medium">
                    €{breakdown.miscellaneous.toFixed(0)}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span
                    className={getBudgetColor(
                      (breakdown.total / parseFloat(monthlyIncome)) * 100,
                    )}
                  >
                    €{breakdown.total.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Budget Usage</div>
                <div
                  className={`text-lg font-bold ${getBudgetColor((breakdown.total / parseFloat(monthlyIncome)) * 100)}`}
                >
                  {(
                    (breakdown.total / parseFloat(monthlyIncome)) *
                    100
                  ).toFixed(1)}
                  % of income
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Remaining</div>
                <div className="text-lg font-bold text-green-600">
                  €{(parseFloat(monthlyIncome) - breakdown.total).toFixed(0)}
                </div>
              </div>
            </div>

            {budgetAdvice && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Budget Advice
                    </h4>
                    <p className="text-sm text-blue-800">{budgetAdvice}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Badge variant="outline" className="p-2 justify-center">
                <TrendingDown className="h-4 w-4 mr-1" />
                Save on groceries by cooking at home
              </Badge>
              <Badge variant="outline" className="p-2 justify-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Student discounts available
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
