import React, { useState, useEffect } from "react";
import { useFormContext } from "../FormProvider";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Wallet, ShoppingCart, Bus, Beer, Plane } from "lucide-react";

interface LivingExpensesData {
  currency: string;
  rent: string; // Pre-filled from accommodation step if available
  food: string;
  transport: string;
  social: string;
  travel: string;
  other: string;
}

interface LivingExpensesStepProps {
  data: any;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
}

export default function LivingExpensesStep({
  data,
  onComplete,
  onSave,
}: LivingExpensesStepProps) {
  const { updateFormData } = useFormContext();
  const [formData, setFormData] = useState<LivingExpensesData>({
    currency: "EUR",
    rent: data?.accommodation?.rent || "",
    food: "",
    transport: "",
    social: "",
    travel: "",
    other: "",
    ...data?.livingExpenses,
  });

  useEffect(() => {
    if (data?.livingExpenses) {
      setFormData((prev) => ({ ...prev, ...data.livingExpenses }));
    } else if (data?.accommodation?.rent && !formData.rent) {
      // Pre-fill rent if not already set
      setFormData((prev) => ({ ...prev, rent: data.accommodation.rent }));
    }
  }, [data]);

  const handleInputChange = (field: keyof LivingExpensesData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateFormData("livingExpenses", newData);
  };

  const calculateTotal = () => {
    const { rent, food, transport, social, travel, other } = formData;
    return (
      (parseFloat(rent) || 0) +
      (parseFloat(food) || 0) +
      (parseFloat(transport) || 0) +
      (parseFloat(social) || 0) +
      (parseFloat(travel) || 0) +
      (parseFloat(other) || 0)
    );
  };

  const handleContinue = () => {
    onComplete({ livingExpenses: formData });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-green-500 rounded-full"></div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Monthly Living Expenses
              </h3>
              <p className="text-sm text-gray-500">
                Estimate your average monthly spending to help others budget.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Monthly Estimate</p>
            <p className="text-2xl font-bold text-green-600">
              {calculateTotal().toFixed(0)} {formData.currency}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Rent (Read-only or Editable) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4 flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <Label htmlFor="rent" className="text-base">Accommodation</Label>
                <p className="text-xs text-gray-500">Rent & Utilities</p>
              </div>
            </div>
            <div className="md:col-span-8">
              <EnhancedInput
                id="rent"
                type="number"
                value={formData.rent}
                onChange={(e) => handleInputChange("rent", e.target.value)}
                className="max-w-[200px]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Food */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <Label htmlFor="food" className="text-base">Groceries & Food</Label>
                <p className="text-xs text-gray-500">Supermarket, eating out</p>
              </div>
            </div>
            <div className="md:col-span-8 flex items-center gap-4">
              <Slider
                value={[parseFloat(formData.food) || 0]}
                max={1000}
                step={10}
                onValueChange={(vals) => handleInputChange("food", vals[0].toString())}
                className="flex-1"
              />
              <EnhancedInput
                id="food"
                type="number"
                value={formData.food}
                onChange={(e) => handleInputChange("food", e.target.value)}
                className="w-24"
                placeholder="0"
              />
            </div>
          </div>

          {/* Transport */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4 flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <Label htmlFor="transport" className="text-base">Transportation</Label>
                <p className="text-xs text-gray-500">Public transport, bike, taxi</p>
              </div>
            </div>
            <div className="md:col-span-8 flex items-center gap-4">
              <Slider
                value={[parseFloat(formData.transport) || 0]}
                max={500}
                step={5}
                onValueChange={(vals) => handleInputChange("transport", vals[0].toString())}
                className="flex-1"
              />
              <EnhancedInput
                id="transport"
                type="number"
                value={formData.transport}
                onChange={(e) => handleInputChange("transport", e.target.value)}
                className="w-24"
                placeholder="0"
              />
            </div>
          </div>

          {/* Social */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4 flex items-center gap-2">
              <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                <Beer className="w-5 h-5" />
              </div>
              <div>
                <Label htmlFor="social" className="text-base">Social & Leisure</Label>
                <p className="text-xs text-gray-500">Parties, gym, hobbies</p>
              </div>
            </div>
            <div className="md:col-span-8 flex items-center gap-4">
              <Slider
                value={[parseFloat(formData.social) || 0]}
                max={1000}
                step={10}
                onValueChange={(vals) => handleInputChange("social", vals[0].toString())}
                className="flex-1"
              />
              <EnhancedInput
                id="social"
                type="number"
                value={formData.social}
                onChange={(e) => handleInputChange("social", e.target.value)}
                className="w-24"
                placeholder="0"
              />
            </div>
          </div>

          {/* Travel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4 flex items-center gap-2">
              <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <Label htmlFor="travel" className="text-base">Travel</Label>
                <p className="text-xs text-gray-500">Trips to other cities/countries</p>
              </div>
            </div>
            <div className="md:col-span-8 flex items-center gap-4">
              <Slider
                value={[parseFloat(formData.travel) || 0]}
                max={1000}
                step={10}
                onValueChange={(vals) => handleInputChange("travel", vals[0].toString())}
                className="flex-1"
              />
              <EnhancedInput
                id="travel"
                type="number"
                value={formData.travel}
                onChange={(e) => handleInputChange("travel", e.target.value)}
                className="w-24"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={() => onSave({ livingExpenses: formData })}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Save Draft
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue to Experience
        </button>
      </div>
    </div>
  );
}
