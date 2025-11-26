import React, { useState, useEffect } from "react";
import { useFormContext } from "../FormProvider";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import {
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "@/components/ui/enhanced-select";
import { EnhancedTextarea } from "@/components/ui/enhanced-textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface AccommodationData {
  type: string;
  rent: string;
  currency: string;
  duration: string;
  rating: number;
  review: string;
  address?: string;
  distanceToUniversity?: string;
}

interface AccommodationStepProps {
  data: any;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
}

export default function AccommodationStep({
  data,
  onComplete,
  onSave,
}: AccommodationStepProps) {
  const { updateFormData } = useFormContext();
  const [formData, setFormData] = useState<AccommodationData>({
    type: "",
    rent: "",
    currency: "EUR",
    duration: "",
    rating: 0,
    review: "",
    address: "",
    distanceToUniversity: "",
    ...data?.accommodation,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.accommodation) {
      setFormData((prev) => ({ ...prev, ...data.accommodation }));
    }
  }, [data]);

  const handleInputChange = (field: keyof AccommodationData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateFormData("accommodation", newData);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type) newErrors.type = "Required";
    if (!formData.rent) newErrors.rent = "Required";
    if (!formData.rating) newErrors.rating = "Please provide a rating";
    if (!formData.review) newErrors.review = "Please write a brief review";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onComplete({ accommodation: formData });
    } else {
      const firstError = document.querySelector(".text-red-500");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Accommodation Details
            </h3>
            <p className="text-sm text-gray-500">
              Share your living experience to help future students find housing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Accommodation Type *</Label>
            <EnhancedSelect
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <EnhancedSelectTrigger error={errors.type}>
                <EnhancedSelectValue placeholder="Select type" />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                <EnhancedSelectItem value="Dormitory">University Dormitory</EnhancedSelectItem>
                <EnhancedSelectItem value="Shared Apartment">Shared Apartment (Flatshare)</EnhancedSelectItem>
                <EnhancedSelectItem value="Private Studio">Private Studio/Apartment</EnhancedSelectItem>
                <EnhancedSelectItem value="Host Family">Host Family</EnhancedSelectItem>
                <EnhancedSelectItem value="Other">Other</EnhancedSelectItem>
              </EnhancedSelectContent>
            </EnhancedSelect>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rent">Monthly Rent *</Label>
            <div className="flex gap-2">
              <EnhancedInput
                id="rent"
                type="number"
                placeholder="e.g. 450"
                value={formData.rent}
                onChange={(e) => handleInputChange("rent", e.target.value)}
                error={errors.rent}
                className="flex-1"
              />
              <div className="w-24">
                <EnhancedSelect
                  value={formData.currency}
                  onValueChange={(value) => handleInputChange("currency", value)}
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
            <Label htmlFor="address">Address / Area (Optional)</Label>
            <EnhancedInput
              id="address"
              placeholder="e.g. City Center, near Central Station"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="distance">Distance to University (Optional)</Label>
            <EnhancedInput
              id="distance"
              placeholder="e.g. 15 min walk, 20 min bus"
              value={formData.distanceToUniversity}
              onChange={(e) => handleInputChange("distanceToUniversity", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
          <h3 className="text-xl font-semibold text-gray-900">
            Review & Rating
          </h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleInputChange("rating", star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-red-500 mt-1">{errors.rating}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review *</Label>
            <EnhancedTextarea
              id="review"
              placeholder="Describe your accommodation experience. Was it clean? Social? Good location? Any tips for finding housing?"
              value={formData.review}
              onChange={(e) => handleInputChange("review", e.target.value)}
              rows={5}
              error={errors.review}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={() => onSave({ accommodation: formData })}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          Save Draft
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Continue to Living Expenses
        </button>
      </div>
    </div>
  );
}
