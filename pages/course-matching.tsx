import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "../src/hooks/use-toast";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ValidationError } from "../src/utils/apiErrorHandler";
import { useFormProgress } from "../src/context/FormProgressContext";

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
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Checkbox } from "../src/components/ui/checkbox";
import Header from "../components/Header";
import { ArrowRight, ArrowLeft, Upload, BookOpen, X } from "lucide-react";
import {
  CYPRUS_UNIVERSITIES,
  ALL_UNIVERSITY_AGREEMENTS,
  getAgreementsByDepartment,
  getAgreementsByDepartmentAndLevel,
  getAgreementsByUniversityAndLevel,
} from "../src/data/universityAgreements";
import { UNIC_COMPREHENSIVE_AGREEMENTS } from "../src/data/unic_agreements_temp";
import { useFormSubmissions } from "../src/hooks/useFormSubmissions";
import { useFormAutoSave } from "../src/hooks/useFormAutoSave";
// import { markStepCompleted } from "../src/utils/progress";

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
  const { data: session } = useSession();
  const router = useRouter();
  const { markStepCompleted } = useFormProgress();

  // Form submissions hook
  const {
    submitForm,
    getDraftData,
    getFormData,
    saveDraft,
    getBasicInfoId,
    loading: submissionsLoading,
    error: submissionsError,
  } = useFormSubmissions();

  // Authentication temporarily disabled - all users can access

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

  // Get departments for selected Cyprus university
  const homeDepartments =
    selectedHomeUniversityId === "UNIC"
      ? // For UNIC, get unique departments from actual agreement data
        [
          ...new Set(
            UNIC_COMPREHENSIVE_AGREEMENTS.filter(
              (agreement) => agreement.academicLevel === formData.levelOfStudy,
            ).map((agreement) => agreement.homeDepartment.trim()),
          ),
        ]
      : selectedHomeUniversityId
        ? // For other universities, use the predefined departments
          cyprusUniversities.find((u) => u.code === selectedHomeUniversityId)
            ?.departments || []
        : [];

  // Load draft data on component mount
  useEffect(() => {
    const loadDraftData = async () => {
      try {
        console.log("Loading basic info data...");
        // Use getFormData instead of direct API call
        const draftData = getFormData("basic-info"); // Remove "basic-information"
        console.log("Draft data loaded:", draftData);

        if (draftData) {
          console.log("Pre-populating form with:", {
            levelOfStudy: draftData.levelOfStudy,
            universityInCyprus: draftData.universityInCyprus,
            departmentInCyprus: draftData.departmentInCyprus,
            preferredHostUniversity: draftData.preferredHostUniversity,
          });

          // Pre-populate form fields with data from basic-information
          setFormData((prev) => ({
            ...prev,
            levelOfStudy: draftData.levelOfStudy || "",
            homeUniversity: draftData.universityInCyprus || "",
            homeDepartment: draftData.departmentInCyprus || "",
            hostUniversity: draftData.preferredHostUniversity || "",
          }));

          // Set the selected home university ID for department filtering
          if (draftData.universityInCyprus) {
            const university = cyprusUniversities.find(
              (u) => u.name === draftData.universityInCyprus,
            );
            console.log("Found university:", university);
            if (university) {
              setSelectedHomeUniversityId(university.code);
            }
          }
        } else {
          console.log("No draft data found");
        }
      } catch (error) {
        console.error("Error loading draft data:", error);
      }
    };

    // Only load once
    loadDraftData();
  }, []); // Remove getFormData from dependencies to prevent re-runs

  // Load course-matching draft data
  useEffect(() => {
    const courseMatchingDraft = getDraftData("course-matching");
    if (courseMatchingDraft) {
      // Load form data
      const { courses: draftCourses, ...restFormData } = courseMatchingDraft;
      setFormData((prev) => ({ ...prev, ...restFormData }));

      // Load courses if they exist
      if (draftCourses && Array.isArray(draftCourses)) {
        const hostCourses = draftCourses.filter((c) => c.type === "host");
        const homeCourses = draftCourses.filter((c) => c.type === "home");

        if (hostCourses.length > 0) {
          setCourses(hostCourses.map(({ type, ...course }) => course));
        }

        if (homeCourses.length > 0) {
          setEquivalentCourses(
            homeCourses.map(
              ({ type, difficulty, examTypes, ...course }) => course,
            ),
          );
        }
      }
    }
  }, []);

  // Auto-save functionality
  const saveFormData = useCallback(async () => {
    try {
      const dataToSave = {
        ...formData,
        courses: [
          ...courses.map((course) => ({ ...course, type: "host" })),
          ...equivalentCourses.map((course) => ({
            ...course,
            difficulty: "",
            examTypes: [],
            type: "home",
          })),
        ],
      };
      await saveDraft(
        "course-matching",
        "Course Matching Information",
        dataToSave,
      );
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }, [formData, courses, equivalentCourses, saveDraft]);

  // Add auto-save hook
  const { isAutoSaving, showSavedIndicator, setIsNavigating } = useFormAutoSave(
    "course-matching",
    "Course Matching Information",
    { ...formData, courses, equivalentCourses },
    isSubmitting,
  );

  // Auto-save when form data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasFormData = Object.values(formData).some((value) => {
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        return value !== null && value !== undefined;
      });

      if (hasFormData || courses.length > 0 || equivalentCourses.length > 0) {
        saveFormData();
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [formData, courses, equivalentCourses, saveFormData]);

  // Save before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      const hasFormData = Object.values(formData).some((value) => {
        if (typeof value === "string") {
          return value.trim() !== "";
        }
        return value !== null && value !== undefined;
      });

      if (hasFormData || courses.length > 0 || equivalentCourses.length > 0) {
        saveFormData();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, courses, equivalentCourses, saveFormData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "homeUniversity") {
      setSelectedHomeUniversityId(value);
      setFormData((prev) => ({
        ...prev,
        homeDepartment: "",
        hostUniversity: "",
        hostDepartment: "",
      }));
      setAvailableHostUniversities([]);
    }

    // Handle department selection with level-aware filtering
    if (field === "homeDepartment") {
      if (!formData.homeUniversity) return; // guard

      let partnershipAgreements;
      if (formData.homeUniversity === "UNIC") {
        partnershipAgreements = getAgreementsByDepartmentAndLevel(
          formData.homeUniversity,
          value, // the department they just chose
          formData.levelOfStudy as "bachelor" | "master" | "phd",
        );
      } else {
        partnershipAgreements = getAgreementsByDepartment(
          formData.homeUniversity,
          value,
        );
      }

      const hostUniversities = partnershipAgreements.map((agreement) => ({
        university: agreement.partnerUniversity,
        city: agreement.partnerCity,
        country: agreement.partnerCountry,
      }));

      // Remove duplicates
      const uniqueHostUniversities = hostUniversities.filter(
        (uni, index, self) =>
          index === self.findIndex((u) => u.university === uni.university),
      );

      setAvailableHostUniversities(uniqueHostUniversities);

      // Reset host university selection
      setFormData((prev) => ({
        ...prev,
        hostUniversity: "",
        hostDepartment: "",
      }));
    }

    // Clear data when level changes for UNIC
    if (field === "levelOfStudy" && formData.homeUniversity === "UNIC") {
      setFormData((prev) => ({
        ...prev,
        homeDepartment: "",
        hostUniversity: "",
        hostDepartment: "",
      }));
      setAvailableHostUniversities([]);
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setValidationErrors({});

    try {
      // Save current form data before submission
      const courseMatchingData = {
        ...formData,
        courses: [
          ...courses.map((course) => ({ ...course, type: "host" })),
          ...equivalentCourses.map((course) => ({
            ...course,
            difficulty: "",
            examTypes: [],
            type: "home",
          })),
        ],
      };

      // Always save data to localStorage for navigation back
      localStorage.setItem(
        "erasmus_form_course-matching",
        JSON.stringify(courseMatchingData),
      );

      // Basic validation
      if (!formData.hostCourseCount || !formData.homeCourseCount) {
        setValidationErrors({
          courseCount:
            "Please specify the number of courses for both host and home university",
        });
        setSubmitError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Get the basicInfoId
      const basicInfoId = getBasicInfoId();

      // Submit the form
      const response = await submitForm(
        "course-matching",
        "Course Matching Information",
        courseMatchingData,
        "submitted",
        basicInfoId,
      );

      if (response?.submissionId) {
        // Remove draft but keep navigation data
        localStorage.removeItem("erasmus_draft_course-matching");

        // Mark step as completed
        markStepCompleted("course-matching");

        // Navigate immediately
        router.push("/accommodation");
      } else {
        throw new Error("No submission ID received");
      }
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

  // Load saved form data when component mounts
  useEffect(() => {
    // Load from navigation data first (user came back from next page)
    const savedFormData = localStorage.getItem("erasmus_form_course-matching");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        console.log("Loading saved course-matching data:", parsedData);

        // Load form data
        const { courses: savedCourses, ...restFormData } = parsedData;
        setFormData((prev) => ({ ...prev, ...restFormData }));

        // Load courses if they exist
        if (savedCourses && Array.isArray(savedCourses)) {
          const hostCourses = savedCourses.filter((c) => c.type === "host");
          const homeCourses = savedCourses.filter((c) => c.type === "home");

          if (hostCourses.length > 0) {
            setCourses(hostCourses.map(({ type, ...course }) => course));
          }

          if (homeCourses.length > 0) {
            setEquivalentCourses(
              homeCourses.map(
                ({ type, difficulty, examTypes, ...course }) => course,
              ),
            );
          }
        }
      } catch (error) {
        console.error("Error loading saved course-matching data:", error);
      }
    } else {
      // Fallback to draft data
      const courseMatchingDraft = getDraftData("course-matching");
      if (courseMatchingDraft) {
        // Load form data
        const { courses: draftCourses, ...restFormData } = courseMatchingDraft;
        setFormData((prev) => ({ ...prev, ...restFormData }));

        // Load courses if they exist
        if (draftCourses && Array.isArray(draftCourses)) {
          const hostCourses = draftCourses.filter((c) => c.type === "host");
          const homeCourses = draftCourses.filter((c) => c.type === "home");

          if (hostCourses.length > 0) {
            setCourses(hostCourses.map(({ type, ...course }) => course));
          }

          if (homeCourses.length > 0) {
            setEquivalentCourses(
              homeCourses.map(
                ({ type, difficulty, examTypes, ...course }) => course,
              ),
            );
          }
        }
      }
    }

    // Load basic info data to get university information
    const basicInfoData =
      localStorage.getItem("erasmus_form_basic-info") ||
      getDraftData("basic-info");

    if (basicInfoData) {
      const parsedBasicInfo =
        typeof basicInfoData === "string"
          ? JSON.parse(basicInfoData)
          : basicInfoData;

      // Pre-populate form fields with data from basic-information
      setFormData((prev) => ({
        ...prev,
        levelOfStudy: parsedBasicInfo.levelOfStudy || "",
        homeUniversity: parsedBasicInfo.universityInCyprus || "",
        homeDepartment: parsedBasicInfo.departmentInCyprus || "",
        hostUniversity: parsedBasicInfo.hostUniversity || "",
      }));

      // Set the selected home university ID for department filtering
      if (parsedBasicInfo.universityInCyprus) {
        const university = cyprusUniversities.find(
          (u) => u.code === parsedBasicInfo.universityInCyprus,
        );
        if (university) {
          setSelectedHomeUniversityId(university.code);
        }
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>Course Matching - Erasmus Journey Platform</title>
        <meta
          name="description"
          content="Share details about your course matching and academic experience"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Progress Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  Step 2 of 5
                </Badge>
                <h1 className="text-2xl font-bold text-gray-900">
                  Course Matching Information
                </h1>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Alert */}
          {submitError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Validation Errors */}
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Display current university information from basic info */}
          {formData.levelOfStudy &&
            formData.homeUniversity &&
            formData.homeDepartment && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">
                      Your Academic Information
                    </span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Level:</span>
                      <div className="font-medium capitalize">
                        {formData.levelOfStudy}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">University:</span>
                      <div className="font-medium">
                        {
                          cyprusUniversities.find(
                            (u) => u.code === formData.homeUniversity,
                          )?.shortName
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <div className="font-medium">
                        {formData.homeDepartment}
                      </div>
                    </div>
                  </div>
                  {formData.hostUniversity && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <span className="text-gray-600 text-sm">
                        Host University:
                      </span>
                      <div className="font-medium text-sm">
                        {formData.hostUniversity}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Remove the University Selection Card completely */}

            {/* Course Count Planning */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Course Planning
                </CardTitle>
                <p className="text-gray-600">
                  Tell us about the courses you took during your exchange
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hostCourseCount">
                      How many courses did you take at the host university?
                    </Label>
                    <Select
                      value={formData.hostCourseCount}
                      onValueChange={(value) =>
                        handleInputChange("hostCourseCount", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of courses" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "course" : "courses"}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeCourseCount">
                      How many equivalent courses do you have at your home
                      university?
                    </Label>
                    <Select
                      value={formData.homeCourseCount}
                      onValueChange={(value) =>
                        handleInputChange("homeCourseCount", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of courses" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "course" : "courses"}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.hostCourseCount && formData.homeCourseCount && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Course Setup:</strong> You'll provide details for{" "}
                      <span className="font-semibold">
                        {formData.hostCourseCount} host university courses
                      </span>{" "}
                      and{" "}
                      <span className="font-semibold">
                        {formData.homeCourseCount} equivalent home courses
                      </span>
                      .
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Courses at Host University */}
            {formData.hostCourseCount && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Courses at Host University ({courses.length} of{" "}
                    {formData.hostCourseCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course Program Image Upload */}
                  <div className="space-y-2">
                    <Label>Course Program Image (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <BookOpen className="h-6 w-6 text-green-600" />
                            <span className="text-sm font-medium text-green-600">
                              {uploadedFile.name}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeUploadedFile}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            File uploaded successfully. You can still fill the
                            manual entry below.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload a photo of your course program
                          </p>
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
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById("course-program-upload")
                                ?.click()
                            }
                          >
                            Choose File
                          </Button>
                          <p className="text-xs text-gray-500 mt-2">
                            If the photo program is not accurate, we'll use the
                            manual entry below
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {courses.map((course, index) => (
                    <Card
                      key={index}
                      className="p-4 border-l-4 border-l-blue-500"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          Course {index + 1}
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Course Name</Label>
                          <Input
                            placeholder="Enter course name"
                            value={course.name}
                            onChange={(e) =>
                              updateCourse(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Course Code</Label>
                          <Input
                            placeholder="Enter course code"
                            value={course.code}
                            onChange={(e) =>
                              updateCourse(index, "code", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ECTS Credits</Label>
                          <Input
                            type="number"
                            placeholder="Enter ECTS credits"
                            value={course.ects}
                            onChange={(e) =>
                              updateCourse(index, "ects", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Level of Difficulty (1-5)</Label>
                          <Select
                            onValueChange={(value) =>
                              updateCourse(index, "difficulty", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 - Very Easy</SelectItem>
                              <SelectItem value="2">2 - Easy</SelectItem>
                              <SelectItem value="3">3 - Moderate</SelectItem>
                              <SelectItem value="4">4 - Difficult</SelectItem>
                              <SelectItem value="5">
                                5 - Very Difficult
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Exam Types (Select all that apply)</Label>
                          <div className="flex flex-wrap gap-6">
                            {["oral", "written", "presentation", "project"].map(
                              (examType) => (
                                <div
                                  key={examType}
                                  className="flex items-center space-x-2"
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
                                  <Label htmlFor={`${examType}-${index}`}>
                                    {examType === "project"
                                      ? "Project-Based"
                                      : examType.charAt(0).toUpperCase() +
                                        examType.slice(1)}
                                  </Label>
                                </div>
                              ),
                            )}
                          </div>
                          {course.examTypes.length > 0 && (
                            <p className="text-xs text-gray-600">
                              Selected: {course.examTypes.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Home University Equivalent Courses */}
            {formData.homeCourseCount && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Home University Equivalent Courses (
                    {equivalentCourses.length} of {formData.homeCourseCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {equivalentCourses.map((course, index) => (
                    <Card
                      key={index}
                      className="p-4 border-l-4 border-l-green-500"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">
                          Equivalent Course {index + 1}
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Course Name</Label>
                          <Input
                            placeholder="Enter equivalent course name"
                            value={course.name}
                            onChange={(e) =>
                              updateEquivalentCourse(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Course Code</Label>
                          <Input
                            placeholder="Enter course code"
                            value={course.code}
                            onChange={(e) =>
                              updateEquivalentCourse(
                                index,
                                "code",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ECTS Credits</Label>
                          <Input
                            type="number"
                            placeholder="Enter ECTS credits"
                            value={course.ects}
                            onChange={(e) =>
                              updateEquivalentCourse(
                                index,
                                "ects",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Course Matching Evaluation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Course Matching Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">
                      Was the course-matching process difficult?
                    </Label>
                    <RadioGroup
                      value={formData.courseMatchingDifficult}
                      onValueChange={(value) =>
                        handleInputChange("courseMatchingDifficult", value)
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="difficult-yes" />
                        <Label htmlFor="difficult-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="difficult-no" />
                        <Label htmlFor="difficult-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.courseMatchingDifficult === "yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="challenges">
                        What were the challenges?
                      </Label>
                      <Textarea
                        id="challenges"
                        placeholder="Describe the challenges you faced during the course-matching process..."
                        value={formData.courseMatchingChallenges}
                        onChange={(e) =>
                          handleInputChange(
                            "courseMatchingChallenges",
                            e.target.value,
                          )
                        }
                        rows={4}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-base font-medium">
                      Would you recommend these courses for future students?
                    </Label>
                    <RadioGroup
                      value={formData.recommendCourses}
                      onValueChange={(value) =>
                        handleInputChange("recommendCourses", value)
                      }
                      className="mt-2"
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

                  {formData.recommendCourses === "no" && (
                    <div className="space-y-2">
                      <Label htmlFor="recommendationReason">Why not?</Label>
                      <Textarea
                        id="recommendationReason"
                        placeholder="Explain why you wouldn't recommend these courses..."
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
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8">
              <Link href="/basic-information">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Basic Information
                </Button>
              </Link>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    try {
                      saveDraft(
                        "course-matching",
                        "Course Matching Information",
                        {
                          ...formData,
                          courses,
                          equivalentCourses,
                        },
                      );
                      toast({
                        title: "Draft saved",
                        description:
                          "Your course matching information has been saved as a draft.",
                      });
                    } catch (error) {
                      console.error("Error saving draft:", error);
                      toast({
                        title: "Error saving draft",
                        description:
                          "There was a problem saving your draft. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={isSubmitting || isAutoSaving}
                  className="flex items-center gap-2"
                >
                  {isAutoSaving ? "Auto-saving..." : "Save Draft"}
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || isAutoSaving}
                  className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2">⏳</div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Continue to Accommodation
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Auto-save indicator */}
            <div className="fixed top-20 right-4 z-40">
              {showSavedIndicator && (
                <div className="bg-gray-800 bg-opacity-90 text-white px-2 py-1 rounded text-xs shadow-lg transition-all duration-300 ease-in-out">
                  ✓ Auto-saved
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
