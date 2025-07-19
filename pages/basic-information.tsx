import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
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
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Badge } from "../src/components/ui/badge";
import { Textarea } from "../src/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getAgreementsByDepartment,
  getAgreementsByDepartmentAndLevel,
  getAgreementsByUniversityAndLevel,
  getPartnerCountries,
} from "../src/data/universityAgreements";
import { UNIC_COMPREHENSIVE_AGREEMENTS } from "../src/data/unic_agreements_temp";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";
import { basicInformationRequiredSchema } from "../src/lib/schemas";
import { handleApiError } from "../src/utils/apiErrorHandler";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function BasicInformation() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const {
    submitForm,
    getDraftData,
    saveDraft,
    sessionStatus: formSessionStatus,
  } = useFormSubmissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Auth guard - redirect unauthenticated users
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    router.replace("/auth/signin?callbackUrl=/basic-information");
    return null;
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    nationality: "",
    phoneNumber: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Academic Information
    universityInCyprus: "",
    departmentInCyprus: "",
    levelOfStudy: "",
    currentYear: "",
    gpa: "",
    studentId: "",
    academicAdvisor: "",

    // Exchange Information
    exchangePeriod: "",
    exchangeStartDate: "",
    exchangeEndDate: "",
    hostUniversity: "",
    hostCountry: "",
    hostCity: "",
    hostDepartment: "",
    hostCoordinator: "",

    // Language Requirements
    languageOfInstruction: "",
    languageProficiencyLevel: "",
    languageCertificates: "",

    // Motivation and Goals
    motivationForExchange: "",
    academicGoals: "",
    personalGoals: "",
    careerGoals: "",

    // Additional Information
    previousExchangeExperience: "",
    extracurricularActivities: "",
    specialNeeds: "",
    dietaryRestrictions: "",
    medicalConditions: "",
    additionalNotes: "",

    // Preferences
    accommodationPreference: "",
    buddyProgramInterest: "",
    orientationProgramInterest: "",
  });

  // Authentication temporarily disabled - all users can access

  // Load draft data on component mount - run only once
  useEffect(() => {
    const draftData = getDraftData("basic-info");
    if (draftData) {
      setFormData(draftData);
    }
  }, []); // No dependencies to prevent infinite loop

  const cyprusUniversities = CYPRUS_UNIVERSITIES;
  const [availableHostUniversities, setAvailableHostUniversities] = useState<
    Array<{ university: string; city: string; country: string }>
  >([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // Get departments for selected Cyprus university
  const availableDepartments =
    formData.universityInCyprus === "UNIC"
      ? // For UNIC, get unique departments from actual agreement data filtered by level
        formData.levelOfStudy
        ? [
            ...new Set(
              UNIC_COMPREHENSIVE_AGREEMENTS.filter(
                (agreement) =>
                  agreement.academicLevel === formData.levelOfStudy,
              ).map((agreement) => agreement.homeDepartment.trim()),
            ),
          ]
        : []
      : formData.universityInCyprus
        ? // For other universities, use the predefined departments
          cyprusUniversities.find((u) => u.code === formData.universityInCyprus)
            ?.departments || []
        : [];

  // Update available host universities when Cyprus university, department, or level changes
  useEffect(() => {
    if (
      formData.universityInCyprus &&
      formData.departmentInCyprus &&
      formData.levelOfStudy
    ) {
      let agreements: any[] = [];

      if (formData.universityInCyprus === "UNIC" && formData.levelOfStudy) {
        // For UNIC, use level-specific agreements
        agreements = getAgreementsByDepartmentAndLevel(
          formData.universityInCyprus,
          formData.departmentInCyprus,
          formData.levelOfStudy as "bachelor" | "master" | "phd",
        );
      } else {
        // For other universities, use general department agreements
        agreements = getAgreementsByDepartment(
          formData.universityInCyprus,
          formData.departmentInCyprus,
        );
      }

      const uniqueHostUniversities = agreements.map((agreement) => ({
        university: agreement.partnerUniversity,
        city: agreement.partnerCity,
        country: agreement.partnerCountry,
      }));

      const uniqueCities = [
        ...new Set(agreements.map((agreement) => agreement.partnerCity)),
      ].sort();

      setAvailableHostUniversities(uniqueHostUniversities);
      setAvailableCities(uniqueCities);
    } else {
      setAvailableHostUniversities([]);
      setAvailableCities([]);
    }
  }, [
    formData.universityInCyprus,
    formData.departmentInCyprus,
    formData.levelOfStudy,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset dependent fields when changing university or department
      if (field === "universityInCyprus") {
        newData.departmentInCyprus = "";
        newData.hostUniversity = "";
        newData.hostCountry = "";
        newData.hostCity = "";
      }
      if (field === "departmentInCyprus" || field === "levelOfStudy") {
        newData.hostUniversity = "";
        newData.hostCountry = "";
        newData.hostCity = "";
      }

      // Auto-fill city when country is selected
      if (field === "hostCountry") {
        const citiesInCountry = availableHostUniversities
          .filter((uni) => uni.country === value)
          .map((uni) => uni.city);
        if (citiesInCountry.length === 1) {
          newData.hostCity = citiesInCountry[0];
        } else {
          newData.hostCity = "";
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setValidationErrors({});

    // Check if session is still loading
    if (sessionStatus === "loading" || formSessionStatus === "loading") {
      setErrorMessage("Please wait while we verify your authentication...");
      return;
    }

    // Validate required fields using simplified schema
    try {
      basicInformationRequiredSchema.parse(formData);
    } catch (validationError: any) {
      const errors: Record<string, string> = {};
      validationError.errors?.forEach((err: any) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      setValidationErrors(errors);
      setErrorMessage("Please fix the validation errors below.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitForm(
        "basic-info",
        "Basic Information Form",
        formData,
        "submitted",
      );
      router.push("/course-matching");
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorInfo = handleApiError(error);
      setErrorMessage(errorInfo.message);

      if (errorInfo.action === "signin") {
        // Redirect to sign-in if authentication failed
        setTimeout(() => {
          router.push(
            "/auth/signin?callbackUrl=" + encodeURIComponent(router.asPath),
          );
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft("basic-info", "Basic Information Draft", formData);
      // Show success message
      setErrorMessage("");
      setSuccessMessage("Draft saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Draft save error:", error);
      const errorInfo = handleApiError(error);
      setErrorMessage(`Failed to save draft: ${errorInfo.message}`);

      // Handle authentication error
      if (errorInfo.action === "signin") {
        setTimeout(() => {
          router.push(
            "/auth/signin?callbackUrl=" + encodeURIComponent(router.asPath),
          );
        }, 2000);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Basic Information - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Complete your personal and academic information for your Erasmus application"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb />

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Basic Information
              </h1>
              <p className="text-gray-600">
                Complete your personal and academic information for your Erasmus
                application. All fields marked with * are required.
              </p>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {successMessage && (
              <Alert variant="default" className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        required
                        className={
                          validationErrors.firstName ? "border-red-500" : ""
                        }
                      />
                      {validationErrors.firstName && (
                        <p className="text-sm text-red-500">
                          {validationErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        required
                        className={
                          validationErrors.lastName ? "border-red-500" : ""
                        }
                      />
                      {validationErrors.lastName && (
                        <p className="text-sm text-red-500">
                          {validationErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                        className={
                          validationErrors.email ? "border-red-500" : ""
                        }
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-red-500">
                          {validationErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) =>
                          handleInputChange("nationality", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="universityInCyprus">
                        Cyprus University *
                      </Label>
                      <Select
                        value={formData.universityInCyprus}
                        onValueChange={(value) =>
                          handleInputChange("universityInCyprus", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your university" />
                        </SelectTrigger>
                        <SelectContent>
                          {cyprusUniversities.map((uni) => (
                            <SelectItem key={uni.code} value={uni.code}>
                              {uni.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="levelOfStudy">Level of Study *</Label>
                      <Select
                        value={formData.levelOfStudy}
                        onValueChange={(value) =>
                          handleInputChange("levelOfStudy", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bachelor">Bachelor</SelectItem>
                          <SelectItem value="master">Master</SelectItem>
                          <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departmentInCyprus">Department *</Label>
                    <Select
                      value={formData.departmentInCyprus}
                      onValueChange={(value) =>
                        handleInputChange("departmentInCyprus", value)
                      }
                      disabled={!formData.universityInCyprus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDepartments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.departmentInCyprus &&
                    availableHostUniversities.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                        <p className="text-green-800 text-sm">
                          <span className="font-semibold">
                            {availableHostUniversities.length} partner
                            universities
                          </span>{" "}
                          available for {formData.departmentInCyprus} at{" "}
                          {
                            cyprusUniversities.find(
                              (u) => u.code === formData.universityInCyprus,
                            )?.name
                          }
                          {formData.levelOfStudy &&
                            ` (${formData.levelOfStudy} level)`}
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Exchange Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Exchange Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exchangePeriod">Exchange Period *</Label>
                      <Select
                        value={formData.exchangePeriod}
                        onValueChange={(value) =>
                          handleInputChange("exchangePeriod", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semester1">
                            Fall Semester
                          </SelectItem>
                          <SelectItem value="semester2">
                            Spring Semester
                          </SelectItem>
                          <SelectItem value="full_year">
                            Full Academic Year
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostCountry">
                        Preferred Host Country *
                      </Label>
                      <Select
                        value={formData.hostCountry}
                        onValueChange={(value) =>
                          handleInputChange("hostCountry", value)
                        }
                        disabled={availableHostUniversities.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            ...new Set(
                              availableHostUniversities.map((u) => u.country),
                            ),
                          ]
                            .sort()
                            .map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hostCity">Preferred Host City</Label>
                      <Select
                        value={formData.hostCity}
                        onValueChange={(value) =>
                          handleInputChange("hostCity", value)
                        }
                        disabled={!formData.hostCountry}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHostUniversities
                            .filter(
                              (uni) => uni.country === formData.hostCountry,
                            )
                            .map((uni) => uni.city)
                            .filter(
                              (city, index, arr) => arr.indexOf(city) === index,
                            )
                            .sort()
                            .map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostUniversity">
                        Preferred Host University
                      </Label>
                      <Select
                        value={formData.hostUniversity}
                        onValueChange={(value) =>
                          handleInputChange("hostUniversity", value)
                        }
                        disabled={!formData.hostCountry}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select university" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHostUniversities
                            .filter(
                              (uni) =>
                                uni.country === formData.hostCountry &&
                                (!formData.hostCity ||
                                  uni.city === formData.hostCity),
                            )
                            .map((uni, index) => (
                              <SelectItem key={index} value={uni.university}>
                                {uni.university} - {uni.city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <Link href="/">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || sessionStatus === "loading"}
                  >
                    {sessionStatus === "loading"
                      ? "Loading..."
                      : isSubmitting
                        ? "Submitting..."
                        : "Continue to Course Matching"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
