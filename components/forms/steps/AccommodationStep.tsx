import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

import { StepNavigation } from "../StepNavigation";
import {
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "@/components/ui/enhanced-select";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Label } from "@/components/ui/label";
import {
  ACCOMMODATION_TYPE_OPTIONS,
  BILLS_INCLUDED_OPTIONS,
  DIFFICULTY_FINDING_ACCOMMODATION_OPTIONS,
  HOW_FOUND_ACCOMMODATION_OPTIONS,
  type AccommodationStepData,
  createEmptyAccommodationStepData,
  sanitizeAccommodationStepData,
} from "@/lib/accommodation";
import { accommodationStepSchema } from "@/lib/schemas";
import {
  type ShareExperienceSaveState,
  formatValidationSummaryItem,
  scrollToFirstValidationError,
} from "@/lib/shareExperienceUi";

interface AccommodationStepProps {
  data: any;
  onComplete: (data: any) => void | Promise<void>;
  onSave: (data: any) => void | Promise<void>;
  onPrevious?: () => void;
  saveState?: ShareExperienceSaveState;
  onRequiredCountChange?: (count: number) => void;
}

const ACCOMMODATION_FIELD_LABELS: Record<string, string> = {
  accommodationType: "Accommodation type",
  monthlyRent: "Monthly rent",
  billsIncluded: "Bills included",
  wouldRecommend: "Would recommend",
  accommodationRating: "Accommodation rating",
  areaOrNeighborhood: "Area or neighborhood",
  minutesToUniversity: "Minutes to university",
  howFoundAccommodation: "How did you find it?",
  difficultyFindingAccommodation: "Difficulty finding accommodation",
  accommodationReview: "Accommodation review",
};

const ACCOMMODATION_ERROR_ORDER = [
  "accommodationType",
  "monthlyRent",
  "billsIncluded",
  "wouldRecommend",
  "accommodationRating",
  "areaOrNeighborhood",
  "minutesToUniversity",
  "howFoundAccommodation",
  "difficultyFindingAccommodation",
  "accommodationReview",
] as const;

export default function AccommodationStep({
  data,
  onComplete,
  onSave,
  onPrevious,
  saveState = "idle",
  onRequiredCountChange,
}: AccommodationStepProps) {
  const [formData, setFormData] = useState<AccommodationStepData>(() =>
    data?.accommodation
      ? sanitizeAccommodationStepData(data.accommodation)
      : createEmptyAccommodationStepData(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedContinue, setHasAttemptedContinue] = useState(false);

  useEffect(() => {
    setFormData(
      data?.accommodation
        ? sanitizeAccommodationStepData(data.accommodation)
        : createEmptyAccommodationStepData(),
    );
  }, [data?.accommodation]);

  const persist = (nextData: AccommodationStepData) => {
    const sanitized = sanitizeAccommodationStepData(nextData);
    setFormData(sanitized);
  };

  const missingRequiredCount =
    (formData.accommodationType ? 0 : 1) +
    (typeof formData.monthlyRent === "number" ? 0 : 1) +
    (formData.billsIncluded ? 0 : 1) +
    (typeof formData.wouldRecommend === "boolean" ? 0 : 1) +
    (typeof formData.accommodationRating === "number" ? 0 : 1);

  const validationSummary = hasAttemptedContinue
    ? ACCOMMODATION_ERROR_ORDER.filter((field) => errors[field]).map((field) =>
        formatValidationSummaryItem(
          ACCOMMODATION_FIELD_LABELS[field] || field,
          errors[field],
        ),
      )
    : [];

  useEffect(() => {
    onRequiredCountChange?.(missingRequiredCount);
  }, [missingRequiredCount, onRequiredCountChange]);

  const handleInputChange = <K extends keyof AccommodationStepData>(
    field: K,
    value: AccommodationStepData[K],
  ) => {
    persist({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: "" }));
    }
  };

  const handleNumberInputChange = (
    field: "monthlyRent" | "minutesToUniversity",
    value: string,
  ) => {
    handleInputChange(
      field,
      value === "" || !/^-?\d+(\.\d+)?$/.test(value)
        ? undefined
        : (Number(value) as any),
    );
  };

  const validate = () => {
    const result = accommodationStepSchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      return true;
    }

    const nextErrors: Record<string, string> = {};
    result.error.errors.forEach((error) => {
      const path = error.path.join(".");
      nextErrors[path || "_form"] = error.message;
    });

    setErrors(nextErrors);
    return false;
  };

  const handleContinue = () => {
    const sanitized = sanitizeAccommodationStepData(formData);
    setHasAttemptedContinue(true);

    if (validate()) {
      setHasAttemptedContinue(false);
      void onComplete({ accommodation: sanitized });
    } else {
      scrollToFirstValidationError();
    }
  };

  const handleSave = () => {
    void onSave({
      accommodation: sanitizeAccommodationStepData(formData),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-gray-900">
            Accommodation details
          </h3>
          <p className="text-sm text-gray-600">
            Share only general housing details. Do not include exact addresses
            or contact details.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Accommodation type *</Label>
            <EnhancedSelect
              value={formData.accommodationType}
              onValueChange={(value) =>
                handleInputChange("accommodationType", value as any)
              }
            >
              <EnhancedSelectTrigger error={errors.accommodationType}>
                <EnhancedSelectValue placeholder="Select type" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                {ACCOMMODATION_TYPE_OPTIONS.map((option) => (
                  <EnhancedSelectItem key={option.value} value={option.value}>
                    {option.label}
                  </EnhancedSelectItem>
                ))}
              </EnhancedSelectContent>
            </EnhancedSelect>
            {errors.accommodationType && (
              <p className="text-sm text-red-500">{errors.accommodationType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Monthly rent *</Label>
            <div className="flex gap-2">
              <EnhancedInput
                id="monthlyRent"
                type="number"
                placeholder="e.g. 450"
                value={formData.monthlyRent ?? ""}
                onChange={(event) =>
                  handleNumberInputChange("monthlyRent", event.target.value)
                }
                error={errors.monthlyRent}
                className="flex-1"
              />
              <div className="w-24">
                <EnhancedSelect
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                >
                  <EnhancedSelectTrigger>
                    <EnhancedSelectValue />
                  </EnhancedSelectTrigger>
                  <EnhancedSelectContent>
                    <EnhancedSelectItem value="EUR">EUR</EnhancedSelectItem>
                    <EnhancedSelectItem value="USD">USD</EnhancedSelectItem>
                    <EnhancedSelectItem value="GBP">GBP</EnhancedSelectItem>
                  </EnhancedSelectContent>
                </EnhancedSelect>
              </div>
            </div>
            {!errors.monthlyRent && (
              <p className="text-sm text-gray-500">
                Use the amount you paid per month.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Bills included *</Label>
            <EnhancedSelect
              value={formData.billsIncluded}
              onValueChange={(value) =>
                handleInputChange("billsIncluded", value as any)
              }
            >
              <EnhancedSelectTrigger error={errors.billsIncluded}>
                <EnhancedSelectValue placeholder="Select one" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                {BILLS_INCLUDED_OPTIONS.map((option) => (
                  <EnhancedSelectItem key={option.value} value={option.value}>
                    {option.label}
                  </EnhancedSelectItem>
                ))}
              </EnhancedSelectContent>
            </EnhancedSelect>
            {errors.billsIncluded && (
              <p className="text-sm text-red-500">{errors.billsIncluded}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Would recommend? *</Label>
            <EnhancedSelect
              value={
                typeof formData.wouldRecommend === "boolean"
                  ? formData.wouldRecommend
                    ? "yes"
                    : "no"
                  : undefined
              }
              onValueChange={(value) =>
                handleInputChange("wouldRecommend", value === "yes")
              }
            >
              <EnhancedSelectTrigger error={errors.wouldRecommend}>
                <EnhancedSelectValue placeholder="Select one" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                <EnhancedSelectItem value="yes">Yes</EnhancedSelectItem>
                <EnhancedSelectItem value="no">No</EnhancedSelectItem>
              </EnhancedSelectContent>
            </EnhancedSelect>
            {errors.wouldRecommend && (
              <p className="text-sm text-red-500">{errors.wouldRecommend}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Accommodation rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate accommodation ${star} star${star === 1 ? "" : "s"}`}
                  onClick={() => handleInputChange("accommodationRating", star)}
                  className="focus:outline-none transition-transform hover:scale-105"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (formData.accommodationRating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.accommodationRating && (
              <p className="text-sm text-red-500">
                {errors.accommodationRating}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="areaOrNeighborhood">
              Area or neighborhood (optional)
            </Label>
            <EnhancedInput
              id="areaOrNeighborhood"
              placeholder="e.g. Gracia, city center, near campus"
              value={formData.areaOrNeighborhood || ""}
              onChange={(event) =>
                handleInputChange("areaOrNeighborhood", event.target.value)
              }
              error={errors.areaOrNeighborhood}
              helperText="Keep this general, not exact."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutesToUniversity">
              Minutes to university (optional)
            </Label>
            <EnhancedInput
              id="minutesToUniversity"
              type="number"
              placeholder="e.g. 20"
              value={formData.minutesToUniversity ?? ""}
              onChange={(event) =>
                handleNumberInputChange(
                  "minutesToUniversity",
                  event.target.value,
                )
              }
              error={errors.minutesToUniversity}
              helperText="Approximate one-way time in minutes."
            />
          </div>

          <div className="space-y-2">
            <Label>How did you find it? (optional)</Label>
            <EnhancedSelect
              value={formData.howFoundAccommodation}
              onValueChange={(value) =>
                handleInputChange("howFoundAccommodation", value as any)
              }
            >
              <EnhancedSelectTrigger error={errors.howFoundAccommodation}>
                <EnhancedSelectValue placeholder="Optional" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                {HOW_FOUND_ACCOMMODATION_OPTIONS.map((option) => (
                  <EnhancedSelectItem key={option.value} value={option.value}>
                    {option.label}
                  </EnhancedSelectItem>
                ))}
              </EnhancedSelectContent>
            </EnhancedSelect>
            {errors.howFoundAccommodation && (
              <p className="text-sm text-red-500">
                {errors.howFoundAccommodation}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Difficulty finding accommodation (optional)</Label>
            <EnhancedSelect
              value={formData.difficultyFindingAccommodation}
              onValueChange={(value) =>
                handleInputChange(
                  "difficultyFindingAccommodation",
                  value as any,
                )
              }
            >
              <EnhancedSelectTrigger
                error={errors.difficultyFindingAccommodation}
              >
                <EnhancedSelectValue placeholder="Optional" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                {DIFFICULTY_FINDING_ACCOMMODATION_OPTIONS.map((option) => (
                  <EnhancedSelectItem key={option.value} value={option.value}>
                    {option.label}
                  </EnhancedSelectItem>
                ))}
              </EnhancedSelectContent>
            </EnhancedSelect>
            {errors.difficultyFindingAccommodation && (
              <p className="text-sm text-red-500">
                {errors.difficultyFindingAccommodation}
              </p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="accommodationReview">
              Accommodation review (optional)
            </Label>
            <EnhancedTextarea
              id="accommodationReview"
              placeholder="Short anonymous summary of the accommodation or area"
              value={formData.accommodationReview || ""}
              onChange={(event) =>
                handleInputChange("accommodationReview", event.target.value)
              }
              rows={4}
              error={errors.accommodationReview}
            />
          </div>
        </div>
      </section>

      <StepNavigation
        currentStep={3}
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
