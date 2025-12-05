import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback } from "../src/components/ui/avatar";
import Header from "../components/Header";
import { SubmissionGuard } from "../components/SubmissionGuard";
import {
  ArrowLeft,
  Heart,
  CheckCircle,
  Users,
  MessageSquare,
  Mail,
  Instagram,
  Facebook,
  Linkedin,
  Globe,
  Star,
  Trophy,
  Save,
} from "lucide-react";
import { useCommunityStats } from "../src/hooks/useCommunityStats";
import { Skeleton } from "../src/components/ui/skeleton";
import { useFormValidation } from "../src/hooks/useFormValidation";
import { FormErrorSummary } from "../src/components/FormErrorSummary";
import { useErasmusExperience } from "../src/hooks/useErasmusExperience";
import { useFormProgress } from "../src/context/FormProgressContext";
import { StepGuard } from "../components/forms/StepGuard";

export default function HelpFutureStudents() {
  const router = useRouter();
  const { stats, loading } = useCommunityStats();
  const {
    data: experienceData,
    saveProgress,
    submitExperience,
    error: experienceError,
  } = useErasmusExperience();
  const { setCurrentStep } = useFormProgress();

  // Keep the local isSubmitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    wantToHelp: "",
    contactMethod: "",
    email: "",
    instagramUsername: "",
    facebookLink: "",
    linkedinProfile: "",
    personalWebsite: "",
    phoneNumber: "",
    preferredContactTime: "",
    languagesSpoken: [],
    helpTopics: [],
    availabilityLevel: "",
    mentorshipExperience: "",
    additionalAdvice: "",
    publicProfile: "",
    allowPublicContact: "",
    responseTime: "",
    specializations: [],
    otherSpecialization: "",
    funFact: "",
    nickname: "",
  });

  // Fix destructuring to include setFormError
  const {
    fieldErrors,
    formError,
    setError,
    clearErrors,
    setFieldErrors,
    setFormError,
  } = useFormValidation();

  // Load saved data when component mounts (prefer unified experience record)
  useEffect(() => {
    const savedFormData = localStorage.getItem(
      "erasmus_form_help-future-students",
    );

    // Prefer unified experience record (nested under experience.helpForStudents)
    const unifiedHelp = (experienceData?.experience as any)?.helpForStudents;
    if (unifiedHelp) {
      try {
        setFormData((prev) => ({
          ...prev,
          ...unifiedHelp,
          wantToHelp:
            typeof unifiedHelp.wantToHelp === "boolean"
              ? unifiedHelp.wantToHelp
                ? "yes"
                : "no"
              : prev.wantToHelp,
        }));
        return;
      } catch (e) {
        // fallback to localStorage
      }
    }

    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error("Error loading saved help-future-students data:", error);
      }
    }
  }, [experienceData]);

  useEffect(() => {
    setCurrentStep("help-future-students");
  }, [setCurrentStep]);

  // State for draft success/error messages
  const [draftSuccess, setDraftSuccess] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Save to localStorage helper function
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(
      "erasmus_form_help-future-students",
      JSON.stringify(formData),
    );
  }, [formData]);

  // Save-as-draft using unified API (nested experience.helpForStudents)
  const saveUnifiedDraft = useCallback(async () => {
    const payload = {
      experience: {
        helpForStudents: {
          ...formData,
          wantToHelp:
            formData.wantToHelp === "yes"
              ? true
              : formData.wantToHelp === "no"
                ? false
                : undefined,
        },
      },
    } as any;

    await saveProgress(payload);
  }, [formData, saveProgress]);

  // Save draft to database with success message (triggered by Save Draft button)
  const handleSaveDraftToDatabase = useCallback(async () => {
    try {
      await saveUnifiedDraft();

      setDraftSuccess("Draft saved successfully!");
      toast.success("Draft saved successfully!");
      setTimeout(() => setDraftSuccess(null), 3000);
    } catch (error) {
      console.error("Draft save error:", error);
      setDraftError("Failed to save draft. Please try again.");
      toast.error("Failed to save draft. Please try again.");
      setTimeout(() => setDraftError(null), 5000);
      throw error;
    }
  }, [saveUnifiedDraft]);

  // Auto-save to localStorage only (not API) when form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasContent = Object.values(formData).some((value) =>
        typeof value === "string"
          ? value.trim() !== ""
          : Array.isArray(value)
            ? value.length > 0
            : false,
      );
      if (hasContent) {
        saveToLocalStorage();
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [formData, saveToLocalStorage]);

  // Save before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      const hasContent = Object.values(formData).some((value) =>
        typeof value === "string"
          ? value.trim() !== ""
          : Array.isArray(value)
            ? value.length > 0
            : false,
      );
      if (hasContent) {
        // best-effort local save for UX only
        localStorage.setItem(
          "erasmus_form_help-future-students",
          JSON.stringify(formData),
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, item: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), item]
        : (prev[field as keyof typeof prev] as string[]).filter(
            (i) => i !== item,
          ),
    }));
  };

  // Update hero section with better contrast
  const heroSection = (
    <section className="bg-gradient-to-r from-green-700 to-blue-700 text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Heart className="h-12 w-12 text-white mx-auto mb-4" />
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
          Become a Mentor
        </h2>
        <p className="text-xl text-white mb-6 max-w-2xl mx-auto">
          Your experience could be exactly what someone needs to succeed. Join
          our community of student mentors and make a real difference.
        </p>
      </div>
    </section>
  );

  // Update form error handling
  const handleError = (message: string, field?: string) => {
    if (field) {
      setFieldErrors((prev) => ({ ...prev, [field]: message }));
    } else {
      setFormError(message); // Now properly using the setter from useFormValidation
    }

    // Display error toast
    toast.error(message);
  };

  // Update form validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    // Always save to localStorage first when submitting
    saveToLocalStorage();

    const errors: Record<string, string> = {};
    if (!formData.wantToHelp) {
      errors.wantToHelp = "Please indicate if you want to help future students";
    }

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) =>
        setError(message, field),
      );
      document.getElementById(Object.keys(errors)[0])?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      // Persist to unified draft
      await saveUnifiedDraft();

      // Pass the help data to submit to ensure validation passes
      const submissionData: any = {
        basicInfo: experienceData?.basicInfo || {},
        courses: experienceData?.courses || [],
        accommodation: experienceData?.accommodation || {},
        livingExpenses: experienceData?.livingExpenses || {},
        experience: {
          ...(experienceData?.experience || {}),
          helpForStudents: {
            ...formData,
            wantToHelp:
              formData.wantToHelp === "yes"
                ? true
                : formData.wantToHelp === "no"
                  ? false
                  : undefined,
          },
        },
      };

      const ok = await submitExperience(submissionData);

      if (!ok) {
        throw new Error(experienceError || "Failed to submit experience");
      }

      [
        "basic-info",
        "course-matching",
        "accommodation",
        "living-expenses",
        "help-future-students",
      ].forEach((step) => {
        localStorage.removeItem(`erasmus_form_${step}`);
        localStorage.removeItem(`erasmus_draft_${step}`);
      });

      router.push("/submission-confirmation");
    } catch (err) {
      console.error("Final submission failed:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to submit experience",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const languages = [
    "English",
    "Greek",
    "German",
    "Spanish",
    "French",
    "Italian",
    "Portuguese",
    "Dutch",
    "Swedish",
    "Czech",
    "Polish",
    "Other",
  ];

  const helpTopics = [
    "Accommodation Search",
    "University Application",
    "Visa Requirements",
    "Course Selection",
    "Budget Planning",
    "Cultural Adaptation",
    "Language Learning",
    "Social Activities",
    "Travel Tips",
    "Academic Support",
    "Career Guidance",
    "Emergency Situations",
  ];

  const specializations = [
    "Engineering",
    "Business",
    "Medicine",
    "Computer Science",
    "Arts & Design",
    "Law",
    "Psychology",
    "Languages",
    "Sciences",
    "Architecture",
    "Education",
    "Social Work",
    "Other",
  ];

  // Mock testimonials
  const testimonials = [
    {
      id: "1",
      studentName: "Maria K.",
      city: "Barcelona",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: "2",
      studentName: "Alex M.",
      city: "Vienna",
      rating: 4,
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=40&h=40&fit=crop&crop=face",
    },
    {
      id: "3",
      studentName: "Lisa T.",
      city: "Prague",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    },
  ];

  return (
    <StepGuard requiredStep={5}>
      <SubmissionGuard>
        <Head>
          <title>Help Future Students - Erasmus Journey Platform</title>
          <meta
            name="description"
            content="Join our mentor community and help future Erasmus students"
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
                    Step 5 of 5
                  </Badge>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Helping Future Erasmus Students
                  </h1>
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {heroSection}

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              <FormErrorSummary
                formError={formError}
                fieldErrors={fieldErrors}
              />

              {/* Main Decision */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Join Our Mentor Community
                  </CardTitle>
                  <p className="text-gray-600">
                    Help future Erasmus students by sharing your experience and
                    providing guidance
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">
                        Do you want to be a point of contact and help other
                        future Erasmus Students?
                      </Label>
                      <RadioGroup
                        id="wantToHelp"
                        name="wantToHelp"
                        value={formData.wantToHelp}
                        onValueChange={(value) =>
                          handleInputChange("wantToHelp", value)
                        }
                        aria-describedby={
                          fieldErrors.wantToHelp
                            ? "wantToHelp-error"
                            : undefined
                        }
                        aria-invalid={Boolean(fieldErrors.wantToHelp)}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="help-yes" />
                          <Label htmlFor="help-yes">
                            Yes, I want to help future students! 🌟
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="help-no" />
                          <Label htmlFor="help-no">No, not at this time</Label>
                        </div>
                      </RadioGroup>
                      {fieldErrors.wantToHelp && (
                        <p className="text-red-500 text-sm mt-1" role="alert">
                          {fieldErrors.wantToHelp}
                        </p>
                      )}
                    </div>

                    {formData.wantToHelp === "no" && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          No problem! You can always change your mind later.
                          Your experience story will still help future students
                          even without direct mentoring.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {formData.wantToHelp === "yes" && (
                <>
                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Contact Information
                      </CardTitle>
                      <p className="text-gray-600">
                        How would you like future students to contact you?
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactMethod">
                          Preferred Contact Method
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            handleInputChange("contactMethod", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your preferred method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="multiple">
                              Multiple Methods
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            aria-labelledby="email-label"
                            aria-describedby={
                              fieldErrors.email ? "email-error" : undefined
                            }
                            aria-invalid={Boolean(fieldErrors.email)}
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                          />
                          {fieldErrors.email && (
                            <p
                              className="text-red-500 text-sm mt-1"
                              role="alert"
                            >
                              {fieldErrors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="instagramUsername"
                            className="flex items-center"
                          >
                            <Instagram className="h-4 w-4 mr-2" />
                            Instagram Username
                          </Label>
                          <Input
                            id="instagramUsername"
                            placeholder="@yourusername"
                            value={formData.instagramUsername}
                            onChange={(e) =>
                              handleInputChange(
                                "instagramUsername",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="facebookLink"
                            className="flex items-center"
                          >
                            <Facebook className="h-4 w-4 mr-2" />
                            Facebook Profile Link
                          </Label>
                          <Input
                            id="facebookLink"
                            placeholder="https://facebook.com/yourprofile"
                            value={formData.facebookLink}
                            onChange={(e) =>
                              handleInputChange("facebookLink", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="linkedinProfile"
                            className="flex items-center"
                          >
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn Profile
                          </Label>
                          <Input
                            id="linkedinProfile"
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={formData.linkedinProfile}
                            onChange={(e) =>
                              handleInputChange(
                                "linkedinProfile",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="personalWebsite"
                          className="flex items-center"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Personal Website (Optional)
                        </Label>
                        <Input
                          id="personalWebsite"
                          placeholder="https://yourwebsite.com"
                          value={formData.personalWebsite}
                          onChange={(e) =>
                            handleInputChange("personalWebsite", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mentor Profile */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Mentor Profile
                      </CardTitle>
                      <p className="text-gray-600">
                        Help students understand how you can help them
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="nickname">
                            Preferred Name/Nickname
                          </Label>
                          <Input
                            id="nickname"
                            placeholder="What should students call you?"
                            value={formData.nickname}
                            onChange={(e) =>
                              handleInputChange("nickname", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="responseTime">
                            Expected Response Time
                          </Label>
                          <Select
                            onValueChange={(value) =>
                              handleInputChange("responseTime", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="How quickly do you respond?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="same-day">Same Day</SelectItem>
                              <SelectItem value="1-2-days">1-2 Days</SelectItem>
                              <SelectItem value="3-5-days">3-5 Days</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Languages You Speak</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {languages.map((language) => (
                            <div
                              key={language}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={language}
                                checked={formData.languagesSpoken.includes(
                                  language,
                                )}
                                onCheckedChange={(checked) =>
                                  handleArrayChange(
                                    "languagesSpoken",
                                    language,
                                    checked as boolean,
                                  )
                                }
                              />
                              <Label htmlFor={language} className="text-sm">
                                {language}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Areas You Can Help With</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {helpTopics.map((topic) => (
                            <div
                              key={topic}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={topic}
                                checked={formData.helpTopics.includes(topic)}
                                onCheckedChange={(checked) =>
                                  handleArrayChange(
                                    "helpTopics",
                                    topic,
                                    checked as boolean,
                                  )
                                }
                              />
                              <Label htmlFor={topic} className="text-sm">
                                {topic}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Academic Specializations</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {specializations.map((spec) => (
                            <div
                              key={spec}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={spec}
                                checked={formData.specializations.includes(
                                  spec,
                                )}
                                onCheckedChange={(checked) =>
                                  handleArrayChange(
                                    "specializations",
                                    spec,
                                    checked as boolean,
                                  )
                                }
                              />
                              <Label htmlFor={spec} className="text-sm">
                                {spec}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {formData.specializations.includes("Other") && (
                          <div className="space-y-2 mt-4">
                            <Label htmlFor="otherSpecialization">
                              Please specify your specialization
                            </Label>
                            <Input
                              id="otherSpecialization"
                              placeholder="Enter your academic specialization..."
                              value={formData.otherSpecialization}
                              onChange={(e) =>
                                handleInputChange(
                                  "otherSpecialization",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="availabilityLevel">
                          Availability Level
                        </Label>
                        <RadioGroup
                          value={formData.availabilityLevel}
                          onValueChange={(value) =>
                            handleInputChange("availabilityLevel", value)
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="high"
                              id="availability-high"
                            />
                            <Label htmlFor="availability-high">
                              High - I love helping and have lots of time
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="medium"
                              id="availability-medium"
                            />
                            <Label htmlFor="availability-medium">
                              Medium - I can help occasionally
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="low" id="availability-low" />
                            <Label htmlFor="availability-low">
                              Low - Only for important questions
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Privacy Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        Privacy & Profile Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium">
                            Create a public mentor profile?
                          </Label>
                          <p className="text-sm text-gray-600 mb-2">
                            This will allow students to find you in our mentor
                            directory
                          </p>
                          <RadioGroup
                            value={formData.publicProfile}
                            onValueChange={(value) =>
                              handleInputChange("publicProfile", value)
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="public-yes" />
                              <Label htmlFor="public-yes">
                                Yes, make my profile public
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="public-no" />
                              <Label htmlFor="public-no">
                                No, only contact through forms
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-base font-medium">
                            Allow students to contact you directly?
                          </Label>
                          <p className="text-sm text-gray-600 mb-2">
                            Students can reach out to you without going through
                            our platform
                          </p>
                          <RadioGroup
                            value={formData.allowPublicContact}
                            onValueChange={(value) =>
                              handleInputChange("allowPublicContact", value)
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="contact-yes" />
                              <Label htmlFor="contact-yes">
                                Yes, I'm open to direct contact
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="contact-no" />
                              <Label htmlFor="contact-no">
                                No, prefer platform messaging only
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Current Mentors Preview */}
              {formData.wantToHelp === "yes" && (
                <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                      Join These Amazing Mentors
                    </CardTitle>
                    <p className="text-gray-600">
                      You'll be joining a community of experienced students who
                      are making a difference
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {testimonials.map((testimonial) => (
                        <div
                          key={testimonial.id}
                          className="bg-white p-4 rounded-lg border"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {testimonial.studentName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {testimonial.studentName}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {testimonial.city}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < testimonial.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            "Ready to help future students with accommodation
                            and city life in {testimonial.city}!"
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Final Call to Action */}
              <Card className="bg-gradient-to-r from-green-800 to-blue-800 text-white">
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {formData.wantToHelp === "yes"
                      ? "You're Almost Ready to Start Helping!"
                      : "Complete Your Erasmus Journey"}
                  </h3>
                  <p className="text-white mb-6 max-w-2xl mx-auto">
                    {formData.wantToHelp === "yes"
                      ? "Thank you for choosing to help future students! Your experience and guidance will be invaluable to students planning their Erasmus journey."
                      : "Thank you for sharing your complete Erasmus experience! Your story will help countless future students make informed decisions."}
                  </p>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-8">
                <Link href="/living-expenses">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Living Expenses
                  </Button>
                </Link>

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraftToDatabase}
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2">⏳</div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Complete Application
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Thank You Section */}
          <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Thank You for Your Journey
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Whether you choose to mentor or not, sharing your experience
                helps build a stronger Erasmus community for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/community">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Explore Community
                  </Button>
                </Link>
                <Link href="/experiences">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Read Other Stories
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </SubmissionGuard>
    </StepGuard>
  );
}
