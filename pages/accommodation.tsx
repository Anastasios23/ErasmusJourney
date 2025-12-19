import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { accommodationFormSchema } from "../src/lib/formSchemas";
import { z } from "zod";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "../src/components/ui/badge";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Textarea } from "../src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { EnhancedInput } from "../src/components/ui/enhanced-input";
import {
  EnhancedSelect,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
  EnhancedSelectContent,
  EnhancedSelectItem,
} from "../src/components/ui/enhanced-select";
import { EnhancedTextarea } from "../src/components/ui/enhanced-textarea";
import {
  FormField,
  FormSection,
  FormGrid,
  DisabledFieldHint,
} from "../src/components/ui/form-components";
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Checkbox } from "../src/components/ui/checkbox";
import Header from "../components/Header";
import { SubmissionGuard } from "../components/SubmissionGuard";
import {
  ArrowRight,
  ArrowLeft,
  Home,
  Star,
  Euro,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { Toaster } from "../src/components/ui/toaster";
import { useErasmusExperience } from "../src/hooks/useErasmusExperience";
import { useFormProgress } from "../src/context/FormProgressContext";
import { FormProgressBar } from "../components/forms/FormProgressBar";
import { StepNavigation } from "../components/forms/StepNavigation";
import { StepGuard } from "../components/forms/StepGuard";

export default function Accommodation() {
  // AUTHENTICATION DISABLED - Comment out to re-enable
  // const { data: session } = useSession();
  const session = { user: { id: "anonymous", email: "anonymous@example.com" } };
  const router = useRouter();
  const {
    setCurrentStep,
    markStepCompleted,
    currentStepNumber,
    completedStepNumbers,
  } = useFormProgress();

  // Experience hook for new single-submission system
  const {
    data: experienceData,
    loading: experienceLoading,
    error: experienceError,
    saveProgress,
    submitExperience,
  } = useErasmusExperience();

  // Authentication temporarily disabled - all users can access

  const [formData, setFormData] = useState({
    accommodationAddress: "",
    accommodationType: "",
    landlordName: "",
    landlordEmail: "",
    landlordPhone: "",
    bookingLink: "",
    monthlyRent: "",
    billsIncluded: "",
    avgUtilityCost: "",
    accommodationRating: "",
    easyToFind: "",
    findingChallenges: "",
    wouldRecommend: "",
    recommendationReason: "",
    additionalNotes: "",
    neighborhood: "",
    transportLinks: "",
    nearbyAmenities: [],
    roomSize: "",
    roomFurnished: "",
    kitchenAccess: "",
    internetIncluded: "",
    laundryAccess: "",
    parkingAvailable: "",
    easyToFind: "",
    accommodationRating: "",
    accommodationAddress: "",
    accommodationType: "",
    monthlyRent: "",
    billsIncluded: "",
    avgUtilityCost: "",
    landlordName: "",
    landlordEmail: "",
    landlordPhone: "",
    bookingLink: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      nearbyAmenities: checked
        ? [...(prev.nearbyAmenities || []), amenity]
        : (prev.nearbyAmenities || []).filter((a) => a !== amenity),
    }));
  };

  // Load basic info data to get city/country information
  const [basicInfoData, setBasicInfoData] = useState<any>(null);

  // Load experience data when component mounts
  useEffect(() => {
    if (!experienceLoading && experienceData) {
      console.log("Loading experience data for accommodation:", experienceData);

      // Load basic info data
      if (experienceData.basicInfo) {
        // Ensure all values are strings, not undefined
        const safeBasicInfo = Object.entries(experienceData.basicInfo).reduce(
          (acc, [key, value]) => {
            acc[key] = value ?? "";
            return acc;
          },
          {} as Record<string, any>,
        );
        setBasicInfoData(safeBasicInfo);
      }

      // Load accommodation data if available
      if (experienceData.accommodation) {
        console.log(
          "Loading accommodation data:",
          experienceData.accommodation,
        );

        // Ensure all form data values are strings, not undefined
        const safeAccommodationData = Object.entries(
          experienceData.accommodation,
        ).reduce(
          (acc, [key, value]) => {
            if (Array.isArray(value)) {
              acc[key] = value; // Keep arrays as is
            } else {
              acc[key] = value ?? ""; // Convert undefined to empty string
            }
            return acc;
          },
          {} as Record<string, any>,
        );

        setFormData(safeAccommodationData as any);
      }
    }
  }, [experienceLoading, experienceData]); // Remove dependencies to prevent re-runs

  useEffect(() => {
    setCurrentStep("accommodation");
  }, [setCurrentStep]);

  // Load draft data when component mounts
  useEffect(() => {
    // If we have both draft data with city/country and basic info, make sure they match
    if (basicInfoData?.hostCity && basicInfoData?.hostCountry) {
      // If the draft data has different city/country than the basic info,
      // update the form data to use the basic info city/country
      if (
        !formData.hasOwnProperty("city") ||
        !formData.hasOwnProperty("country") ||
        formData["city" as keyof typeof formData] !== basicInfoData.hostCity ||
        formData["country" as keyof typeof formData] !==
          basicInfoData.hostCountry
      ) {
        console.log(
          "Updating accommodation draft with current basic info location",
        );
        setFormData((prev) => ({
          ...prev,
          city: basicInfoData.hostCity || "",
          country: basicInfoData.hostCountry || "",
        }));
      }
    }
  }, [basicInfoData]);

  // State for draft success/error messages
  const [draftSuccess, setDraftSuccess] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Save to localStorage helper function
  const saveToLocalStorage = useCallback(() => {
    const draftKey = `erasmus_form_accommodation`;
    const draftData = {
      type: "accommodation",
      title: "Accommodation Draft",
      data: formData,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
  }, [formData]);

  // Save draft to database (triggered by Save Draft button)
  const handleSaveDraftToDatabase = useCallback(async () => {
    try {
      // Get basic info for city/country enrichment
      const basicInfo = experienceData?.basicInfo;

      const enrichedFormData = {
        ...formData,
        city: basicInfo?.hostCity || "",
        country: basicInfo?.hostCountry || "",
        university: basicInfo?.hostUniversity || "",
      };

      // Map fields to match backend requirements
      const mappedData = {
        ...enrichedFormData,
        type: enrichedFormData.accommodationType,
        rent: enrichedFormData.monthlyRent,
        rating: enrichedFormData.accommodationRating,
      };

      await saveProgress({
        accommodation: mappedData,
      });

      setDraftSuccess("Draft saved successfully!");
      toast("Draft saved successfully!");
      setTimeout(() => setDraftSuccess(null), 3000);
    } catch (error) {
      console.error("Draft save error:", error);
      setDraftError("Failed to save draft. Please try again.");
      toast("Failed to save draft. Please try again.");
      setTimeout(() => setDraftError(null), 5000);
      throw error;
    }
  }, [formData, experienceData, saveProgress]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.accommodationType) newErrors.accommodationType = "Required";
    if (!formData.monthlyRent) newErrors.monthlyRent = "Required";
    if (!formData.accommodationRating) newErrors.accommodationRating = "Required";
    
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setIsSubmitting(false);
      toast.error("Please fill in all required fields.");
      return;
    }

    // Always save to localStorage first when navigating
    saveToLocalStorage();

    try {
      // Get basic info for city/country enrichment
      const basicInfo = experienceData?.basicInfo;

      const enrichedFormData = {
        ...formData,
        city: basicInfo?.hostCity || "",
        country: basicInfo?.hostCountry || "",
        university: basicInfo?.hostUniversity || "",
      };

      // Map fields to match backend requirements
      const mappedData = {
        ...enrichedFormData,
        type: enrichedFormData.accommodationType,
        rent: enrichedFormData.monthlyRent,
        rating: enrichedFormData.accommodationRating,
      };

      // Save progress with accommodation data
      const saved = await saveProgress({
        accommodation: mappedData,
      });

      if (!saved) {
        throw new Error("Failed to save progress. Please try again.");
      }

      // Mark step 3 as completed
      markStepCompleted("accommodation");

      // Navigate to next step
      router.push("/living-expenses");
    } catch (error) {
      console.error("Error submitting accommodation form:", error);
      setSubmitError("Failed to submit form. Please try again.");
      toast("Error", {
        description: "There was a problem saving your information.",
      });
      setIsSubmitting(false);
    }
  };

  const accommodationTypes = [
    "University Dorms",
    "Private Apartment",
    "Shared Apartment",
    "Student Residence",
    "Host Family",
    "Other",
  ];

  const amenities = [
    "Supermarket",
    "Public Transport",
    "Gym/Fitness Center",
    "Restaurants/Cafes",
    "Library",
    "Medical Center",
    "Shopping Mall",
    "Banks/ATMs",
    "Pharmacy",
    "Parks/Recreation",
  ];

  return (
    <SubmissionGuard>
      <Head>
        <title>Accommodation Details - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share details about your accommodation experience"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        <Toaster />

        {/* Progress Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FormProgressBar
            steps={[
              { number: 1, name: "Basic Info", href: "/basic-information" },
              { number: 2, name: "Courses", href: "/course-matching" },
              { number: 3, name: "Accommodation", href: "/accommodation" },
              { number: 4, name: "Living Expenses", href: "/living-expenses" },
              { number: 5, name: "Experience", href: "/help-future-students" },
            ]}
            currentStep={currentStepNumber}
            completedSteps={completedStepNumbers}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Display basic info context */}
          {basicInfoData && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Your accommodation will be associated with:
              </h3>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  <strong>{basicInfoData.hostCity}</strong>,{" "}
                  {basicInfoData.hostCountry}
                </p>
              </div>
              {basicInfoData.hostUniversity && (
                <div className="flex items-center gap-2 mt-1">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    <strong>{basicInfoData.hostUniversity}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Accommodation Information */}
            <FormSection
              title="Basic Accommodation Information"
              subtitle="Details about your accommodation location and type"
            >
              <FormField
                label="Address of Accommodation"
                required
                error={fieldErrors.accommodationAddress}
              >
                <EnhancedTextarea
                  id="accommodationAddress"
                  placeholder="Enter the full address of your accommodation..."
                  value={formData.accommodationAddress}
                  onChange={(e) =>
                    handleInputChange("accommodationAddress", e.target.value)
                  }
                  rows={3}
                  required
                  error={fieldErrors.accommodationAddress}
                />
              </FormField>

              <FormGrid columns={2}>
                <FormField
                  label="Type of Accommodation"
                  required
                  error={fieldErrors.accommodationType}
                >
                  <EnhancedSelect
                    value={formData.accommodationType || ""}
                    onValueChange={(value) =>
                      handleInputChange("accommodationType", value)
                    }
                  >
                    <EnhancedSelectTrigger
                      error={fieldErrors.accommodationType}
                    >
                      <EnhancedSelectValue placeholder="Select accommodation type" />
                    </EnhancedSelectTrigger>
                    <EnhancedSelectContent>
                      {accommodationTypes.map((type) => (
                        <EnhancedSelectItem key={type} value={type}>
                          {type}
                        </EnhancedSelectItem>
                      ))}
                    </EnhancedSelectContent>
                  </EnhancedSelect>
                </FormField>

                <FormField
                  label="Neighborhood/District"
                  error={fieldErrors.neighborhood}
                >
                  <EnhancedInput
                    id="neighborhood"
                    placeholder="e.g., Friedrichshain, Södermalm..."
                    value={formData.neighborhood}
                    onChange={(e) =>
                      handleInputChange("neighborhood", e.target.value)
                    }
                    error={fieldErrors.neighborhood}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Contact Details */}
            <FormSection
              title="Landlord Contact Details"
              subtitle="Contact information for your accommodation provider"
            >
              <FormGrid columns={2}>
                <FormField
                  label="Landlord Name"
                  error={fieldErrors.landlordName}
                >
                  <EnhancedInput
                    id="landlordName"
                    placeholder="Enter landlord's name"
                    value={formData.landlordName}
                    onChange={(e) =>
                      handleInputChange("landlordName", e.target.value)
                    }
                    error={fieldErrors.landlordName}
                  />
                </FormField>

                <FormField
                  label="Email Address"
                  error={fieldErrors.landlordEmail}
                >
                  <EnhancedInput
                    id="landlordEmail"
                    type="email"
                    placeholder="landlord@example.com"
                    value={formData.landlordEmail}
                    onChange={(e) =>
                      handleInputChange("landlordEmail", e.target.value)
                    }
                    error={fieldErrors.landlordEmail}
                  />
                </FormField>

                <FormField
                  label="Phone Number"
                  error={fieldErrors.landlordPhone}
                >
                  <EnhancedInput
                    id="landlordPhone"
                    placeholder="+49 123 456789"
                    value={formData.landlordPhone}
                    onChange={(e) =>
                      handleInputChange("landlordPhone", e.target.value)
                    }
                    error={fieldErrors.landlordPhone}
                  />
                </FormField>

                <FormField
                  label="Booking Link (if applicable)"
                  error={fieldErrors.bookingLink}
                >
                  <EnhancedInput
                    id="bookingLink"
                    placeholder="https://..."
                    value={formData.bookingLink}
                    onChange={(e) =>
                      handleInputChange("bookingLink", e.target.value)
                    }
                    error={fieldErrors.bookingLink}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Financial Details */}
            <FormSection
              title="Financial Details"
              subtitle="Monthly rent and utility costs for your accommodation"
              icon={Euro}
            >
              <FormGrid columns={2}>
                <FormField
                  label="Monthly Rent (€)"
                  required
                  error={fieldErrors.monthlyRent}
                >
                  <EnhancedInput
                    id="monthlyRent"
                    type="number"
                    placeholder="e.g., 450"
                    value={formData.monthlyRent}
                    onChange={(e) =>
                      handleInputChange("monthlyRent", e.target.value)
                    }
                    error={fieldErrors.monthlyRent}
                  />
                </FormField>

                <FormField
                  label="Were ALL the bills included?"
                  required
                  error={fieldErrors.billsIncluded}
                >
                  <EnhancedSelect
                    value={formData.billsIncluded || ""}
                    onValueChange={(value) =>
                      handleInputChange("billsIncluded", value)
                    }
                  >
                    <EnhancedSelectTrigger error={fieldErrors.billsIncluded}>
                      <EnhancedSelectValue placeholder="Select an option" />
                    </EnhancedSelectTrigger>
                    <EnhancedSelectContent>
                      <EnhancedSelectItem value="yes">
                        Yes, all bills included
                      </EnhancedSelectItem>
                      <EnhancedSelectItem value="no">
                        No, additional utility costs
                      </EnhancedSelectItem>
                    </EnhancedSelectContent>
                  </EnhancedSelect>
                </FormField>
              </FormGrid>

              {formData.billsIncluded === "no" && (
                <FormField
                  label="Average Monthly Expense for Utility Bills Not Included (€)"
                  required
                  error={fieldErrors.avgUtilityCost}
                >
                  <EnhancedInput
                    id="avgUtilityCost"
                    type="number"
                    placeholder="e.g., 80"
                    value={formData.avgUtilityCost}
                    onChange={(e) =>
                      handleInputChange("avgUtilityCost", e.target.value)
                    }
                    error={fieldErrors.avgUtilityCost}
                  />
                </FormField>
              )}
            </FormSection>

            {/* Facilities and Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Facilities and Amenities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Kitchen Access</Label>
                      <RadioGroup
                        value={formData.kitchenAccess}
                        onValueChange={(value) =>
                          handleInputChange("kitchenAccess", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="private"
                            id="kitchen-private"
                          />
                          <Label htmlFor="kitchen-private">Private</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="shared" id="kitchen-shared" />
                          <Label htmlFor="kitchen-shared">Shared</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="kitchen-none" />
                          <Label htmlFor="kitchen-none">None</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Internet Included</Label>
                      <RadioGroup
                        value={formData.internetIncluded}
                        onValueChange={(value) =>
                          handleInputChange("internetIncluded", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="internet-yes" />
                          <Label htmlFor="internet-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="internet-no" />
                          <Label htmlFor="internet-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Laundry Access</Label>
                      <RadioGroup
                        value={formData.laundryAccess}
                        onValueChange={(value) =>
                          handleInputChange("laundryAccess", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-room" id="laundry-room" />
                          <Label htmlFor="laundry-room">In Room</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="shared" id="laundry-shared" />
                          <Label htmlFor="laundry-shared">
                            Shared Facility
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nearby" id="laundry-nearby" />
                          <Label htmlFor="laundry-nearby">
                            Nearby Laundromat
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Parking Available</Label>
                      <RadioGroup
                        value={formData.parkingAvailable}
                        onValueChange={(value) =>
                          handleInputChange("parkingAvailable", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="parking-yes" />
                          <Label htmlFor="parking-yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="parking-no" />
                          <Label htmlFor="parking-no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nearby Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={amenity}
                          checked={(formData.nearbyAmenities || []).includes(
                            amenity,
                          )}
                          onCheckedChange={(checked) =>
                            handleAmenityChange(amenity, checked as boolean)
                          }
                        />
                        <Label htmlFor={amenity} className="text-sm">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transportLinks">Transport Links</Label>
                  <Textarea
                    id="transportLinks"
                    placeholder="Describe nearby public transport (metro, bus, tram stations, etc.)..."
                    value={formData.transportLinks}
                    onChange={(e) =>
                      handleInputChange("transportLinks", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Evaluation and Recommendation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Evaluation and Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="accommodationRating">
                      Rating (1-5 stars)
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        handleInputChange("accommodationRating", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Poor</SelectItem>
                        <SelectItem value="2">2 - Fair</SelectItem>
                        <SelectItem value="3">3 - Good</SelectItem>
                        <SelectItem value="4">4 - Very Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Was it easy to find accommodation?</Label>
                    <RadioGroup
                      value={formData.easyToFind}
                      onValueChange={(value) =>
                        handleInputChange("easyToFind", value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="easy-yes" />
                        <Label htmlFor="easy-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="easy-no" />
                        <Label htmlFor="easy-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {formData.easyToFind === "no" && (
                  <div className="space-y-2">
                    <Label htmlFor="findingChallenges">
                      What were the challenges?
                    </Label>
                    <Textarea
                      id="findingChallenges"
                      placeholder="Describe the challenges you faced when looking for accommodation..."
                      value={formData.findingChallenges}
                      onChange={(e) =>
                        handleInputChange("findingChallenges", e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Would you recommend this accommodation?</Label>
                    <RadioGroup
                      value={formData.wouldRecommend}
                      onValueChange={(value) =>
                        handleInputChange("wouldRecommend", value)
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="recommend-yes" />
                        <Label htmlFor="recommend-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="recommend-no" />
                        <Label htmlFor="recommend-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.wouldRecommend === "no" && (
                    <div className="space-y-2">
                      <Label htmlFor="recommendationReason">Why not?</Label>
                      <Textarea
                        id="recommendationReason"
                        placeholder="Explain why you wouldn't recommend this accommodation..."
                        value={formData.recommendationReason}
                        onChange={(e) =>
                          handleInputChange(
                            "recommendationReason",
                            e.target.value,
                          )
                        }
                        rows={4}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Any additional tips, warnings, or information that would help future students..."
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      handleInputChange("additionalNotes", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="pt-8">
              <StepNavigation
                currentStep={currentStepNumber}
                totalSteps={5}
                onPrevious={() => router.push("/course-matching")}
                onNext={handleSubmit}
                onSaveDraft={handleSaveDraftToDatabase}
                canProceed={!isSubmitting}
                isLastStep={false}
                isSubmitting={isSubmitting}
                showPrevious={true}
                showSaveDraft={true}
              />
            </div>
          </form>
        </div>
      </div>
    </SubmissionGuard>
  );
}
