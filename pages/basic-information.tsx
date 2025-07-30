import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import LoginPrompt from "../src/components/LoginPrompt";
import EnhancedOfflineIndicator from "../src/components/EnhancedOfflineIndicator";
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
import { StepIndicator } from "../src/components/StepIndicator";
import { useFormProgress } from "../src/context/FormProgressContext";

export default function BasicInformation() {
  const { markStepCompleted } = useFormProgress();
  // 1. ALL HOOKS FIRST - NEVER CONDITIONAL
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const {
    submitForm,
    getDraftData,
    saveDraft,
    setBasicInfoId,
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
  const [draftApplied, setDraftApplied] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

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
      router.replace(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [sessionStatus, router]);

  // Load saved data when component mounts
  useEffect(() => {
    if (
      sessionStatus !== "loading" &&
      !submissionsLoading &&
      !draftLoaded.current
    ) {
      // Load from navigation data first (user came back from next page)
      const savedFormData = localStorage.getItem("erasmus_form_basic-info");
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          console.log("Loading saved basic-info data:", parsedData);

          isLoadingDraft.current = true;
          setFormData((prevData) => ({ ...prevData, ...parsedData }));
          setDraftApplied(true);

          setTimeout(() => {
            isLoadingDraft.current = false;
          }, 100);
        } catch (error) {
          console.error("Error loading saved basic-info data:", error);
        }
      } else {
        // Fallback to draft data
        const draft = getDraftData("basic-info");
        if (draft) {
          console.log("DRAFT DATA FOUND. APPLYING TO FORM:", draft);

          isLoadingDraft.current = true;
          setFormData((prevData) => ({ ...prevData, ...draft }));
          setDraftApplied(true);

          setTimeout(() => {
            isLoadingDraft.current = false;
          }, 100);
        }
      }
      draftLoaded.current = true;
    }
  }, [sessionStatus, submissionsLoading, getDraftData]);

  // Debug session state
  useEffect(() => {
    console.log("SESSION STATUS:", sessionStatus);
  }, [sessionStatus]);

  // Debug form data changes
  useEffect(() => {
    console.log("FORM DATA CHANGED:", formData);
    console.log("Key fields:");
    console.log("- firstName:", formData.firstName);
    console.log("- lastName:", formData.lastName);
    console.log("- email:", formData.email);
    console.log("- universityInCyprus:", formData.universityInCyprus);
    console.log("- departmentInCyprus:", formData.departmentInCyprus);
    console.log("- levelOfStudy:", formData.levelOfStudy);
  }, [formData]);

  // Silent save function that doesn't refresh submissions (for autosave)
  const silentSaveDraft = useCallback(
    async (formData: any) => {
      if (sessionStatus === "authenticated" && session) {
        // Save to server without refreshing submissions
        const response = await fetch("/api/forms/saveDraft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "basic-info", // Changed from "basic-information"
            title: "Basic Information Draft",
            data: formData,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save draft: ${response.status}`);
        }
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
    },
    [sessionStatus, session],
  );

  // Auto-save function with debouncing
  const autoSaveForm = useCallback(
    async (formData: any, silent: boolean = true) => {
      // Don't auto-save if form is empty or we're navigating away
      if (!formData.firstName && !formData.lastName && !formData.email) {
        return;
      }

      if (isNavigating.current) {
        return;
      }

      try {
        setIsAutoSaving(true);

        if (silent) {
          // Use silent save for autosave to avoid page refresh
          await silentSaveDraft(formData);
        } else {
          // Use regular save for manual save (shows in submissions list)
          await saveDraft("basic-info", "Basic Information Draft", formData);
        }

        setLastSaved(new Date());

        if (silent) {
          // Show subtle floating indicator for auto-save
          setShowSavedIndicator(true);
          setTimeout(() => setShowSavedIndicator(false), 2000); // Shorter duration
        } else {
          // Show the alert for manual save
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
    },
    [sessionStatus, session, saveDraft, silentSaveDraft],
  );

  // Auto-save when form data changes (debounced) - less aggressive
  useEffect(() => {
    if (draftLoaded.current && !isSubmitting && !isNavigating.current) {
      // Only auto-save if we have substantial data (more than just basic fields)
      const hasSubstantialData =
        (formData.firstName?.trim() &&
          formData.lastName?.trim() &&
          formData.email?.trim()) ||
        (formData.universityInCyprus &&
          formData.departmentInCyprus &&
          formData.levelOfStudy);

      if (hasSubstantialData) {
        // Clear existing timeout
        if (autoSaveTimeout.current) {
          clearTimeout(autoSaveTimeout.current);
        }

        // Set new timeout for auto-save (15 seconds after user stops typing)
        autoSaveTimeout.current = setTimeout(() => {
          autoSaveForm(formData, true);
        }, 15000); // Much longer delay - 15 seconds
      }
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
      if (url.includes("course-matching")) {
        return;
      }

      if (
        (formData.firstName || formData.lastName || formData.email) &&
        !isSubmitting
      ) {
        isNavigating.current = true;
        try {
          await autoSaveForm(formData, false);
        } catch (error) {
          console.error("Error saving before navigation:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChangeStart);
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

  // Debug available departments
  useEffect(() => {
    if (formData.universityInCyprus) {
      console.log(
        "AVAILABLE DEPARTMENTS for",
        formData.universityInCyprus,
        ":",
        availableDepartments,
      );
      console.log("LOADED DEPARTMENT:", formData.departmentInCyprus);
      console.log(
        "DEPARTMENT IS AVAILABLE:",
        availableDepartments.includes(formData.departmentInCyprus),
      );
    }
  }, [
    formData.universityInCyprus,
    formData.departmentInCyprus,
    availableDepartments,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Reset dependent fields when changing university or department, but not during draft loading
      if (!isLoadingDraft.current) {
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
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitError(null);

    try {
      // Validate form data
      basicInformationRequiredSchema.parse(formData);

      // Always save data to localStorage for navigation back
      localStorage.setItem("erasmus_form_basic-info", JSON.stringify(formData));

      // Submit the form
      const response = await submitForm(
        "basic-info",
        "Basic Information Form",
        formData,
        "submitted",
      );

      if (response?.submissionId) {
        // Update states synchronously
        setBasicInfoId(response.submissionId);
        markStepCompleted("basic-info");

        // Remove draft but keep navigation data
        localStorage.removeItem("erasmus_draft_basic-info");

        // Navigate immediately
        router.push("/course-matching");
      } else {
        throw new Error("No submission ID received");
      }
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.flatten().fieldErrors;
        Object.entries(error.flatten().fieldErrors).forEach(([key, value]) => {
          if (value?.[0]) errors[key] = value[0];
        });
        setFieldErrors(errors);
        setSubmitError("Please fix the validation errors below.");
      } else {
        console.error("Submission error:", error);
        const errorInfo = handleApiError(error);
        setSubmitError(errorInfo.message);

        if (errorInfo.action === "signin") {
          router.push(
            "/login?callbackUrl=" + encodeURIComponent(router.asPath),
          );
        }
      }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Basic Information", href: "/basic-information" },
              ]}
            />

            <div className="mt-8">
              <LoginPrompt
                title="Start Your Erasmus Application"
                description="Ready to begin your application? Sign in to save your progress and access all features."
              />
            </div>
          </div>
        </main>
      </div>
    );
  } else {
    // Render the form only when authenticated and data is loaded
    content = (
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
        key={draftApplied ? "draft-loaded" : "initial"}
      >
        {/* Personal Information */}
        <FormSection
          title="Personal Information"
          subtitle="Your basic personal details for the exchange program"
        >
          <FormGrid columns={2}>
            <FormField
              label="First Name"
              required
              error={fieldErrors.firstName}
            >
              <EnhancedInput
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                required
                error={fieldErrors.firstName}
              />
            </FormField>

            <FormField label="Last Name" required error={fieldErrors.lastName}>
              <EnhancedInput
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                required
                error={fieldErrors.lastName}
              />
            </FormField>

            <FormField label="Email Address" required error={fieldErrors.email}>
              <EnhancedInput
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@example.com"
                required
                error={fieldErrors.email}
              />
            </FormField>

            <FormField
              label="Date of Birth"
              required
              error={fieldErrors.dateOfBirth}
            >
              <EnhancedInput
                type="date"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                required
                error={fieldErrors.dateOfBirth}
              />
            </FormField>

            <FormField
              label="Nationality"
              required
              error={fieldErrors.nationality}
            >
              <EnhancedInput
                id="nationality"
                value={formData.nationality}
                onChange={(e) =>
                  handleInputChange("nationality", e.target.value)
                }
                placeholder="e.g., Cypriot, Greek, German"
                required
                error={fieldErrors.nationality}
              />
            </FormField>
          </FormGrid>
        </FormSection>

        {/* Academic Information */}
        <FormSection
          title="Academic Information"
          subtitle="Your current academic status and university details"
        >
          <FormGrid columns={2}>
            <FormField
              label="Cyprus University"
              required
              error={fieldErrors.universityInCyprus}
            >
              <EnhancedSelect
                value={formData.universityInCyprus || ""}
                onValueChange={(value) =>
                  handleInputChange("universityInCyprus", value)
                }
              >
                <EnhancedSelectTrigger error={fieldErrors.universityInCyprus}>
                  <EnhancedSelectValue placeholder="Select your university" />
                </EnhancedSelectTrigger>
                <EnhancedSelectContent>
                  {cyprusUniversities.map((uni) => (
                    <EnhancedSelectItem key={uni.code} value={uni.code}>
                      {uni.name}
                    </EnhancedSelectItem>
                  ))}
                </EnhancedSelectContent>
              </EnhancedSelect>
            </FormField>

            <FormField
              label="Level of Study"
              required
              error={fieldErrors.levelOfStudy}
            >
              <EnhancedSelect
                value={formData.levelOfStudy || ""}
                onValueChange={(value) =>
                  handleInputChange("levelOfStudy", value)
                }
              >
                <EnhancedSelectTrigger error={fieldErrors.levelOfStudy}>
                  <EnhancedSelectValue placeholder="Select level" />
                </EnhancedSelectTrigger>
                <EnhancedSelectContent>
                  <EnhancedSelectItem value="bachelor">
                    Bachelor
                  </EnhancedSelectItem>
                  <EnhancedSelectItem value="master">Master</EnhancedSelectItem>
                  <EnhancedSelectItem value="phd">PhD</EnhancedSelectItem>
                </EnhancedSelectContent>
              </EnhancedSelect>
            </FormField>
          </FormGrid>

          <FormField
            label="Department"
            required
            error={fieldErrors.departmentInCyprus}
          >
            <EnhancedSelect
              value={formData.departmentInCyprus || ""}
              onValueChange={(value) =>
                handleInputChange("departmentInCyprus", value)
              }
              disabled={!formData.universityInCyprus}
            >
              <EnhancedSelectTrigger
                disabledMessage={
                  !formData.universityInCyprus
                    ? "Please select a university first"
                    : undefined
                }
                error={fieldErrors.departmentInCyprus}
              >
                <EnhancedSelectValue
                  placeholder="Select your department"
                  disabledMessage={
                    !formData.universityInCyprus
                      ? "Please select a university first"
                      : undefined
                  }
                  disabled={!formData.universityInCyprus}
                />
              </EnhancedSelectTrigger>
              <EnhancedSelectContent>
                {availableDepartments.map((dept) => (
                  <EnhancedSelectItem key={dept} value={dept}>
                    {dept}
                  </EnhancedSelectItem>
                ))}
              </EnhancedSelectContent>
            </EnhancedSelect>
            {!formData.universityInCyprus && (
              <DisabledFieldHint message="Please select a university first" />
            )}
          </FormField>

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
                  {formData.levelOfStudy && ` (${formData.levelOfStudy} level)`}
                </p>
              </div>
            )}
        </FormSection>

        {/* Exchange Information */}
        <FormSection
          title="Exchange Information"
          subtitle="Your preferred exchange details and destination"
        >
          <FormGrid columns={2}>
            <FormField
              label="Exchange Period"
              required
              error={fieldErrors.exchangePeriod}
            >
              <EnhancedSelect
                value={formData.exchangePeriod || ""}
                onValueChange={(value) =>
                  handleInputChange("exchangePeriod", value)
                }
              >
                <EnhancedSelectTrigger error={fieldErrors.exchangePeriod}>
                  <EnhancedSelectValue placeholder="Select period" />
                </EnhancedSelectTrigger>
                <EnhancedSelectContent>
                  <EnhancedSelectItem value="semester1">
                    Fall Semester
                  </EnhancedSelectItem>
                  <EnhancedSelectItem value="semester2">
                    Spring Semester
                  </EnhancedSelectItem>
                  <EnhancedSelectItem value="full_year">
                    Full Academic Year
                  </EnhancedSelectItem>
                </EnhancedSelectContent>
              </EnhancedSelect>
            </FormField>

            <FormField
              label="Preferred Host Country"
              required
              error={fieldErrors.hostCountry}
            >
              <EnhancedSelect
                value={formData.hostCountry || ""}
                onValueChange={(value) =>
                  handleInputChange("hostCountry", value)
                }
                disabled={availableHostUniversities.length === 0}
              >
                <EnhancedSelectTrigger
                  disabledMessage={
                    availableHostUniversities.length === 0
                      ? "Please select university, level, and department first"
                      : undefined
                  }
                  error={fieldErrors.hostCountry}
                >
                  <EnhancedSelectValue
                    placeholder="Select country"
                    disabledMessage={
                      availableHostUniversities.length === 0
                        ? "Please select university, level, and department first"
                        : undefined
                    }
                    disabled={availableHostUniversities.length === 0}
                  />
                </EnhancedSelectTrigger>
                <EnhancedSelectContent>
                  {[...new Set(availableHostUniversities.map((u) => u.country))]
                    .sort()
                    .map((country) => (
                      <EnhancedSelectItem key={country} value={country}>
                        {country}
                      </EnhancedSelectItem>
                    ))}
                </EnhancedSelectContent>
              </EnhancedSelect>
              {availableHostUniversities.length === 0 && (
                <DisabledFieldHint message="Please select university, level, and department first" />
              )}
            </FormField>

            <FormField
              label="Preferred Host City"
              required
              error={fieldErrors.hostCity}
            >
              <EnhancedSelect
                value={formData.hostCity || ""}
                onValueChange={(value) => handleInputChange("hostCity", value)}
                disabled={!formData.hostCountry}
              >
                <EnhancedSelectTrigger
                  disabledMessage={
                    !formData.hostCountry
                      ? "Please select a country first"
                      : undefined
                  }
                  error={fieldErrors.hostCity}
                >
                  <EnhancedSelectValue
                    placeholder="Select city"
                    disabledMessage={
                      !formData.hostCountry
                        ? "Please select a country first"
                        : undefined
                    }
                    disabled={!formData.hostCountry}
                  />
                </EnhancedSelectTrigger>
                <EnhancedSelectContent>
                  {availableHostUniversities
                    .filter((uni) => uni.country === formData.hostCountry)
                    .map((uni) => uni.city)
                    .filter((city, index, arr) => arr.indexOf(city) === index)
                    .sort()
                    .map((city) => (
                      <EnhancedSelectItem key={city} value={city}>
                        {city}
                      </EnhancedSelectItem>
                    ))}
                </EnhancedSelectContent>
              </EnhancedSelect>
              {!formData.hostCountry && (
                <DisabledFieldHint message="Please select a country first" />
              )}
            </FormField>

            <FormField
              label="Preferred Host University"
              required
              error={fieldErrors.hostUniversity}
            >
              <EnhancedSelect
                value={formData.hostUniversity || ""}
                onValueChange={(value) =>
                  handleInputChange("hostUniversity", value)
                }
                disabled={!formData.hostCountry}
              >
                <EnhancedSelectTrigger
                  disabledMessage={
                    !formData.hostCountry
                      ? "Please select a country first"
                      : undefined
                  }
                  error={fieldErrors.hostUniversity}
                >
                  <EnhancedSelectValue
                    placeholder="Select university"
                    disabledMessage={
                      !formData.hostCountry
                        ? "Please select a country first"
                        : undefined
                    }
                    disabled={!formData.hostCountry}
                  />
                </EnhancedSelectTrigger>
                <EnhancedSelectContent>
                  {availableHostUniversities
                    .filter(
                      (uni) =>
                        uni.country === formData.hostCountry &&
                        (!formData.hostCity || uni.city === formData.hostCity),
                    )
                    .map((uni, index) => (
                      <EnhancedSelectItem key={index} value={uni.university}>
                        {uni.university} - {uni.city}
                      </EnhancedSelectItem>
                    ))}
                </EnhancedSelectContent>
              </EnhancedSelect>
              {!formData.hostCountry && (
                <DisabledFieldHint message="Please select a country first" />
              )}
            </FormField>
          </FormGrid>
        </FormSection>

        {/* Navigation */}
        {/* Subtle auto-save status indicator */}
        <div className="fixed top-20 right-4 z-40">
          {isAutoSaving && (
            <div className="flex items-center bg-gray-800 bg-opacity-90 text-white px-2 py-1 rounded text-xs shadow-lg">
              <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent mr-1.5"></div>
              Auto-saving...
            </div>
          )}
          {showSavedIndicator && lastSaved && !isAutoSaving && (
            <div className="bg-gray-800 bg-opacity-90 text-white px-2 py-1 rounded text-xs shadow-lg transition-all duration-300 ease-in-out">
              ✓ Auto-saved
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
              {submissionsLoading
                ? "Loading..."
                : isAutoSaving
                  ? "Saving..."
                  : "Save Draft"}
            </Button>
            <Button
              type="submit"
              disabled={submissionsLoading || isSubmitting || isAutoSaving}
            >
              {submissionsLoading
                ? "Loading draft..."
                : isSubmitting
                  ? "Saving & Submitting..."
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
        <StepIndicator
          currentStep={1}
          totalSteps={5}
          title="Basic Information"
        />

        <div className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb />

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Basic Information
              </h1>
              <p className="text-gray-600 mb-2">
                Complete your personal and academic information for your Erasmus
                application. All fields marked with * are required.
              </p>
              <p className="text-sm text-gray-500">
                💡 Your progress is automatically saved periodically and when
                you continue to the next step.
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
