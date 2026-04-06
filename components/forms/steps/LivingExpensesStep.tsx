import React, { useEffect, useState } from "react";

import { StepNavigation } from "../StepNavigation";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { Label } from "@/components/ui/label";
import {
  calculateLivingExpensesTotal,
  hasRequiredLivingExpenses,
  sanitizeLivingExpensesStepData,
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
  food: "Food",
  transport: "Transport",
  social: "Social",
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

interface ExpenseFieldProps {
  id: keyof LivingExpensesUiData;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  ariaLabel?: string;
  onChange: (value: string) => void;
}

function ExpenseField({
  id,
  label,
  hint,
  value,
  error,
  ariaLabel,
  onChange,
}: ExpenseFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-sm text-gray-500">{hint}</p> : null}
      <EnhancedInput
        id={id}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        placeholder="0"
        aria-label={ariaLabel}
      />
    </div>
  );
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
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);

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
    const nextErrors: Record<string, string> = {};

    const canonicalData = toCanonicalData(
      formData,
      typeof data?.accommodation?.monthlyRent === "number"
        ? data.accommodation.monthlyRent
        : null,
    );

    if (canonicalData.food === null) nextErrors.food = "Required";
    if (canonicalData.transport === null) nextErrors.transport = "Required";
    if (canonicalData.social === null) nextErrors.social = "Required";

    setErrors(nextErrors);
    return hasRequiredLivingExpenses(canonicalData);
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

  const totalLivingExpenses = calculateLivingExpensesTotal(canonicalFormData);
  const accommodationHint =
    fallbackRent !== null
      ? "Prefilled from your accommodation step. You can adjust this if needed."
      : "Add this if you want to include your accommodation cost.";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly living expenses
            </h3>
            <p className="text-sm text-gray-600">
              Add your average monthly spending during Erasmus.
            </p>
          </div>

          <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Estimated monthly total:
            <span className="ml-2 font-semibold text-gray-900">
              {totalLivingExpenses.toFixed(0)} {formData.currency}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">
                Required monthly costs
              </h4>
              <p className="text-sm text-gray-500">
                Add the main costs future students need to compare first.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ExpenseField
                id="food"
                label="Food *"
                hint="Groceries and eating out"
                value={formData.food}
                error={errors.food}
                ariaLabel="Groceries & Food"
                onChange={(value) => handleInputChange("food", value)}
              />
              <ExpenseField
                id="transport"
                label="Transport *"
                hint="Public transport or commuting"
                value={formData.transport}
                error={errors.transport}
                ariaLabel="Transportation"
                onChange={(value) => handleInputChange("transport", value)}
              />
              <ExpenseField
                id="social"
                label="Social *"
                hint="Going out, gym, hobbies"
                value={formData.social}
                error={errors.social}
                ariaLabel="Social & Leisure"
                onChange={(value) => handleInputChange("social", value)}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">
                Additional costs
              </h4>
              <p className="text-sm text-gray-500">
                Add anything else that helped shape your monthly budget.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <ExpenseField
                id="rent"
                label="Accommodation"
                hint={accommodationHint}
                value={formData.rent}
                onChange={(value) => handleInputChange("rent", value)}
              />
              <ExpenseField
                id="travel"
                label="Travel (optional)"
                hint="Optional trips during Erasmus"
                value={formData.travel}
                error={errors.travel}
                onChange={(value) => handleInputChange("travel", value)}
              />
              <ExpenseField
                id="other"
                label="Other (optional)"
                hint="Phone, supplies, health, or other monthly costs"
                value={formData.other}
                error={errors.other}
                onChange={(value) => handleInputChange("other", value)}
              />
            </div>
          </div>
        </div>
      </section>

      <StepNavigation
        currentStep={4}
        totalSteps={5}
        onPrevious={onPrevious}
        onSaveDraft={handleSave}
        onNext={handleContinue}
        isLastStep={false}
        showPrevious={Boolean(onPrevious)}
        missingRequiredCount={missingRequiredCount}
        validationSummary={validationSummary}
        saveState={saveState}
      />
    </div>
  );
}
