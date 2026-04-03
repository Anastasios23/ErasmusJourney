import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "@/components/forms/StepNavigation";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { Star, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react";
import { sanitizeBasicInformationData } from "@/lib/basicInformation";
import {
  getAccommodationTypeLabel,
  getBillsIncludedLabel,
  sanitizeAccommodationStepData,
} from "@/lib/accommodation";
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
  bestExperience: "Best experience",
  generalTips: "Top tips",
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
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.overallRating)
      newErrors.overallRating = "Please rate your overall experience";
    if (!formData.bestExperience) newErrors.bestExperience = "Required";
    if (!formData.generalTips) newErrors.generalTips = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          : "No course mappings saved yet",
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-purple-500 rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Overall Experience
            </h3>
            <p className="text-sm text-gray-500">
              Reflect on your Erasmus journey as a whole.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>How would you rate your Erasmus experience overall? *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleInputChange("overallRating", star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= formData.overallRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.overallRating && (
              <p className="text-sm text-red-500 mt-1">
                {errors.overallRating}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <ThumbsUp className="w-4 h-4" />
                <Label htmlFor="best" className="text-green-700">
                  Best Experience *
                </Label>
              </div>
              <EnhancedTextarea
                id="best"
                placeholder="What was the highlight of your exchange?"
                value={formData.bestExperience}
                onChange={(e) =>
                  handleInputChange("bestExperience", e.target.value)
                }
                rows={4}
                error={errors.bestExperience}
                className="bg-green-50/30 border-green-100 focus:border-green-300 focus:ring-green-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <ThumbsDown className="w-4 h-4" />
                <Label htmlFor="worst" className="text-red-700">
                  Challenges Faced
                </Label>
              </div>
              <EnhancedTextarea
                id="worst"
                placeholder="What difficulties did you encounter? How did you overcome them?"
                value={formData.worstExperience}
                onChange={(e) =>
                  handleInputChange("worstExperience", e.target.value)
                }
                rows={4}
                className="bg-red-50/30 border-red-100 focus:border-red-300 focus:ring-red-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Tips & Advice
            </h3>
            <p className="text-sm text-gray-500">
              Help future students prepare for their journey.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              <Label htmlFor="tips">Top Tips for Future Students *</Label>
            </div>
            <EnhancedTextarea
              id="tips"
              placeholder="Share your top 3 tips for someone going to this university/city..."
              value={formData.generalTips}
              onChange={(e) => handleInputChange("generalTips", e.target.value)}
              rows={4}
              error={errors.generalTips}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="academic">Academic Advice</Label>
              <EnhancedTextarea
                id="academic"
                placeholder="Tips on courses, exams, professors, or studying..."
                value={formData.academicAdvice}
                onChange={(e) =>
                  handleInputChange("academicAdvice", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social">Social Life Advice</Label>
              <EnhancedTextarea
                id="social"
                placeholder="Tips on meeting people, nightlife, clubs, or events..."
                value={formData.socialAdvice}
                onChange={(e) =>
                  handleInputChange("socialAdvice", e.target.value)
                }
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-pink-500 rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Share Your Photos
            </h3>
            <p className="text-sm text-gray-500">
              Upload photos from your Erasmus journey to inspire future
              students.
            </p>
          </div>
        </div>

        <PhotoUpload
          photos={formData.photos || []}
          onPhotosChange={(photos) => handleInputChange("photos", photos)}
          maxPhotos={5}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Review before you submit
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Double-check the details below. Edit any step before you submit your
            single Erasmus experience.
          </p>
        </div>

        <div className="space-y-4">
          {reviewItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-950/80"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.label}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
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
      </div>

      <StepNavigation
        currentStep={5}
        totalSteps={5}
        onPrevious={onPrevious}
        onSaveDraft={handleSave}
        onSubmit={handleComplete}
        isLastStep
        isSubmitting={isSubmitting}
        showPrevious={Boolean(onPrevious)}
        helperText="Submit only after the review matches the experience you want to share."
        missingRequiredCount={missingRequiredCount}
        validationSummary={validationSummary}
        saveState={saveState}
      />
    </div>
  );
}
