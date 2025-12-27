import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "../src/hooks/use-toast";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ValidationError } from "../src/utils/apiErrorHandler";
import { useErasmusExperience } from "../src/hooks/useErasmusExperience";
import { useFormProgress } from "../src/context/FormProgressContext";
import { FormProgressBar } from "../components/forms/FormProgressBar";
import { StepNavigation } from "../components/forms/StepNavigation";
import { StepGuard } from "../components/forms/StepGuard";

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
  EnhancedSelect,
  EnhancedSelectContent,
  EnhancedSelectItem,
  EnhancedSelectTrigger,
  EnhancedSelectValue,
} from "../src/components/ui/enhanced-select";
import { EnhancedInput } from "../src/components/ui/enhanced-input";
import { EnhancedTextarea } from "../src/components/ui/enhanced-textarea";
import {
  FormField,
  FormSection,
  FormGrid,
  DisabledFieldHint,
} from "../src/components/ui/form-components";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Checkbox } from "../src/components/ui/checkbox";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/ui/hero-section";
import Header from "../components/Header";
import { SubmissionGuard } from "../components/SubmissionGuard";
import { cn } from "../src/lib/utils";

export default function Accommodation() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [sessionStatus, router]);

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
  } = useErasmusExperience();

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
    nearbyAmenities: [] as string[],
    roomSize: "",
    roomFurnished: "",
    kitchenAccess: "",
    internetIncluded: "",
    laundryAccess: "",
    parkingAvailable: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load experience data when component mounts
  useEffect(() => {
    if (!experienceLoading && experienceData) {
      // Load accommodation data if available
      if (experienceData.accommodation) {
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

        setFormData((prev) => ({ ...prev, ...(safeAccommodationData as any) }));
      }
    }
  }, [experienceLoading, experienceData]);

  useEffect(() => {
    setCurrentStep("accommodation");
  }, [setCurrentStep]);

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

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasFormData = Object.values(formData).some((value) => {
        if (typeof value === "string") return value.trim() !== "";
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined;
      });

      if (hasFormData) {
        saveToLocalStorage();
        setShowSavedIndicator(true);
        setTimeout(() => setShowSavedIndicator(false), 2000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, saveToLocalStorage]);

  // Save draft to database
  const handleSaveDraftToDatabase = useCallback(async () => {
    try {
      const basicInfo = experienceData?.basicInfo;

      const mappedData = {
        ...formData,
        city: basicInfo?.hostCity || "",
        country: basicInfo?.hostCountry || "",
        university: basicInfo?.hostUniversity || "",
        type: formData.accommodationType,
        rent: formData.monthlyRent,
        rating: formData.accommodationRating,
      };

      await saveProgress({
        accommodation: mappedData,
      });

      toast({
        title: "Draft Saved",
        description: "Your accommodation details have been saved.",
      });
    } catch (error) {
      console.error("Draft save error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save draft. Please try again.",
      });
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
    if (!formData.accommodationRating)
      newErrors.accommodationRating = "Required";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    saveToLocalStorage();

    try {
      const basicInfo = experienceData?.basicInfo;

      const mappedData = {
        ...formData,
        city: basicInfo?.hostCity || "",
        country: basicInfo?.hostCountry || "",
        university: basicInfo?.hostUniversity || "",
        type: formData.accommodationType,
        rent: formData.monthlyRent,
        rating: formData.accommodationRating,
      };

      const saved = await saveProgress({
        accommodation: mappedData,
      });

      if (!saved) throw new Error("Failed to save progress.");

      markStepCompleted("accommodation");
      router.push("/living-expenses");
    } catch (error) {
      console.error("Error submitting accommodation form:", error);
      setSubmitError("Failed to submit form. Please try again.");
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
    <StepGuard requiredStep={3}>
      <SubmissionGuard>
        <Head>
          <title>Accommodation - Erasmus Journey Platform</title>
        </Head>

        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <Header />

          <HeroSection
            badge="Step 3 of 5"
            badgeIcon="solar:home-2-bold"
            title="Accommodation Details"
            description="Share your living experience abroad. Your insights help future students find the best places to stay and budget effectively."
            gradient="emerald"
            size="sm"
            animatedTitle
          />

          <div className="pb-16 px-4">
            <div className="max-w-4xl mx-auto -mt-8 relative z-20">
              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-500/5 dark:shadow-none border border-slate-100 dark:border-slate-800 mb-8"
              >
                <FormProgressBar
                  steps={[
                    {
                      number: 1,
                      name: "Basic Info",
                      href: "/basic-information",
                    },
                    { number: 2, name: "Courses", href: "/course-matching" },
                    {
                      number: 3,
                      name: "Accommodation",
                      href: "/accommodation",
                    },
                    {
                      number: 4,
                      name: "Living Expenses",
                      href: "/living-expenses",
                    },
                    {
                      number: 5,
                      name: "Experience",
                      href: "/help-future-students",
                    },
                  ]}
                  currentStep={currentStepNumber}
                  completedSteps={completedStepNumbers}
                />
              </motion.div>

              {/* Context Info */}
              {experienceData?.basicInfo?.hostCity && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-3xl p-6 flex items-center gap-4 shadow-lg shadow-emerald-500/5"
                >
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl text-white shadow-lg shadow-emerald-500/25">
                    <Icon
                      icon="solar:map-point-wave-bold"
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Location Context
                    </p>
                    <p className="text-slate-900 dark:text-white font-bold text-lg">
                      {experienceData.basicInfo.hostCity},{" "}
                      {experienceData.basicInfo.hostCountry}
                    </p>
                  </div>
                </motion.div>
              )}

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Basic Info */}
                <FormSection
                  variant="emerald"
                  title="Living Arrangements"
                  subtitle="Where did you stay during your Erasmus?"
                  icon="solar:home-smile-linear"
                >
                  <FormField
                    label="Accommodation Address"
                    required
                    error={fieldErrors.accommodationAddress}
                    helperText="The full address of your residence"
                  >
                    <EnhancedTextarea
                      placeholder="e.g. Calle de la Princesa 25, Madrid, Spain"
                      value={formData.accommodationAddress}
                      onChange={(e) =>
                        handleInputChange(
                          "accommodationAddress",
                          e.target.value,
                        )
                      }
                      className="min-h-[100px]"
                    />
                  </FormField>

                  <FormGrid columns={2}>
                    <FormField
                      label="Type of Accommodation"
                      required
                      error={fieldErrors.accommodationType}
                    >
                      <EnhancedSelect
                        value={formData.accommodationType}
                        onValueChange={(value) =>
                          handleInputChange("accommodationType", value)
                        }
                      >
                        <EnhancedSelectTrigger
                          error={fieldErrors.accommodationType}
                        >
                          <EnhancedSelectValue placeholder="Select type" />
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
                      label="Neighborhood"
                      helperText="e.g. Kreuzberg, Trastevere"
                    >
                      <EnhancedInput
                        placeholder="District name"
                        value={formData.neighborhood}
                        onChange={(e) =>
                          handleInputChange("neighborhood", e.target.value)
                        }
                      />
                    </FormField>
                  </FormGrid>
                </FormSection>

                {/* Financials */}
                <FormSection
                  variant="emerald"
                  title="Financial Details"
                  subtitle="Monthly costs and what's included"
                  icon="solar:wallet-money-linear"
                >
                  <FormGrid columns={2}>
                    <FormField
                      label="Monthly Rent (€)"
                      required
                      error={fieldErrors.monthlyRent}
                    >
                      <EnhancedInput
                        type="number"
                        placeholder="e.g. 500"
                        value={formData.monthlyRent}
                        onChange={(e) =>
                          handleInputChange("monthlyRent", e.target.value)
                        }
                        icon={
                          <Icon icon="solar:euro-linear" className="w-4 h-4" />
                        }
                      />
                    </FormField>

                    <FormField label="Bills Included?" required>
                      <EnhancedSelect
                        value={formData.billsIncluded}
                        onValueChange={(value) =>
                          handleInputChange("billsIncluded", value)
                        }
                      >
                        <EnhancedSelectTrigger>
                          <EnhancedSelectValue placeholder="Select option" />
                        </EnhancedSelectTrigger>
                        <EnhancedSelectContent>
                          <EnhancedSelectItem value="yes">
                            Yes, all included
                          </EnhancedSelectItem>
                          <EnhancedSelectItem value="no">
                            No, paid separately
                          </EnhancedSelectItem>
                        </EnhancedSelectContent>
                      </EnhancedSelect>
                    </FormField>
                  </FormGrid>

                  {formData.billsIncluded === "no" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <FormField label="Avg. Monthly Utility Cost (€)" required>
                        <EnhancedInput
                          type="number"
                          placeholder="e.g. 80"
                          value={formData.avgUtilityCost}
                          onChange={(e) =>
                            handleInputChange("avgUtilityCost", e.target.value)
                          }
                        />
                      </FormField>
                    </motion.div>
                  )}
                </FormSection>

                {/* Facilities */}
                <FormSection
                  variant="emerald"
                  title="Facilities & Amenities"
                  subtitle="What was available at your accommodation?"
                  icon="solar:washing-machine-linear"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <FormField label="Kitchen Access">
                        <RadioGroup
                          value={formData.kitchenAccess}
                          onValueChange={(v) =>
                            handleInputChange("kitchenAccess", v)
                          }
                          className="flex flex-col gap-2"
                        >
                          {["private", "shared", "none"].map((opt) => (
                            <div
                              key={opt}
                              className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                            >
                              <RadioGroupItem value={opt} id={`k-${opt}`} />
                              <Label
                                htmlFor={`k-${opt}`}
                                className="capitalize font-medium"
                              >
                                {opt}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormField>

                      <FormField label="Laundry Access">
                        <RadioGroup
                          value={formData.laundryAccess}
                          onValueChange={(v) =>
                            handleInputChange("laundryAccess", v)
                          }
                          className="flex flex-col gap-2"
                        >
                          {["in-room", "shared", "nearby"].map((opt) => (
                            <div
                              key={opt}
                              className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                            >
                              <RadioGroupItem value={opt} id={`l-${opt}`} />
                              <Label
                                htmlFor={`l-${opt}`}
                                className="capitalize font-medium"
                              >
                                {opt.replace("-", " ")}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormField>
                    </div>

                    <div className="space-y-6">
                      <FormField label="Internet & Parking">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                              <Icon
                                icon="solar:wi-fi-linear"
                                className="w-5 h-5 text-blue-500"
                              />
                              <span className="text-sm font-bold">
                                Internet Included
                              </span>
                            </div>
                            <Checkbox
                              checked={formData.internetIncluded === "yes"}
                              onCheckedChange={(c) =>
                                handleInputChange(
                                  "internetIncluded",
                                  c ? "yes" : "no",
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                              <Icon
                                icon="solar:parking-linear"
                                className="w-5 h-5 text-emerald-500"
                              />
                              <span className="text-sm font-bold">
                                Parking Available
                              </span>
                            </div>
                            <Checkbox
                              checked={formData.parkingAvailable === "yes"}
                              onCheckedChange={(c) =>
                                handleInputChange(
                                  "parkingAvailable",
                                  c ? "yes" : "no",
                                )
                              }
                            />
                          </div>
                        </div>
                      </FormField>

                      <FormField label="Nearby Amenities">
                        <div className="grid grid-cols-1 gap-2">
                          {amenities.slice(0, 6).map((amenity) => (
                            <div
                              key={amenity}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Checkbox
                                id={amenity}
                                checked={formData.nearbyAmenities.includes(
                                  amenity,
                                )}
                                onCheckedChange={(c) =>
                                  handleAmenityChange(amenity, c as boolean)
                                }
                              />
                              <Label
                                htmlFor={amenity}
                                className="text-xs font-medium cursor-pointer"
                              >
                                {amenity}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormField>
                    </div>
                  </div>
                </FormSection>

                {/* Evaluation */}
                <FormSection
                  variant="emerald"
                  title="Evaluation"
                  subtitle="Your overall rating and recommendation"
                  icon="solar:star-linear"
                >
                  <FormGrid columns={2}>
                    <FormField
                      label="Overall Rating"
                      required
                      error={fieldErrors.accommodationRating}
                    >
                      <EnhancedSelect
                        value={formData.accommodationRating}
                        onValueChange={(v) =>
                          handleInputChange("accommodationRating", v)
                        }
                      >
                        <EnhancedSelectTrigger
                          error={fieldErrors.accommodationRating}
                        >
                          <EnhancedSelectValue placeholder="Select rating" />
                        </EnhancedSelectTrigger>
                        <EnhancedSelectContent>
                          {[1, 2, 3, 4, 5].map((r) => (
                            <EnhancedSelectItem key={r} value={r.toString()}>
                              {r} -{" "}
                              {
                                [
                                  "Poor",
                                  "Fair",
                                  "Good",
                                  "Very Good",
                                  "Excellent",
                                ][r - 1]
                              }
                            </EnhancedSelectItem>
                          ))}
                        </EnhancedSelectContent>
                      </EnhancedSelect>
                    </FormField>

                    <FormField label="Easy to find?" required>
                      <RadioGroup
                        value={formData.easyToFind}
                        onValueChange={(v) =>
                          handleInputChange("easyToFind", v)
                        }
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="easy-y" />
                          <Label htmlFor="easy-y">Yes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="easy-n" />
                          <Label htmlFor="easy-n">No</Label>
                        </div>
                      </RadioGroup>
                    </FormField>
                  </FormGrid>

                  {formData.easyToFind === "no" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <FormField label="What were the challenges?">
                        <EnhancedTextarea
                          placeholder="Describe the difficulties in finding a place..."
                          value={formData.findingChallenges}
                          onChange={(e) =>
                            handleInputChange(
                              "findingChallenges",
                              e.target.value,
                            )
                          }
                        />
                      </FormField>
                    </motion.div>
                  )}

                  <FormField label="Would you recommend this place?" required>
                    <RadioGroup
                      value={formData.wouldRecommend}
                      onValueChange={(v) =>
                        handleInputChange("wouldRecommend", v)
                      }
                      className="flex flex-col gap-3 mt-2"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                          formData.wouldRecommend === "yes"
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                            : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800",
                        )}
                      >
                        <RadioGroupItem value="yes" id="rec-y" />
                        <Label
                          htmlFor="rec-y"
                          className="font-bold cursor-pointer"
                        >
                          Yes, I recommend it
                        </Label>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                          formData.wouldRecommend === "no"
                            ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                            : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800",
                        )}
                      >
                        <RadioGroupItem value="no" id="rec-n" />
                        <Label
                          htmlFor="rec-n"
                          className="font-bold cursor-pointer"
                        >
                          No, I wouldn't recommend it
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormField>

                  {formData.wouldRecommend === "no" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <FormField label="Why not?">
                        <EnhancedTextarea
                          placeholder="Explain the reasons for your negative recommendation..."
                          value={formData.recommendationReason}
                          onChange={(e) =>
                            handleInputChange(
                              "recommendationReason",
                              e.target.value,
                            )
                          }
                        />
                      </FormField>
                    </motion.div>
                  )}
                </FormSection>

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

                {/* Auto-save indicator */}
                <div className="fixed top-24 right-6 z-50">
                  {showSavedIndicator && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center bg-emerald-500/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-medium shadow-2xl border border-emerald-400/50"
                    >
                      <Icon
                        icon="solar:check-circle-linear"
                        className="w-4 h-4 mr-2"
                      />
                      Changes saved
                    </motion.div>
                  )}
                </div>
              </motion.form>
            </div>
          </div>
        </div>
      </SubmissionGuard>
    </StepGuard>
  );
}
