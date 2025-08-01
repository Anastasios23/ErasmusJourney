import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CostCalculatorProps {
  baseData: {
    averageRent?: number;
    averageFood?: number;
    averageTransport?: number;
    averageTotal?: number;
    studentCount?: number;
  };
  city: string;
  country: string;
}

export default function InteractiveCostCalculator({
  baseData,
  city,
  country,
}: CostCalculatorProps) {
  // Personal preferences
  const [livingStyle, setLivingStyle] = useState<
    "budget" | "moderate" | "comfortable"
  >("moderate");
  const [rentType, setRentType] = useState<"dorm" | "shared" | "studio">(
    "shared",
  );
  const [foodStyle, setFoodStyle] = useState<"cooking" | "mixed" | "dining">(
    "mixed",
  );
  const [transportStyle, setTransportStyle] = useState<
    "walking" | "public" | "mixed"
  >("public");

  // Custom amounts
  const [customRent, setCustomRent] = useState<number>(
    baseData.averageRent || 400,
  );
  const [customFood, setCustomFood] = useState<number>(
    baseData.averageFood || 300,
  );
  const [customTransport, setCustomTransport] = useState<number>(
    baseData.averageTransport || 50,
  );
  const [customEntertainment, setCustomEntertainment] = useState<number>(100);
  const [customMiscellaneous, setCustomMiscellaneous] = useState<number>(50);

  // Calculated totals
  const [personalTotal, setPersonalTotal] = useState<number>(0);
  const [comparisonToAverage, setComparisonToAverage] = useState<number>(0);

  // Lifestyle multipliers
  const styleMultipliers = {
    budget: { rent: 0.7, food: 0.8, transport: 0.9, entertainment: 0.6 },
    moderate: { rent: 1.0, food: 1.0, transport: 1.0, entertainment: 1.0 },
    comfortable: { rent: 1.4, food: 1.3, transport: 1.2, entertainment: 1.6 },
  };

  // Housing type adjustments
  const rentAdjustments = {
    dorm: 0.6,
    shared: 1.0,
    studio: 1.8,
  };

  // Food style adjustments
  const foodAdjustments = {
    cooking: 0.7,
    mixed: 1.0,
    dining: 1.5,
  };

  // Transport style adjustments
  const transportAdjustments = {
    walking: 0.3,
    public: 1.0,
    mixed: 1.2,
  };

  // Calculate personalized estimates
  useEffect(() => {
    const multiplier = styleMultipliers[livingStyle];
    const baseRent =
      (baseData.averageRent || 400) *
      rentAdjustments[rentType] *
      multiplier.rent;
    const baseFood =
      (baseData.averageFood || 300) *
      foodAdjustments[foodStyle] *
      multiplier.food;
    const baseTransport =
      (baseData.averageTransport || 50) *
      transportAdjustments[transportStyle] *
      multiplier.transport;
    const entertainment = 100 * multiplier.entertainment;

    setCustomRent(Math.round(baseRent));
    setCustomFood(Math.round(baseFood));
    setCustomTransport(Math.round(baseTransport));
    setCustomEntertainment(Math.round(entertainment));
  }, [livingStyle, rentType, foodStyle, transportStyle, baseData]);

  useEffect(() => {
    const total =
      customRent +
      customFood +
      customTransport +
      customEntertainment +
      customMiscellaneous;
    setPersonalTotal(total);
    setComparisonToAverage(total - (baseData.averageTotal || 900));
  }, [
    customRent,
    customFood,
    customTransport,
    customEntertainment,
    customMiscellaneous,
    baseData.averageTotal,
  ]);

  const formatCurrency = (amount: number) => `€${amount.toLocaleString()}`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Personal Budget Calculator
        </CardTitle>
        <p className="text-sm text-gray-600">
          Customize your estimated monthly costs for {city}, {country}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Living Style Selector */}
        <div>
          <Label className="text-base font-semibold">
            Lifestyle Preference
          </Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["budget", "moderate", "comfortable"] as const).map((style) => (
              <Button
                key={style}
                onClick={() => setLivingStyle(style)}
                variant={livingStyle === style ? "default" : "outline"}
                className="capitalize"
              >
                {style}
              </Button>
            ))}
          </div>
        </div>

        {/* Housing Type */}
        <div>
          <Label className="text-base font-semibold">Housing Preference</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Button
              onClick={() => setRentType("dorm")}
              variant={rentType === "dorm" ? "default" : "outline"}
              size="sm"
            >
              Dorm
            </Button>
            <Button
              onClick={() => setRentType("shared")}
              variant={rentType === "shared" ? "default" : "outline"}
              size="sm"
            >
              Shared Apt
            </Button>
            <Button
              onClick={() => setRentType("studio")}
              variant={rentType === "studio" ? "default" : "outline"}
              size="sm"
            >
              Studio
            </Button>
          </div>
        </div>

        {/* Food & Transport Style */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold">Food Style</Label>
            <div className="mt-1 space-y-1">
              {(["cooking", "mixed", "dining"] as const).map((style) => (
                <Button
                  key={style}
                  onClick={() => setFoodStyle(style)}
                  variant={foodStyle === style ? "default" : "outline"}
                  size="sm"
                  className="w-full capitalize text-xs"
                >
                  {style === "cooking"
                    ? "Cook at Home"
                    : style === "mixed"
                      ? "Mixed"
                      : "Dining Out"}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Transport Style</Label>
            <div className="mt-1 space-y-1">
              {(["walking", "public", "mixed"] as const).map((style) => (
                <Button
                  key={style}
                  onClick={() => setTransportStyle(style)}
                  variant={transportStyle === style ? "default" : "outline"}
                  size="sm"
                  className="w-full capitalize text-xs"
                >
                  {style === "walking"
                    ? "Walking/Bike"
                    : style === "public"
                      ? "Public Transit"
                      : "Mixed"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Amount Sliders */}
        <div className="space-y-4">
          <h4 className="font-semibold">Fine-tune Your Budget</h4>

          {/* Rent */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Housing</Label>
              <span className="text-sm font-medium">
                {formatCurrency(customRent)}/month
              </span>
            </div>
            <Slider
              value={[customRent]}
              onValueChange={([value]) => setCustomRent(value)}
              min={200}
              max={1500}
              step={25}
              className="w-full"
            />
          </div>

          {/* Food */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Food & Groceries</Label>
              <span className="text-sm font-medium">
                {formatCurrency(customFood)}/month
              </span>
            </div>
            <Slider
              value={[customFood]}
              onValueChange={([value]) => setCustomFood(value)}
              min={150}
              max={800}
              step={25}
              className="w-full"
            />
          </div>

          {/* Transport */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Transportation</Label>
              <span className="text-sm font-medium">
                {formatCurrency(customTransport)}/month
              </span>
            </div>
            <Slider
              value={[customTransport]}
              onValueChange={([value]) => setCustomTransport(value)}
              min={0}
              max={200}
              step={10}
              className="w-full"
            />
          </div>

          {/* Entertainment */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Entertainment & Social</Label>
              <span className="text-sm font-medium">
                {formatCurrency(customEntertainment)}/month
              </span>
            </div>
            <Slider
              value={[customEntertainment]}
              onValueChange={([value]) => setCustomEntertainment(value)}
              min={50}
              max={400}
              step={25}
              className="w-full"
            />
          </div>

          {/* Miscellaneous */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm">Other Expenses</Label>
              <span className="text-sm font-medium">
                {formatCurrency(customMiscellaneous)}/month
              </span>
            </div>
            <Slider
              value={[customMiscellaneous]}
              onValueChange={([value]) => setCustomMiscellaneous(value)}
              min={25}
              max={300}
              step={25}
              className="w-full"
            />
          </div>
        </div>

        {/* Results */}
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-lg">
              Your Estimated Monthly Budget
            </h4>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(personalTotal)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span>
              vs. Student Average (
              {formatCurrency(baseData.averageTotal || 900)}):
            </span>
            {comparisonToAverage > 0 ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />+
                {formatCurrency(comparisonToAverage)}
              </Badge>
            ) : comparisonToAverage < 0 ? (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-green-100 text-green-800"
              >
                <TrendingDown className="h-3 w-3" />
                {formatCurrency(comparisonToAverage)}
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Minus className="h-3 w-3" />
                Same as average
              </Badge>
            )}
          </div>

          {baseData.studentCount && (
            <p className="text-xs text-gray-600 mt-2">
              Average calculated from {baseData.studentCount} student
              {baseData.studentCount > 1 ? "s" : ""} submissions
            </p>
          )}
        </div>

        {/* Budget Breakdown */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Housing:</span>
              <span className="font-medium">{formatCurrency(customRent)}</span>
            </div>
            <div className="flex justify-between">
              <span>Food:</span>
              <span className="font-medium">{formatCurrency(customFood)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transport:</span>
              <span className="font-medium">
                {formatCurrency(customTransport)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Entertainment:</span>
              <span className="font-medium">
                {formatCurrency(customEntertainment)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Other:</span>
              <span className="font-medium">
                {formatCurrency(customMiscellaneous)}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(personalTotal)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
