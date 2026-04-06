import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";

import { StepNavigation } from "../StepNavigation";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Label } from "@/components/ui/label";
import {
  getAccommodationTypeLabel,
  getBillsIncludedLabel,
  sanitizeAccommodationStepData,
} from "@/lib/accommodation";
import { sanitizeBasicInformationData } from "@/lib/basicInformation";
import { sanitizeCourseMappingsData } from "@/lib/courseMatching";
import {
  calculateLivingExpensesTotal,
  sanitizeLivingExpensesStepData,
} from "@/lib/livingExpenses";
import {
  type ShareExperienceSaveState,
  formatValidationSummaryItem,
  scrollToFirstValidationError,
} from "@/lib/shareExperienceUi";

interface ExperienceData {
  overallRating: number;
  bestExperience: string;
  worstExperience: string;
  academicAdvice: string;
  socialAdvice: string;
  generalTips: string;
  photos: string[];
}

interface ExperienceStepProps {
  data: any;
  onComplete: (data: any) => void | Promise<void>;
  onSave: (data: any) => void | Promise<void>;
  onPrevious?: () => void;
  onGoToStep?: (stepNumber: number) => void;
  isSubmitting?: boolean;
  saveState?: ShareExperienceSaveState;
  onRequiredCountChange?: (count: number) => void;
}

const EXPERIENCE_FIELD_LABELS: Record<string, string> = {
  overallRating: "Overall rating",
  bestExperience: "Best part of your Erasmus",
  generalTips: "Top tips for future students",
};

function createExperienceFormData(value?: Partial<ExperienceData> | null) {
  return {
    overallRating: 0,
    bestExperience: "",
    worstExperience: "",
    academicAdvice: "",
    socialAdvice: "",
    generalTips: "",
    photos: [],
    ...(value || {}),
  };
}

export default function ExperienceStep({
  data,
  onComplete,
  onSave,
  onPrevious,
  onGoToStep,
  isSubmitting = false,
  saveState = "idle",
  onRequiredCountChange,
}: ExperienceStepProps) {
  const [formData, setFormData] = useState<ExperienceData>(() =>
    createExperienceFormData(data?.experience),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedContinue, setHasAttemptedContinue] = useState(false);

  useEffect(() => {
    setFormData(createExperienceFormData(data?.experience));
  }, [data?.experience]);

  const basicInfo = sanitizeBasicInformationData(data?.basicInfo);
  const courseMappings = sanitizeCourseMappingsData(data?.courses);
  const accommodation = sanitizeAccommodationStepData(data?.accommodation);
  const livingExpenses = sanitizeLivingExpensesStepData(data?.livingExpenses, {
    fallbackRent:
      typeof accommodation.monthlyRent === "number"
        ? accommodation.monthlyRent
        : null,
  });
  const totalLivingExpenses = calculateLivingExpensesTotal(livingExpenses);

  const missingRequiredCount =
    (formData.overallRating ? 0 : 1) +
    (formData.bestExperience.trim() ? 0 : 1) +
    (formData.generalTips.trim() ? 0 : 1);

  const validationSummary = hasAttemptedContinue
    ? ["overallRating", "bestExperience", "generalTips"]
        .filter((field) => errors[field])
        .map((field) =>
          formatValidationSummaryItem(
            EXPERIENCE_FIELD_LABELS[field] || field,
            errors[field],
          ),
        )
    : [];

  useEffect(() => {
    onRequiredCountChange?.(missingRequiredCount);
  }, [missingRequiredCount, onRequiredCountChange]);

  const handleInputChange = (field: keyof ExperienceData, value: any) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.overallRating) {
      nextErrors.overallRating = "Please rate your overall experience";
    }

    if (!formData.bestExperience.trim()) {
      nextErrors.bestExperience = "Required";
    }

    if (!formData.generalTips.trim()) {
      nextErrors.generalTips = "Required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleComplete = () => {
    setHasAttemptedContinue(true);

    if (validate()) {
      setHasAttemptedContinue(false);
      void onComplete({ experience: formData });
    } else {
      scrollToFirstValidationError();
    }
  };

  const handleSave = () => {
    void onSave({ experience: formData });
  };

  const livingExpenseSummaryParts = [
    totalLivingExpenses > 0
      ? `Total ${totalLivingExpenses.toFixed(0)} ${livingExpenses.currency} / month`
      : null,
    typeof livingExpenses.food === "number"
      ? `Food ${livingExpenses.food}`
      : null,
    typeof livingExpenses.transport === "number"
      ? `Transport ${livingExpenses.transport}`
      : null,
    typeof livingExpenses.social === "number"
      ? `Social ${livingExpenses.social}`
      : null,
  ].filter(Boolean);

  const reviewItems = [
    {
      label: "Home university / department",
      summary: [basicInfo.homeUniversity, basicInfo.homeDepartment]
        .filter(Boolean)
        .join(" | "),
      stepNumber: 1,
    },
    {
      label: "Host university / city / country",
      summary: [
        basicInfo.hostUniversity,
        basicInfo.hostCity,
        basicInfo.hostCountry,
      ]
        .filter(Boolean)
        .join(" | "),
      stepNumber: 1,
    },
    {
      label: "Course mappings",
      summary:
        courseMappings.length > 0
          ? `${courseMappings.length} mapping${
              courseMappings.length === 1 ? "" : "s"
            } added`
          : "No saved details yet",
      stepNumber: 2,
    },
    {
      label: "Accommodation summary",
      summary: [
        accommodation.accommodationType
          ? getAccommodationTypeLabel(accommodation.accommodationType)
          : null,
        typeof accommodation.monthlyRent === "number"
          ? `${accommodation.monthlyRent} ${accommodation.currency} / month`
          : null,
        accommodation.billsIncluded
          ? `Bills: ${getBillsIncludedLabel(accommodation.billsIncluded)}`
          : null,
      ]
        .filter(Boolean)
        .join(" | "),
      stepNumber: 3,
    },
    {
      label: "Living expenses summary",
      summary: livingExpenseSummaryParts.join(" | "),
      stepNumber: 4,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-gray-900">
            Final reflections
          </h3>
          <p className="text-sm text-gray-600">
            Share the most useful parts of your Erasmus experience.
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label>Overall rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate your Erasmus experience ${star} star${star === 1 ? "" : "s"}`}
                  onClick={() => handleInputChange("overallRating", star)}
                  className="focus:outline-none transition-transform hover:scale-105"
                >
                  <Star
                    className={`h-9 w-9 ${
                      star <= formData.overallRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.overallRating && (
              <p className="text-sm text-red-500">{errors.overallRating}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bestExperience">Best part of your Erasmus *</Label>
            <EnhancedTextarea
              id="bestExperience"
              placeholder="What stood out most during your exchange?"
              value={formData.bestExperience}
              onChange={(event) =>
                handleInputChange("bestExperience", event.target.value)
              }
              rows={4}
              error={errors.bestExperience}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="generalTips">Top tips for future students *</Label>
            <EnhancedTextarea
              id="generalTips"
              placeholder="What should future students know before they go?"
              value={formData.generalTips}
              onChange={(event) =>
                handleInputChange("generalTips", event.target.value)
              }
              rows={4}
              error={errors.generalTips}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="challenges">Challenges (optional)</Label>
              <EnhancedTextarea
                id="challenges"
                placeholder="Any difficulties you faced and how you handled them"
                value={formData.worstExperience}
                onChange={(event) =>
                  handleInputChange("worstExperience", event.target.value)
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicAdvice">Academic advice (optional)</Label>
              <EnhancedTextarea
                id="academicAdvice"
                placeholder="Courses, exams, professors, or study tips"
                value={formData.academicAdvice}
                onChange={(event) =>
                  handleInputChange("academicAdvice", event.target.value)
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialAdvice">Social advice (optional)</Label>
              <EnhancedTextarea
                id="socialAdvice"
                placeholder="Meeting people, events, clubs, or daily life"
                value={formData.socialAdvice}
                onChange={(event) =>
                  handleInputChange("socialAdvice", event.target.value)
                }
                rows={3}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-gray-900">
            Photos (optional)
          </h3>
          <p className="text-sm text-gray-600">
            Upload up to 5 photos if you want to include them.
          </p>
        </div>

        <div className="mt-4">
          <PhotoUpload
            photos={formData.photos || []}
            onPhotosChange={(photos) => handleInputChange("photos", photos)}
            maxPhotos={5}
            compact
          />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-gray-900">
            Review your submission
          </h3>
          <p className="text-sm text-gray-600">
            Edit steps 1 to 4 if anything needs updating before you submit.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {reviewItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {item.label}
                </p>
                <p className="text-sm text-gray-500">
                  {item.summary || "No saved details yet"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onGoToStep?.(item.stepNumber)}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      </section>

      <StepNavigation
        currentStep={5}
        totalSteps={5}
        onPrevious={onPrevious}
        onSaveDraft={handleSave}
        onSubmit={handleComplete}
        isLastStep
        isSubmitting={isSubmitting}
        showPrevious={Boolean(onPrevious)}
        missingRequiredCount={missingRequiredCount}
        validationSummary={validationSummary}
        saveState={saveState}
      />
    </div>
  );
}
