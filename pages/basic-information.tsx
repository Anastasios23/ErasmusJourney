import { useState, useEffect, useRef, useCallback } from "react";
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
import { ZodError } from "zod";
import { handleApiError } from "../src/utils/apiErrorHandler";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function BasicInformation() {
  // 1. ALL HOOKS FIRST - NEVER CONDITIONAL
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const {
    submitForm,
    getDraftData,
    saveDraft,
    loading: submissionsLoading,
    error: submissionsError,
  } = useFormSubmissions();

  const draftLoaded = useRef(false);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isNavigating = useRef(false);
  const isLoadingDraft = useRef(false);

  // All useState hooks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftSuccess, setDraftSuccess] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

  const [availableHostUniversities, setAvailableHostUniversities] = useState<
    Array<{ university: string; city: string; country: string }>
  >([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  // 2. ALL useEffect HOOKS NEXT
  // Authentication redirect in useEffect
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(
        `/login?callbackUrl=${encodeURIComponent(router.asPath)}`,
      );
    }
  }, [sessionStatus, router]);

  // Load draft data for both authenticated and unauthenticated users
  useEffect(() => {
    if (
      sessionStatus !== "loading" &&
      !submissionsLoading &&
      !draftLoaded.current
    ) {
      const draft = getDraftData("basic-info");
      if (draft) {
        console.log("DRAFT DATA FOUND. APPLYING TO FORM:", draft); // DEBUG
        console.log("SETTING FORM DATA..."); // DEBUG

        isLoadingDraft.current = true; // Set flag to prevent field clearing

        setFormData(prevData => {
          console.log("PREVIOUS FORM DATA:", prevData); // DEBUG
          console.log("NEW FORM DATA:", draft); // DEBUG
          return { ...prevData, ...draft };
        });

        // Clear the flag after a short delay to allow the state update to complete
        setTimeout(() => {
          isLoadingDraft.current = false;
        }, 100);
      }
      draftLoaded.current = true; // Mark draft as loaded
    }
  }, [sessionStatus, submissionsLoading, getDraftData]);

  // Debug session state
  useEffect(() => {
    console.log("SESSION STATUS:", sessionStatus);
  }, [sessionStatus]);

  // Debug form data changes
  useEffect(() => {
    console.log("FORM DATA CHANGED:", formData);
  }, [formData]);

  // Auto-save function with debouncing
  const autoSaveForm = useCallback(async (formData: any, silent: boolean = true) => {
    // Don't auto-save if form is empty or we're navigating away
    if (!formData.firstName && !formData.lastName && !formData.email) {
      return;
    }

    if (isNavigating.current) {
      return;
    }

    try {
      setIsAutoSaving(true);

      if (sessionStatus === "authenticated" && session) {
        // Save to server for authenticated users
        await saveDraft("basic-info", "Basic Information Draft", formData);
      } else {
        // Save to localStorage for unauthenticated users
        const draftKey = `erasmus_draft_basic-info`;
        const draftData = {
          type: "basic-info",
          title: "Basic Information Draft",
          data: formData,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
      }

      setLastSaved(new Date());

      if (!silent) {
        setDraftSuccess("Draft saved successfully!");
        setTimeout(() => setDraftSuccess(null), 3000);
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      if (!silent) {
        setDraftError("Failed to auto-save. Please save manually.");
        setTimeout(() => setDraftError(null), 5000);
      }
    } finally {
      setIsAutoSaving(false);
    }
  }, [sessionStatus, session, saveDraft]);

  // Auto-save when form data changes (debounced)
  useEffect(() => {
    if (draftLoaded.current && !isSubmitting) {
      // Clear existing timeout
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }

      // Set new timeout for auto-save (3 seconds after user stops typing)
      autoSaveTimeout.current = setTimeout(() => {
        autoSaveForm(formData, true);
      }, 3000);
    }

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [formData, autoSaveForm, isSubmitting]);

  // Save before navigation/page unload
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Only save if there's meaningful data
      if (formData.firstName || formData.lastName || formData.email) {
        isNavigating.current = true;

        // For page unload, we need to use synchronous localStorage
        const draftKey = `erasmus_draft_basic-info`;
        const draftData = {
          type: "basic-info",
          title: "Basic Information Draft",
          data: formData,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));

        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleRouteChangeStart = async (url: string) => {
      // Don't auto-save when navigating to course-matching (form submission handles this)
      if (url.includes('course-matching')) {
        return;
      }

      if ((formData.firstName || formData.lastName || formData.email) && !isSubmitting) {
        isNavigating.current = true;
        try {
          await autoSaveForm(formData, false);
        } catch (error) {
          console.error("Error saving before navigation:", error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    router.events.on('routeChangeStart', handleRouteChangeStart);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [formData, autoSaveForm, isSubmitting, router.events]);

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

  // 4. COMPUTED VALUES AND CONSTANTS AFTER CONDITIONAL RENDERS
  const cyprusUniversities = CYPRUS_UNIVERSITIES;

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

    // Clear all error and success states at start
    setFieldErrors({});
    setSubmitError(null);
    setDraftError(null);
    setSubmitSuccess(null);
    setDraftSuccess(null);

    // Validate required fields using simplified schema
    try {
      basicInformationRequiredSchema.parse(formData);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrorsData = err.flatten().fieldErrors;
        const errors: Record<string, string> = {};
        for (const key in fieldErrorsData) {
          if (fieldErrorsData[key]?.[0]) {
            errors[key] = fieldErrorsData[key]![0];
          }
        }
        setFieldErrors(errors);
        setSubmitError("Please fix the validation errors below.");
        return;
      }
      throw err; // re-throw if it wasn't a ZodError
    }

    setIsSubmitting(true);
    isNavigating.current = true;

    try {
      // First save the current form data as a draft for backup
      try {
        await autoSaveForm(formData, true);
      } catch (draftSaveError) {
        console.warn("Could not save draft before submission:", draftSaveError);
        // Continue with submission even if draft save fails
      }

      await submitForm(
        "basic-info",
        "Basic Information Form",
        formData,
        "submitted",
      );

      // Clean up any old localStorage draft after successful submission
      localStorage.removeItem("erasmus_draft_basic-info");

      // Show success message before redirect
      setSubmitSuccess(
        "Basic information submitted successfully! Redirecting to course matching...",
      );
      setTimeout(() => {
        router.push("/course-matching");
      }, 1500);
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorInfo = handleApiError(error);
      setSubmitError(errorInfo.message);
      isNavigating.current = false; // Reset navigation flag on error

      if (errorInfo.action === "signin") {
        // Redirect to sign-in if authentication failed
        setTimeout(() => {
          router.push(
            "/login?callbackUrl=" + encodeURIComponent(router.asPath),
          );
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Clear previous errors
      setDraftError(null);
      setDraftSuccess(null);

      await autoSaveForm(formData, false);
    } catch (error: any) {
      console.error("Draft save error:", error);
      const errorInfo = handleApiError(error);
      setDraftError(`Failed to save draft: ${errorInfo.message}`);

      // Handle authentication error
      if (errorInfo.action === "signin") {
        setTimeout(() => {
          router.push(
            "/login?callbackUrl=" + encodeURIComponent(router.asPath),
          );
        }, 2000);
      }
    }
  };

  // Determine what to render based on session and loading status
  let content;

  if (sessionStatus === "loading" || submissionsLoading) {
    content = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>
            {sessionStatus === "loading"
              ? "Checking authentication..."
              : "Loading draft data..."}
          </p>
        </div>
      </div>
    );
  } else if (sessionStatus !== "authenticated") {
    // This case should ideally trigger a redirect via useEffect, but provides a fallback UI
    content = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You must be logged in to view this page. Redirecting...
          </p>
          <div className="animate-pulse text-blue-600">...</div>
        </div>
      </div>
    );
  } else {
    // Render the form only when authenticated and data is loaded
    content = (
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
                  className={fieldErrors.firstName ? "border-red-500" : ""}
                />
                {fieldErrors.firstName && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.firstName}
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
                  className={fieldErrors.lastName ? "border-red-500" : ""}
                />
                {fieldErrors.lastName && (
                  <p className="text-sm text-red-500">{fieldErrors.lastName}</p>
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
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className={fieldErrors.email ? "border-red-500" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  required
                  className={fieldErrors.dateOfBirth ? "border-red-500" : ""}
                />
                {fieldErrors.dateOfBirth && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.dateOfBirth}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) =>
                    handleInputChange("nationality", e.target.value)
                  }
                  required
                  className={fieldErrors.nationality ? "border-red-500" : ""}
                />
                {fieldErrors.nationality && (
                  <p className="text-sm text-red-500">
                    {fieldErrors.nationality}
                  </p>
                )}
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
                <Label htmlFor="universityInCyprus">Cyprus University *</Label>
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
                      {availableHostUniversities.length} partner universities
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
                    <SelectItem value="semester1">Fall Semester</SelectItem>
                    <SelectItem value="semester2">Spring Semester</SelectItem>
                    <SelectItem value="full_year">
                      Full Academic Year
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostCountry">Preferred Host Country *</Label>
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
                <Label htmlFor="hostCity">Preferred Host City *</Label>
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
                      .filter((uni) => uni.country === formData.hostCountry)
                      .map((uni) => uni.city)
                      .filter((city, index, arr) => arr.indexOf(city) === index)
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
                  Preferred Host University *
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
        {/* Auto-save status indicator */}
        <div className="flex justify-center mb-4">
          {isAutoSaving && (
            <div className="flex items-center text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Saving draft...
            </div>
          )}
          {lastSaved && !isAutoSaving && (
            <div className="text-sm text-green-600">
              Draft saved at {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

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
              disabled={submissionsLoading || isSubmitting || isAutoSaving}
            >
              {submissionsLoading ? "Loading..." : isAutoSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button type="submit" disabled={submissionsLoading || isSubmitting || isAutoSaving}>
              {submissionsLoading
                ? "Loading draft..."
                : isSubmitting
                  ? "Submitting..."
                  : "Continue to Course Matching"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </form>
    );
  }

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

            {/* Error/Success Alerts - Render outside of content conditional to always show */}
            {submissionsError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submissionsError}</AlertDescription>
              </Alert>
            )}
            {submitError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            {draftError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{draftError}</AlertDescription>
              </Alert>
            )}
            {draftSuccess && (
              <Alert
                variant="default"
                className="border-green-200 bg-green-50 mb-4"
              >
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {draftSuccess}
                </AlertDescription>
              </Alert>
            )}
            {submitSuccess && (
              <Alert
                variant="default"
                className="border-green-200 bg-green-50 mb-4"
              >
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {submitSuccess}
                </AlertDescription>
              </Alert>
            )}

            {content}
          </div>
        </div>
      </div>
    </>
  );
}
