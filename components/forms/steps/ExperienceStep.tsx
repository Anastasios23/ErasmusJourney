import React, { useState, useEffect } from "react";
import { useFormContext } from "../FormProvider";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Label } from "@/components/ui/label";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { Star, ThumbsUp, ThumbsDown, Lightbulb, Camera } from "lucide-react";

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
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
}

export default function ExperienceStep({
  data,
  onComplete,
  onSave,
}: ExperienceStepProps) {
  const { updateFormData } = useFormContext();
  const [formData, setFormData] = useState<ExperienceData>({
    overallRating: 0,
    bestExperience: "",
    worstExperience: "",
    academicAdvice: "",
    socialAdvice: "",
    generalTips: "",
    photos: [],
    ...data?.experience,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.experience) {
      setFormData((prev) => ({ ...prev, ...data.experience }));
    }
  }, [data]);

  const handleInputChange = (field: keyof ExperienceData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateFormData("experience", newData);

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
    if (validate()) {
      onComplete({ experience: formData });
    } else {
      const firstError = document.querySelector(".text-red-500");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

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

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={() => onSave({ experience: formData })}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Save Draft
        </button>
        <button
          onClick={handleComplete}
          className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Submit Experience
        </button>
      </div>
    </div>
  );
}
