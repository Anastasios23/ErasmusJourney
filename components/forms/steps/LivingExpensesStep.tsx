import React, { useState, useEffect } from "react";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { StepNavigation } from "@/components/forms/StepNavigation";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Wallet, ShoppingCart, Bus, Beer, Plane } from "lucide-react";
import {
  sanitizeLivingExpensesStepData,
  hasRequiredLivingExpenses,
  type LivingExpensesStepData,
} from "@/lib/livingExpenses";
import {
  type ShareExperienceSaveState,
  formatValidationSummaryItem,
  scrollToFirstValidationError,
} from "@/lib/shareExperienceUi";

interface LivingExpensesUiData {
  currency: string;
  rent: string;
  food: string;
  transport: string;
  social: string;
  travel: string;
  other: string;
}

interface LivingExpensesStepProps {
  data: any;
  onComplete: (data: any) => void | Promise<void>;
  onSave: (data: any) => void | Promise<void>;
  onPrevious?: () => void;
  saveState?: ShareExperienceSaveState;
  onRequiredCountChange?: (count: number) => void;
}

const LIVING_EXPENSE_FIELD_LABELS: Record<string, string> = {
  food: "Food expenses",
  transport: "Transport expenses",
  social: "Social expenses",
};

function toUiValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function toUiData(value: LivingExpensesStepData): LivingExpensesUiData {
  return {
    currency: value.currency,
    rent: toUiValue(value.rent),
    food: toUiValue(value.food),
    transport: toUiValue(value.transport),
    social: toUiValue(value.social),
    travel: toUiValue(value.travel),
    other: toUiValue(value.other),
  };
}

function toCanonicalData(
  uiData: LivingExpensesUiData,
  fallbackRent?: number | null,
): LivingExpensesStepData {
  return sanitizeLivingExpensesStepData(uiData, { fallbackRent });
}

export default function LivingExpensesStep({
  data,
  onComplete,
  onSave,
  onPrevious,
  saveState = "idle",
  onRequiredCountChange,
}: LivingExpensesStepProps) {
  const fallbackRent =
    typeof data?.accommodation?.monthlyRent === "number"
      ? data.accommodation.monthlyRent
      : null;
  const [formData, setFormData] = useState<LivingExpensesUiData>(() =>
    toUiData(
      sanitizeLivingExpensesStepData(data?.livingExpenses, { fallbackRent }),
    ),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedContinue, setHasAttemptedContinue] = useState(false);

  useEffect(() => {
    setFormData(
      toUiData(
        sanitizeLivingExpensesStepData(data?.livingExpenses, {
          fallbackRent:
            typeof data?.accommodation?.monthlyRent === "number"
              ? data.accommodation.monthlyRent
              : null,
        }),
      ),
    );
  }, [data?.livingExpenses, data?.accommodation?.monthlyRent]);

  const handleInputChange = (
    field: keyof LivingExpensesUiData,
    value: string,
  ) => {
    const newData = { ...formData, [field]: value };

    setFormData(newData);

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const canonicalFormData = toCanonicalData(
    formData,
    typeof data?.accommodation?.monthlyRent === "number"
      ? data.accommodation.monthlyRent
      : null,
  );

  const missingRequiredCount =
    (canonicalFormData.food === null ? 1 : 0) +
    (canonicalFormData.transport === null ? 1 : 0) +
    (canonicalFormData.social === null ? 1 : 0);

  const validationSummary = hasAttemptedContinue
    ? ["food", "transport", "social"]
        .filter((field) => errors[field])
        .map((field) =>
          formatValidationSummaryItem(
            LIVING_EXPENSE_FIELD_LABELS[field] || field,
            errors[field],
          ),
        )
    : [];

  useEffect(() => {
    onRequiredCountChange?.(missingRequiredCount);
  }, [missingRequiredCount, onRequiredCountChange]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const canonicalData = toCanonicalData(
      formData,
      typeof data?.accommodation?.monthlyRent === "number"
        ? data.accommodation.monthlyRent
        : null,
    );

    if (canonicalData.food === null) newErrors.food = "Required";
    if (canonicalData.transport === null) newErrors.transport = "Required";
    if (canonicalData.social === null) newErrors.social = "Required";

    setErrors(newErrors);
    return hasRequiredLivingExpenses(canonicalData);
  };

  const calculateTotal = () => {
    const canonicalData = toCanonicalData(
      formData,
      typeof data?.accommodation?.monthlyRent === "number"
        ? data.accommodation.monthlyRent
        : null,
    );

    return (
      (canonicalData.rent || 0) +
      (canonicalData.food || 0) +
      (canonicalData.transport || 0) +
      (canonicalData.social || 0) +
      (canonicalData.travel || 0) +
      (canonicalData.other || 0)
    );
  };

  const handleContinue = () => {
    setHasAttemptedContinue(true);

    if (validate()) {
      setHasAttemptedContinue(false);
      void onComplete({
        livingExpenses: canonicalFormData,
      });
    } else {
      scrollToFirstValidationError();
    }
  };

  const handleSave = () => {
    void onSave({
      livingExpenses: canonicalFormData,
    });
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
                <Label htmlFor="rent" className="text-base">
                  Accommodation
                </Label>
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
                <Label htmlFor="food" className="text-base">
                  Groceries & Food
                </Label>
                <p className="text-xs text-gray-500">Supermarket, eating out</p>
              </div>
            </div>
            <div className="md:col-span-8 flex items-center gap-4">
              <Slider
                value={[parseFloat(formData.food) || 0]}
                max={1000}
                step={10}
                onValueChange={(vals) =>
                  handleInputChange("food", vals[0].toString())
                }
                className="flex-1"
              />
              <EnhancedInput
                id="food"
                type="number"
                value={formData.food}
                onChange={(e) => handleInputChange("food", e.target.value)}
                error={errors.food}
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
                <Label htmlFor="transport" className="text-base">
                  Transportation
                </Label>
                <p className="text-xs text-gray-500">
                  Public transport, bike, taxi
                </p>
              </div>
            </div>
            <div className="md:col-span-8 flex items-center gap-4">
              <Slider
                value={[parseFloat(formData.transport) || 0]}
                max={500}
                step={5}
                onValueChange={(vals) =>
                  handleInputChange("transport", vals[0].toString())
                }
                className="flex-1"
              />
              <EnhancedInput
                id="transport"
                type="number"
                value={formData.transport}
                onChange={(e) => handleInputChange("transport", e.target.value)}
                error={errors.transport}
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
                <Label htmlFor="social" className="text-base">
                  Social & Leisure
                </Label>
                <p className="text-xs text-gray-500">Parties, gym, hobbies</p>
              </div>
            </div>
            <div className="md:col-span-8 flex items-center gap-4">
              <Slider
                value={[parseFloat(formData.social) || 0]}
                max={1000}
                step={10}
                onValueChange={(vals) =>
                  handleInputChange("social", vals[0].toString())
                }
                className="flex-1"
              />
              <EnhancedInput
                id="social"
                type="number"
                value={formData.social}
                onChange={(e) => handleInputChange("social", e.target.value)}
                error={errors.social}
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
                <Label htmlFor="travel" className="text-base">
                  Travel
                </Label>
                <p className="text-xs text-gray-500">
                  Trips to other cities/countries
                </p>
              </div>
            </div>
            <div className="md:col-span-8 flex items-center gap-4">
              <Slider
                value={[parseFloat(formData.travel) || 0]}
                max={1000}
                step={10}
                onValueChange={(vals) =>
                  handleInputChange("travel", vals[0].toString())
                }
                className="flex-1"
              />
              <EnhancedInput
                id="travel"
                type="number"
                value={formData.travel}
                onChange={(e) => handleInputChange("travel", e.target.value)}
                error={errors.travel}
                className="w-24"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      <StepNavigation
        currentStep={4}
        totalSteps={5}
        onPrevious={onPrevious}
        onSaveDraft={handleSave}
        onNext={handleContinue}
        isLastStep={false}
        showPrevious={Boolean(onPrevious)}
        helperText="Use your average monthly estimates for the required budget categories."
        missingRequiredCount={missingRequiredCount}
        validationSummary={validationSummary}
        saveState={saveState}
      />
    </div>
  );
}
