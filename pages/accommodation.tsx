import { useState, useEffect } from "react";
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

export default function Accommodation() {
  const { data: session } = useSession();
  const router = useRouter();

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
        setBasicInfoData(experienceData.basicInfo);
      }

      // Load accommodation data if available
      if (experienceData.accommodation) {
        console.log(
          "Loading accommodation data:",
          experienceData.accommodation,
        );
        setFormData(experienceData.accommodation);
      }
    }
  }, [experienceLoading, experienceData]); // Remove dependencies to prevent re-runs

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
          city: basicInfoData.hostCity,
          country: basicInfoData.hostCountry,
        }));
      }
    }
  }, [basicInfoData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get basic info for city/country enrichment
      const basicInfo = experienceData?.basicInfo;

      const enrichedFormData = {
        ...formData,
        city: basicInfo?.hostCity || "",
        country: basicInfo?.hostCountry || "",
        university: basicInfo?.hostUniversity || "",
      };

      // Save progress with accommodation data
      await saveProgress({
        accommodation: enrichedFormData,
      });

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

  // Auto-save function
  const handleSaveDraft = async () => {
    try {
      await saveProgress({
        accommodation: formData,
      });
      toast("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast("Failed to save draft. Please try again.");
    }
  };

  return (
    <>
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
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  Step 3 of 5
                </Badge>
                <h1 className="text-2xl font-bold text-gray-900">
                  Accommodation Details
                </h1>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
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
            <div className="flex justify-between items-center pt-8">
              <Link href="/course-matching">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Course Matching
                </Button>
              </Link>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || experienceLoading}
                  className="flex items-center gap-2"
                >
                  {experienceLoading ? "Saving..." : "Save Draft"}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || experienceLoading}
                  className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2">⏳</div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue to Living Expenses
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
