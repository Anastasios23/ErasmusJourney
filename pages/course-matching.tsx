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
import { cn } from "@/lib/utils";
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
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getAgreementsByDepartment,
  getAgreementsByDepartmentAndLevel,
  getAgreementsByUniversityAndLevel,
} from "../src/data/universityAgreements";
import { UNIC_COMPREHENSIVE_AGREEMENTS } from "../src/data/unic_agreements_temp";
import { useFormAutoSave } from "../src/hooks/useFormAutoSave";

interface Course {
  name: string;
  code: string;
  ects: string;
  difficulty: string;
  examTypes: string[];
}

interface EquivalentCourse {
  name: string;
  code: string;
  ects: string;
}

export default function CourseMatching() {
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
    submitExperience,
  } = useErasmusExperience();

  const [formData, setFormData] = useState({
    levelOfStudy: "",
    hostUniversity: "",
    hostDepartment: "",
    homeUniversity: "",
    homeDepartment: "",
    hostCourseCount: "",
    homeCourseCount: "",
    courseMatchingDifficult: "",
    courseMatchingChallenges: "",
    recommendCourses: "",
    recommendationReason: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [equivalentCourses, setEquivalentCourses] = useState<
    EquivalentCourse[]
  >([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [selectedHomeUniversityId, setSelectedHomeUniversityId] = useState("");
  const [availableHostUniversities, setAvailableHostUniversities] = useState<
    Array<{ university: string; city: string; country: string }>
  >([]);

  const cyprusUniversities = CYPRUS_UNIVERSITIES;

  // Load experience data on component mount
  useEffect(() => {
    if (!experienceLoading && experienceData) {
      // Pre-populate form fields with data from basic info
      if (experienceData.basicInfo) {
        const basicInfo = experienceData.basicInfo;

        setFormData((prev) => ({
          ...prev,
          levelOfStudy: basicInfo.levelOfStudy || "",
          homeUniversity: basicInfo.universityInCyprus || "",
          homeDepartment: basicInfo.departmentInCyprus || "",
          hostUniversity: basicInfo.hostUniversity || "",
        }));

        // Set the selected home university ID for department filtering
        if (basicInfo.universityInCyprus) {
          const university = cyprusUniversities.find(
            (u) => u.code === basicInfo.universityInCyprus,
          );
          if (university) {
            setSelectedHomeUniversityId(university.code);
          }
        }
      }

      // Load course data if available
      if (experienceData.courses) {
        const courseData = experienceData.courses;

        // Ensure all form data values are strings, not undefined
        const safeCourseData = Object.entries(courseData).reduce(
          (acc, [key, value]) => {
            if (key === "hostCourses" || key === "equivalentCourses") {
              acc[key] = value; // Keep arrays as is
            } else {
              acc[key] = value ?? ""; // Convert undefined to empty string
            }
            return acc;
          },
          {} as Record<string, any>,
        );

        setFormData((prev) => ({ ...prev, ...(safeCourseData as any) }));

        if (courseData.hostCourses) {
          setCourses(courseData.hostCourses);
        }
        if (courseData.equivalentCourses) {
          setEquivalentCourses(courseData.equivalentCourses);
        }
      }
    }
  }, [experienceLoading, experienceData]);

  useEffect(() => {
    setCurrentStep("course-matching");
  }, [setCurrentStep]);

  // Save to localStorage helper function - defined early for use in useEffect
  const saveToLocalStorage = useCallback(() => {
    const draftKey = `erasmus_form_course-matching`;
    const draftData = {
      type: "course-matching",
      title: "Course Matching Draft",
      data: {
        ...formData,
        hostCourses: courses,
        equivalentCourses: equivalentCourses,
      },
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
  }, [formData, courses, equivalentCourses]);

  // Auto-save to localStorage only (not API) when form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasFormData = Object.values(formData).some((value) => {
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        return value !== null && value !== undefined;
      });

      if (hasFormData || courses.length > 0 || equivalentCourses.length > 0) {
        saveToLocalStorage();
        // Show saved indicator briefly
        setShowSavedIndicator(true);
        setTimeout(() => setShowSavedIndicator(false), 2000);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [formData, courses, equivalentCourses, saveToLocalStorage]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "hostCourseCount") {
      const count = parseInt(value) || 0;
      if (count > 0) {
        initializeCourses(count);
      }
    }

    if (field === "homeCourseCount") {
      const count = parseInt(value) || 0;
      if (count > 0) {
        initializeEquivalentCourses(count);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  // Initialize courses based on count
  const initializeCourses = (count: number) => {
    const newCourses = Array.from({ length: count }, () => ({
      name: "",
      code: "",
      ects: "",
      difficulty: "",
      examTypes: [],
    }));
    setCourses(newCourses);
  };

  // Initialize equivalent courses based on count
  const initializeEquivalentCourses = (count: number) => {
    const newCourses = Array.from({ length: count }, () => ({
      name: "",
      code: "",
      ects: "",
    }));
    setEquivalentCourses(newCourses);
  };

  const updateCourse = (index: number, field: string, value: string) => {
    const updatedCourses = courses.map((course, i) =>
      i === index ? { ...course, [field]: value } : course,
    );
    setCourses(updatedCourses);
  };

  const updateCourseExamTypes = (
    courseIndex: number,
    examType: string,
    checked: boolean,
  ) => {
    const updatedCourses = courses.map((course, i) => {
      if (i === courseIndex) {
        const examTypes = checked
          ? [...course.examTypes, examType]
          : course.examTypes.filter((type) => type !== examType);
        return { ...course, examTypes };
      }
      return course;
    });
    setCourses(updatedCourses);
  };

  const updateEquivalentCourse = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updatedCourses = equivalentCourses.map((course, i) =>
      i === index ? { ...course, [field]: value } : course,
    );
    setEquivalentCourses(updatedCourses);
  };

  // Add error states
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [draftSuccess, setDraftSuccess] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Save draft to database (triggered by Save Draft button)
  const handleSaveDraftToDatabase = useCallback(async () => {
    try {
      const courseData = {
        ...formData,
        hostCourses: courses,
        equivalentCourses: equivalentCourses,
      };

      await saveProgress({
        courses: courseData,
      });

      setDraftSuccess("Draft saved successfully!");
      setTimeout(() => setDraftSuccess(null), 3000);
    } catch (error) {
      console.error("Draft save error:", error);
      setDraftError("Failed to save draft. Please try again.");
      setTimeout(() => setDraftError(null), 5000);
      throw error;
    }
  }, [formData, courses, equivalentCourses, saveProgress]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setValidationErrors({});

    // Always save to localStorage first when navigating
    saveToLocalStorage();

    try {
      // Basic validation
      if (
        courses.some((c) => !c.name || !c.ects) ||
        equivalentCourses.some((e) => !e.name || !e.ects)
      ) {
        setSubmitError("Please provide names and ECTS for all courses.");
        toast({
          variant: "destructive",
          title: "Incomplete Courses",
          description: "Please provide names and ECTS for all courses.",
        });
        setIsSubmitting(false);
        return;
      }

      // Create mappings array for backend validation
      const mappings = courses.map((course, index) => {
        const equivalent = equivalentCourses[index];
        return {
          homeCode: equivalent?.code || "",
          homeName: equivalent?.name || "",
          homeEcts: equivalent?.ects || "0",
          hostCode: course.code || "",
          hostName: course.name || "",
          hostEcts: course.ects || "0",
        };
      });

      // Save progress with course data
      const courseData = {
        ...formData,
        hostCourses: courses,
        equivalentCourses: equivalentCourses,
        mappings: mappings,
      };

      const saved = await saveProgress({
        courses: courseData,
      });

      if (!saved) {
        throw new Error("Failed to save progress. Please try again.");
      }

      // Mark step 2 as completed
      markStepCompleted("course-matching");

      // Navigate to next step
      router.push("/accommodation");
    } catch (error) {
      console.error("Error submitting course matching form:", error);
      if (error instanceof ValidationError) {
        setValidationErrors({ form: error.message });
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        setSubmitError("Failed to submit form. Please try again.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem saving your information.",
        });
      }
      setIsSubmitting(false);
    }
  };

  return (
    <StepGuard requiredStep={2}>
      <SubmissionGuard>
        <Head>
          <title>Course Matching - Erasmus Journey Platform</title>
          <meta
            name="description"
            content="Share details about your course matching and academic experience"
          />
        </Head>

        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <Header />

          <HeroSection
            badge="Step 2 of 5"
            badgeIcon="solar:book-bookmark-bold"
            title="Course Matching"
            description="Detail the courses you took abroad and their equivalents at your home university. This helps future students plan their academic journey."
            gradient="purple"
            size="sm"
            animatedTitle
          />

          <div className="pb-16 px-4">
            <div className="max-w-4xl mx-auto -mt-8 relative z-20">
              {/* Progress Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-500/5 dark:shadow-none border border-slate-100 dark:border-slate-800 mb-8">
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
              </div>

              {/* Error Alerts */}
              {submitError && (
                <Alert variant="destructive" className="mb-6 rounded-2xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Validation Errors */}
              {Object.keys(validationErrors).length > 0 && (
                <Alert variant="destructive" className="mb-6 rounded-2xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {Object.entries(validationErrors).map(
                        ([field, error]) => (
                          <li key={field}>{error}</li>
                        ),
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Academic Context Card */}
              {formData.levelOfStudy &&
                formData.homeUniversity &&
                formData.homeDepartment && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-3xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-300">
                        <Icon
                          icon="solar:info-circle-linear"
                          className="w-5 h-5"
                        />
                      </div>
                      <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider">
                        Your Academic Context
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-indigo-600/70 dark:text-indigo-400/70 uppercase">
                          Level
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white capitalize">
                          {formData.levelOfStudy}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-indigo-600/70 dark:text-indigo-400/70 uppercase">
                          Home University
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {
                            cyprusUniversities.find(
                              (u) => u.code === formData.homeUniversity,
                            )?.shortName
                          }
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-indigo-600/70 dark:text-indigo-400/70 uppercase">
                          Department
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formData.homeDepartment}
                        </div>
                      </div>
                    </div>
                    {formData.hostUniversity && (
                      <div className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-800/50">
                        <span className="text-xs font-semibold text-indigo-600/70 dark:text-indigo-400/70 uppercase">
                          Host University
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formData.hostUniversity}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Course Count Planning */}
                <FormSection
                  variant="purple"
                  title="Course Planning"
                  subtitle="Specify how many courses you took and need to match"
                  icon="solar:checklist-minimalistic-linear"
                >
                  <FormGrid columns={2}>
                    <FormField
                      label="Host University Courses"
                      required
                      error={validationErrors.hostCourseCount}
                      helperText="Number of courses you took at your exchange university"
                    >
                      <EnhancedSelect
                        value={formData.hostCourseCount}
                        onValueChange={(value) =>
                          handleInputChange("hostCourseCount", value)
                        }
                      >
                        <EnhancedSelectTrigger
                          error={validationErrors.hostCourseCount}
                        >
                          <EnhancedSelectValue placeholder="Select number" />
                        </EnhancedSelectTrigger>
                        <EnhancedSelectContent>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(
                            (num) => (
                              <EnhancedSelectItem
                                key={num}
                                value={num.toString()}
                              >
                                {num} {num === 1 ? "course" : "courses"}
                              </EnhancedSelectItem>
                            ),
                          )}
                        </EnhancedSelectContent>
                      </EnhancedSelect>
                    </FormField>

                    <FormField
                      label="Home University Equivalent Courses"
                      required
                      error={validationErrors.homeCourseCount}
                      helperText="Equivalent courses at your home university"
                    >
                      <EnhancedSelect
                        value={formData.homeCourseCount}
                        onValueChange={(value) =>
                          handleInputChange("homeCourseCount", value)
                        }
                      >
                        <EnhancedSelectTrigger
                          error={validationErrors.homeCourseCount}
                        >
                          <EnhancedSelectValue placeholder="Select number" />
                        </EnhancedSelectTrigger>
                        <EnhancedSelectContent>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(
                            (num) => (
                              <EnhancedSelectItem
                                key={num}
                                value={num.toString()}
                              >
                                {num} {num === 1 ? "course" : "courses"}
                              </EnhancedSelectItem>
                            ),
                          )}
                        </EnhancedSelectContent>
                      </EnhancedSelect>
                    </FormField>
                  </FormGrid>

                  {formData.hostCourseCount && formData.homeCourseCount && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-3"
                    >
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-300">
                        <Icon icon="solar:book-2-linear" className="w-5 h-5" />
                      </div>
                      <p className="text-emerald-800 dark:text-emerald-200 text-sm font-medium">
                        You'll provide details for{" "}
                        <span className="font-bold">
                          {formData.hostCourseCount} host courses
                        </span>{" "}
                        and{" "}
                        <span className="font-bold">
                          {formData.homeCourseCount} home equivalents
                        </span>
                        .
                      </p>
                    </motion.div>
                  )}
                </FormSection>

                {/* Courses at Host University */}
                {formData.hostCourseCount && (
                  <FormSection
                    variant="purple"
                    title={`Courses at Host University`}
                    subtitle={`Details for the ${courses.length} courses you took abroad`}
                    icon="solar:globus-linear"
                  >
                    {/* Course Program Image Upload */}
                    <FormField
                      label="Course Program Image (Optional)"
                      helperText="Upload a photo of your course program or fill the manual entry below"
                    >
                      <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 bg-slate-50/50 dark:bg-slate-900/50">
                        {uploadedFile ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-3">
                              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <Icon
                                  icon="solar:document-check-linear"
                                  className="w-6 h-6"
                                />
                              </div>
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {uploadedFile.name}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={removeUploadedFile}
                                className="rounded-full hover:bg-red-50 hover:text-red-500"
                              >
                                <Icon
                                  icon="solar:trash-bin-minimalistic-linear"
                                  className="w-5 h-5"
                                />
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              File uploaded successfully. Manual entry below is
                              still required for data accuracy.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                              <Icon
                                icon="solar:upload-minimalistic-linear"
                                className="w-8 h-8"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Upload course program
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                PNG, JPG or PDF (max. 5MB)
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="course-program-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document
                                  .getElementById("course-program-upload")
                                  ?.click()
                              }
                              className="rounded-xl border-slate-200 dark:border-slate-700 font-bold"
                            >
                              Choose File
                            </Button>
                          </div>
                        )}
                      </div>
                    </FormField>

                    <div className="space-y-6">
                      {courses.map((course, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-1.5 transition-all duration-200" />

                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">
                              Host Course Details
                            </h4>
                          </div>

                          <FormGrid columns={2}>
                            <FormField label="Course Name" required>
                              <EnhancedInput
                                placeholder="e.g. Advanced Algorithms"
                                value={course.name}
                                onChange={(e) =>
                                  updateCourse(index, "name", e.target.value)
                                }
                              />
                            </FormField>

                            <FormField label="Course Code" required>
                              <EnhancedInput
                                placeholder="e.g. CS301"
                                value={course.code}
                                onChange={(e) =>
                                  updateCourse(index, "code", e.target.value)
                                }
                              />
                            </FormField>

                            <FormField
                              label="ECTS Credits"
                              required
                              helperText="Usually 3-6 ECTS"
                            >
                              <EnhancedInput
                                type="number"
                                placeholder="6"
                                value={course.ects}
                                onChange={(e) =>
                                  updateCourse(index, "ects", e.target.value)
                                }
                              />
                            </FormField>

                            <FormField
                              label="Difficulty Level"
                              helperText="1 (Easy) to 5 (Hard)"
                            >
                              <EnhancedSelect
                                value={course.difficulty}
                                onValueChange={(value) =>
                                  updateCourse(index, "difficulty", value)
                                }
                              >
                                <EnhancedSelectTrigger>
                                  <EnhancedSelectValue placeholder="Select difficulty" />
                                </EnhancedSelectTrigger>
                                <EnhancedSelectContent>
                                  {[1, 2, 3, 4, 5].map((val) => (
                                    <EnhancedSelectItem
                                      key={val}
                                      value={val.toString()}
                                    >
                                      {val} -{" "}
                                      {
                                        [
                                          "Very Easy",
                                          "Easy",
                                          "Moderate",
                                          "Difficult",
                                          "Very Difficult",
                                        ][val - 1]
                                      }
                                    </EnhancedSelectItem>
                                  ))}
                                </EnhancedSelectContent>
                              </EnhancedSelect>
                            </FormField>
                          </FormGrid>

                          <div className="mt-6">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">
                              Examination Types
                            </Label>
                            <div className="flex flex-wrap gap-4">
                              {[
                                "oral",
                                "written",
                                "presentation",
                                "project",
                              ].map((examType) => (
                                <div
                                  key={examType}
                                  className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"
                                >
                                  <Checkbox
                                    id={`${examType}-${index}`}
                                    checked={course.examTypes.includes(
                                      examType,
                                    )}
                                    onCheckedChange={(checked) =>
                                      updateCourseExamTypes(
                                        index,
                                        examType,
                                        checked as boolean,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`${examType}-${index}`}
                                    className="text-sm font-medium capitalize cursor-pointer"
                                  >
                                    {examType}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </FormSection>
                )}

                {/* Home University Equivalent Courses */}
                {formData.homeCourseCount && (
                  <FormSection
                    variant="purple"
                    title="Home University Equivalents"
                    subtitle={`Details for the ${equivalentCourses.length} courses at your home university`}
                    icon="solar:home-2-linear"
                  >
                    <div className="space-y-6">
                      {equivalentCourses.map((course, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:w-1.5 transition-all duration-200" />

                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">
                              Equivalent Course Details
                            </h4>
                          </div>

                          <FormGrid columns={3}>
                            <FormField label="Course Name" required>
                              <EnhancedInput
                                placeholder="Equivalent name"
                                value={course.name}
                                onChange={(e) =>
                                  updateEquivalentCourse(
                                    index,
                                    "name",
                                    e.target.value,
                                  )
                                }
                              />
                            </FormField>

                            <FormField label="Course Code" required>
                              <EnhancedInput
                                placeholder="Code"
                                value={course.code}
                                onChange={(e) =>
                                  updateEquivalentCourse(
                                    index,
                                    "code",
                                    e.target.value,
                                  )
                                }
                              />
                            </FormField>

                            <FormField label="ECTS" required>
                              <EnhancedInput
                                type="number"
                                placeholder="ECTS"
                                value={course.ects}
                                onChange={(e) =>
                                  updateEquivalentCourse(
                                    index,
                                    "ects",
                                    e.target.value,
                                  )
                                }
                              />
                            </FormField>
                          </FormGrid>
                        </motion.div>
                      ))}
                    </div>
                  </FormSection>
                )}

                {/* Course Matching Evaluation */}
                <FormSection
                  variant="purple"
                  title="Experience Assessment"
                  subtitle="Help future students understand the course matching process"
                  icon="solar:star-linear"
                >
                  <FormField
                    label="Was the course-matching process difficult?"
                    required
                  >
                    <RadioGroup
                      value={formData.courseMatchingDifficult}
                      onValueChange={(value) =>
                        handleInputChange("courseMatchingDifficult", value)
                      }
                      className="flex flex-col gap-3 mt-2"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                          formData.courseMatchingDifficult === "yes"
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                            : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800",
                        )}
                      >
                        <RadioGroupItem value="yes" id="difficult-yes" />
                        <Label
                          htmlFor="difficult-yes"
                          className="font-bold cursor-pointer"
                        >
                          Yes, it was challenging
                        </Label>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                          formData.courseMatchingDifficult === "no"
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                            : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800",
                        )}
                      >
                        <RadioGroupItem value="no" id="difficult-no" />
                        <Label
                          htmlFor="difficult-no"
                          className="font-bold cursor-pointer"
                        >
                          No, it was straightforward
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormField>

                  {formData.courseMatchingDifficult === "yes" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <FormField
                        label="What were the challenges?"
                        required
                        helperText="Describe the specific difficulties you encountered"
                      >
                        <EnhancedTextarea
                          placeholder="Describe the challenges you faced..."
                          value={formData.courseMatchingChallenges}
                          onChange={(e) =>
                            handleInputChange(
                              "courseMatchingChallenges",
                              e.target.value,
                            )
                          }
                          className="min-h-[120px]"
                        />
                      </FormField>
                    </motion.div>
                  )}

                  <FormField
                    label="Would you recommend these courses for future students?"
                    required
                  >
                    <RadioGroup
                      value={formData.recommendCourses}
                      onValueChange={(value) =>
                        handleInputChange("recommendCourses", value)
                      }
                      className="flex flex-col gap-3 mt-2"
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                          formData.recommendCourses === "yes"
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                            : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800",
                        )}
                      >
                        <RadioGroupItem value="yes" id="recommend-yes" />
                        <Label
                          htmlFor="recommend-yes"
                          className="font-bold cursor-pointer"
                        >
                          Yes, I recommend them
                        </Label>
                      </div>
                      <div
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-pointer",
                          formData.recommendCourses === "no"
                            ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                            : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800",
                        )}
                      >
                        <RadioGroupItem value="no" id="recommend-no" />
                        <Label
                          htmlFor="recommend-no"
                          className="font-bold cursor-pointer"
                        >
                          No, I would not recommend them
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormField>

                  {formData.recommendCourses === "no" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <FormField
                        label="Why wouldn't you recommend these courses?"
                        required
                      >
                        <EnhancedTextarea
                          placeholder="Explain why you wouldn't recommend these courses..."
                          value={formData.recommendationReason}
                          onChange={(e) =>
                            handleInputChange(
                              "recommendationReason",
                              e.target.value,
                            )
                          }
                          className="min-h-[120px]"
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
                    onPrevious={() => router.push("/basic-information")}
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
