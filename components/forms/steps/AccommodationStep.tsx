import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

import { EnhancedInput } from "@/components/ui/enhanced-input";
import { StepNavigation } from "@/components/forms/StepNavigation";
import {
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "@/components/ui/enhanced-select";
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
  accommodationRating: "Accommodation rating",
  wouldRecommend: "Would recommend",
  minutesToUniversity: "Minutes to university",
  accommodationReview: "Accommodation review",
};

const ACCOMMODATION_ERROR_ORDER = [
  "accommodationType",
  "monthlyRent",
  "billsIncluded",
  "accommodationRating",
  "wouldRecommend",
  "minutesToUniversity",
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
    (typeof formData.accommodationRating === "number" ? 0 : 1) +
    (typeof formData.wouldRecommend === "boolean" ? 0 : 1);

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
        <p className="text-sm text-orange-950">
          Step 3 now stores only anonymous, structured housing signals. Share a
          general area if useful, but do not include an exact address or any
          landlord contact details.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Housing Snapshot
            </h3>
            <p className="text-sm text-gray-500">
              Capture the structured housing details that future students can
              compare safely across cities and neighborhoods.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Accommodation Type *</Label>
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
              <p className="text-sm text-red-500 mt-1">
                {errors.accommodationType}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyRent">Monthly Rent *</Label>
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
          </div>

          <div className="space-y-2">
            <Label>Bills Included *</Label>
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
          </div>

          <div className="space-y-2">
            <Label>Would Recommend? *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="areaOrNeighborhood">Area or Neighborhood</Label>
            <EnhancedInput
              id="areaOrNeighborhood"
              placeholder="e.g. Gracia, city center, near campus"
              value={formData.areaOrNeighborhood || ""}
              onChange={(event) =>
                handleInputChange("areaOrNeighborhood", event.target.value)
              }
              helperText="Keep this general. Do not enter a full address."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutesToUniversity">Minutes to University</Label>
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
              helperText="Approximate one-way travel time in minutes."
            />
          </div>

          <div className="space-y-2">
            <Label>How Did You Find It?</Label>
            <EnhancedSelect
              value={formData.howFoundAccommodation}
              onValueChange={(value) =>
                handleInputChange("howFoundAccommodation", value as any)
              }
            >
              <EnhancedSelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>Difficulty Finding Accommodation</Label>
            <EnhancedSelect
              value={formData.difficultyFindingAccommodation}
              onValueChange={(value) =>
                handleInputChange(
                  "difficultyFindingAccommodation",
                  value as any,
                )
              }
            >
              <EnhancedSelectTrigger>
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
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
          <h3 className="text-xl font-semibold text-gray-900">
            Recommendation Snapshot
          </h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Accommodation Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleInputChange("accommodationRating", star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (formData.accommodationRating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.accommodationRating && (
              <p className="text-sm text-red-500 mt-1">
                {errors.accommodationRating}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accommodationReview">Accommodation Review</Label>
            <EnhancedTextarea
              id="accommodationReview"
              placeholder="Optional: share a short anonymous summary of the space, location, or booking experience."
              value={formData.accommodationReview || ""}
              onChange={(event) =>
                handleInputChange("accommodationReview", event.target.value)
              }
              rows={5}
              error={errors.accommodationReview}
            />
          </div>
        </div>
      </div>

      <StepNavigation
        currentStep={3}
        totalSteps={5}
        onPrevious={onPrevious}
        onSaveDraft={handleSave}
        onNext={handleContinue}
        isLastStep={false}
        showPrevious={Boolean(onPrevious)}
        helperText="Keep the housing details anonymous and complete the required fields to continue."
        missingRequiredCount={missingRequiredCount}
        validationSummary={validationSummary}
        saveState={saveState}
      />
    </div>
  );
}
