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
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/ui/hero-section";
import { SubmissionGuard } from "../components/SubmissionGuard";
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getAgreementsByDepartment,
  getAgreementsByDepartmentAndLevel,
  getAgreementsByUniversityAndLevel,
  getPartnerCountries,
} from "../src/data/universityAgreements";
import { UNIC_COMPREHENSIVE_AGREEMENTS } from "../src/data/unic_agreements_temp";
import { useErasmusExperience } from "../src/hooks/useErasmusExperience";
import { basicInformationRequiredSchema } from "../src/lib/schemas";
import { ZodError } from "zod";
import { handleApiError } from "../src/utils/apiErrorHandler";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { StepIndicator } from "../src/components/StepIndicator";
import { useFormProgress } from "../src/context/FormProgressContext";
import { UniversitySearch } from "../src/components/UniversitySearch";
import { FormProgressBar } from "../components/forms/FormProgressBar";
import { StepNavigation } from "../components/forms/StepNavigation";

export default function BasicInformation() {
  // 1. ALL HOOKS FIRST - NEVER CONDITIONAL
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const {
    setCurrentStep,
    markStepCompleted,
    currentStepNumber,
    completedStepNumbers,
  } = useFormProgress();
  const {
    data: experienceData,
    loading: experienceLoading,
    error: experienceError,
    saveProgress,
  } = useErasmusExperience();

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
  useEffect(() => {
    setCurrentStep("basic-info");
  }, [setCurrentStep]);

  // Load saved data when component mounts
  useEffect(() => {
    if (
      sessionStatus !== "loading" &&
      !experienceLoading &&
      !draftLoaded.current &&
      experienceData
    ) {
      // Load from experience data (single source of truth)
      isLoadingDraft.current = true;

      // Ensure all values are strings, not undefined
      const safeBasicInfo = Object.entries(
        experienceData.basicInfo || {},
      ).reduce(
        (acc, [key, value]) => {
          acc[key] = value ?? "";
          return acc;
        },
        {} as Record<string, any>,
      );

      setFormData((prevData) => ({
        ...prevData,
        ...safeBasicInfo,
      }));
      setDraftApplied(true);

      setTimeout(() => {
        isLoadingDraft.current = false;
      }, 100);

      draftLoaded.current = true;
    }
  }, [sessionStatus, experienceLoading, experienceData]);

  // Save to localStorage helper function - defined early for use in useEffect
  const saveToLocalStorage = useCallback((data: any) => {
    const draftKey = `erasmus_form_basic-info`;
    const draftData = {
      type: "basic-info",
      title: "Basic Information Draft",
      data: data,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
  }, []);

  // Auto-save to localStorage only (not API) when form data changes
  useEffect(() => {
    if (draftLoaded.current && !isSubmitting && !isNavigating.current) {
      // Only auto-save if we have substantial data
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

        // Set new timeout for auto-save to localStorage (2 seconds after user stops typing)
        autoSaveTimeout.current = setTimeout(() => {
          saveToLocalStorage(formData);
          setLastSaved(new Date());
          setShowSavedIndicator(true);
          setTimeout(() => setShowSavedIndicator(false), 2000);
        }, 2000);
      }
    }

    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [formData, isSubmitting, saveToLocalStorage]);

  // Save before navigation/page unload
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Only save if there's meaningful data
      if (formData.firstName || formData.lastName || formData.email) {
        isNavigating.current = true;

        // For page unload, we need to use synchronous localStorage
        saveToLocalStorage(formData);

        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleRouteChangeStart = (url: string) => {
      // Don't save when navigating to course-matching (form submission handles this)
      if (url.includes("course-matching")) {
        return;
      }

      if (
        (formData.firstName || formData.lastName || formData.email) &&
        !isSubmitting
      ) {
        isNavigating.current = true;
        // Save to localStorage before navigating
        saveToLocalStorage(formData);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [formData, saveToLocalStorage, isSubmitting, router.events]);

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

  // Save draft to database (triggered by Save Draft button)
  const handleSaveDraftToDatabase = useCallback(async () => {
    try {
      // Map fields to match backend requirements
      const mappedData = {
        ...formData,
        homeUniversity: formData.universityInCyprus,
        semester: formData.exchangePeriod,
        year: formData.currentYear,
      };

      // Save progress to the experience with the current form data
      await saveProgress({
        basicInfo: mappedData,
      });

      setDraftSuccess("Draft saved successfully!");
      setTimeout(() => setDraftSuccess(null), 3000);
    } catch (error) {
      console.error("Draft save error:", error);
      const errorInfo = handleApiError(error);
      setDraftError(`Failed to save draft: ${errorInfo.message}`);
      setTimeout(() => setDraftError(null), 5000);
      throw error;
    }
  }, [formData, saveProgress]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitError(null);

    // Always save to localStorage first when navigating
    saveToLocalStorage(formData);

    try {
      // Validate form data
      basicInformationRequiredSchema.parse(formData);

      // Map fields to match backend requirements
      const mappedData = {
        ...formData,
        homeUniversity: formData.universityInCyprus,
        semester: formData.exchangePeriod,
        year: formData.currentYear,
      };

      // Save progress to the experience with the current form data
      const saved = await saveProgress({
        basicInfo: mappedData,
      });

      if (!saved) {
        throw new Error("Failed to save progress. Please try again.");
      }

      // Mark step 1 as completed
      markStepCompleted("basic-info");

      // Navigate to next step
      router.push("/course-matching");
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [sessionStatus, router]);

  // Determine what to render based on session and loading status
  let content;

  if (sessionStatus === "loading" || experienceLoading) {
    content = (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">
            {sessionStatus === "loading"
              ? "Checking authentication..."
              : "Loading draft data..."}
          </p>
        </div>
      </div>
    );
  } else if (sessionStatus !== "authenticated") {
    // Show login prompt while redirect happens
    content = (
      <div className="mt-8">
        <LoginPrompt
          title="Start Your Erasmus Application"
          description="Ready to begin your application? Sign in to save your progress and access all features."
        />
      </div>
    );
  } else {
    // Render the form only when authenticated and data is loaded
    content = (
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-8"
        key={draftApplied ? "draft-loaded" : "initial"}
      >
        {/* Personal Information */}
        <FormSection
          variant="blue"
          title="Personal Information"
          subtitle="Your basic contact and identification details"
          icon="solar:user-id-linear"
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
          </FormGrid>

          <FormGrid columns={2}>
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
          </FormGrid>

          <FormField
            label="Nationality"
            required
            error={fieldErrors.nationality}
          >
            <EnhancedInput
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange("nationality", e.target.value)}
              placeholder="e.g., Cypriot, Greek, German"
              required
              error={fieldErrors.nationality}
            />
          </FormField>
        </FormSection>

        {/* Academic Information */}
        <FormSection
          variant="blue"
          title="Academic Information"
          subtitle="Your current academic status and university details"
          icon="solar:diploma-linear"
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-3"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-xl text-blue-600 dark:text-blue-300">
                  <Icon icon="solar:globus-linear" className="w-5 h-5" />
                </div>
                <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                  <span className="font-bold">
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
              </motion.div>
            )}
        </FormSection>

        {/* Exchange Information */}
        <FormSection
          variant="blue"
          title="Exchange Preferences"
          subtitle="Your preferred exchange period and additional details"
          icon="solar:map-point-wave-linear"
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
              label="Academic Year"
              required
              error={fieldErrors.currentYear}
            >
              <EnhancedInput
                id="currentYear"
                value={formData.currentYear}
                onChange={(e) =>
                  handleInputChange("currentYear", e.target.value)
                }
                placeholder="e.g., 2024-2025"
                required
                error={fieldErrors.currentYear}
              />
            </FormField>
          </FormGrid>

          <FormGrid columns={2}>
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
          </FormGrid>

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
        </FormSection>

        {/* Navigation */}
        {/* Subtle auto-save status indicator */}
        <div className="fixed top-24 right-6 z-50">
          {isAutoSaving && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-medium shadow-2xl border border-slate-700/50"
            >
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent mr-2"></div>
              Auto-saving...
            </motion.div>
          )}
          {showSavedIndicator && lastSaved && !isAutoSaving && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center bg-emerald-500/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-medium shadow-2xl border border-emerald-400/50"
            >
              <Icon icon="solar:check-circle-linear" className="w-4 h-4 mr-2" />
              Changes saved
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <StepNavigation
          currentStep={currentStepNumber}
          totalSteps={5}
          onNext={handleSubmit}
          onSaveDraft={handleSaveDraftToDatabase}
          canProceed={!experienceLoading && !isSubmitting && !isAutoSaving}
          isLastStep={false}
          isSubmitting={isSubmitting}
          showPrevious={false}
          showSaveDraft={true}
        />
      </motion.form>
    );
  }

  return (
    <SubmissionGuard>
      <Head>
        <title>Basic Information - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Complete your personal and academic information for your Erasmus application"
        />
      </Head>

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />

        <HeroSection
          badge="Step 1 of 5"
          badgeIcon="solar:user-circle-linear"
          title="Basic Information"
          description="Complete your personal and academic information for your Erasmus application. All fields marked with * are required."
          gradient="blue"
          size="sm"
        />

        <div className="pb-16 px-4">
          <div className="max-w-4xl mx-auto -mt-8 relative z-20">
            {/* Progress Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 mb-8">
              <FormProgressBar
                steps={[
                  { number: 1, name: "Basic Info", href: "/basic-information" },
                  { number: 2, name: "Courses", href: "/course-matching" },
                  { number: 3, name: "Accommodation", href: "/accommodation" },
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
            </div>

            {/* Error/Success Alerts */}
            {experienceError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{experienceError}</AlertDescription>
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
    </SubmissionGuard>
  );
}
