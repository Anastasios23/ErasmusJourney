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
} from "../src/components/ui/form-components";
import { RadioGroup, RadioGroupItem } from "../src/components/ui/radio-group";
import { Checkbox } from "../src/components/ui/checkbox";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroSection } from "@/components/ui/hero-section";
import Header from "../components/Header";
import { SubmissionGuard } from "../components/SubmissionGuard";
import { cn } from "../src/lib/utils";

export default function HelpFutureStudents() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [sessionStatus, router]);

  const {
    data: experienceData,
    saveProgress,
    submitExperience,
    error: experienceError,
  } = useErasmusExperience();

  const {
    setCurrentStep,
    markStepCompleted,
    currentStepNumber,
    completedStepNumbers,
  } = useFormProgress();

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
    languagesSpoken: [] as string[],
    helpTopics: [] as string[],
    availabilityLevel: "",
    mentorshipExperience: "",
    additionalAdvice: "",
    publicProfile: "",
    allowPublicContact: "",
    responseTime: "",
    specializations: [] as string[],
    otherSpecialization: "",
    funFact: "",
    nickname: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load experience data when component mounts
  useEffect(() => {
    if (experienceData?.experience?.helpForStudents) {
      const helpData = experienceData.experience.helpForStudents;
      setFormData((prev) => ({
        ...prev,
        ...helpData,
        wantToHelp:
          helpData.wantToHelp === true
            ? "yes"
            : helpData.wantToHelp === false
              ? "no"
              : "",
      }));
    }
  }, [experienceData]);

  useEffect(() => {
    setCurrentStep("help-future-students");
  }, [setCurrentStep]);

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

  // Save to localStorage helper function
  const saveToLocalStorage = useCallback(() => {
    const draftKey = `erasmus_form_help-future-students`;
    const draftData = {
      type: "help-future-students",
      title: "Help Future Students Draft",
      data: formData,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
  }, [formData]);

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasData = Object.values(formData).some(
        (v) => v !== "" && v !== null,
      );
      if (hasData) {
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
      await saveProgress({
        experience: {
          helpForStudents: {
            ...formData,
            wantToHelp: formData.wantToHelp === "yes",
          },
        },
      });
      toast({
        title: "Draft Saved",
        description: "Your mentorship preferences have been saved.",
      });
    } catch (error) {
      console.error("Draft save error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save draft.",
      });
    }
  }, [formData, saveProgress]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    // Validation
    if (!formData.wantToHelp) {
      setFieldErrors({ wantToHelp: "Please indicate if you want to help." });
      setIsSubmitting(false);
      return;
    }

    saveToLocalStorage();

    try {
      // Final submission payload
      const submissionData: any = {
        ...experienceData,
        experience: {
          ...(experienceData?.experience || {}),
          helpForStudents: {
            ...formData,
            wantToHelp: formData.wantToHelp === "yes",
          },
        },
      };

      const ok = await submitExperience(submissionData);

      if (!ok)
        throw new Error(experienceError || "Failed to submit experience");

      // Clear all drafts
      [
        "basic-information",
        "course-matching",
        "accommodation",
        "living-expenses",
        "help-future-students",
      ].forEach((step) => {
        localStorage.removeItem(`erasmus_form_${step}`);
      });

      router.push("/submission-confirmation");
    } catch (error) {
      console.error("Final submission failed:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit experience",
      );
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
    "Other",
  ];
  const helpTopics = [
    "Accommodation",
    "University Apps",
    "Visa",
    "Courses",
    "Budgeting",
    "Social Life",
  ];

  return (
    <StepGuard requiredStep={5}>
      <SubmissionGuard>
        <Head>
          <title>Help Future Students - Erasmus Journey Platform</title>
        </Head>

        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <Header />

          <HeroSection
            badge="Step 5 of 5"
            badgeIcon="solar:heart-linear"
            title="Become a Mentor"
            description="Your experience is invaluable. Join our community of student mentors and help future travelers navigate their Erasmus journey."
            gradient="indigo"
            size="sm"
          />

          <div className="pb-16 px-4">
            <div className="max-w-4xl mx-auto -mt-8 relative z-20">
              {/* Progress Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 mb-8">
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

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Main Decision */}
                <FormSection
                  variant="indigo"
                  title="Join the Community"
                  subtitle="Would you like to be a point of contact for future students?"
                  icon="solar:users-group-rounded-linear"
                >
                  <FormField
                    label="Mentorship Interest"
                    required
                    error={fieldErrors.wantToHelp}
                  >
                    <RadioGroup
                      value={formData.wantToHelp}
                      onValueChange={(v) => handleInputChange("wantToHelp", v)}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                    >
                      {[
                        {
                          id: "yes",
                          label: "Yes, I want to help! ���",
                          icon: "solar:heart-angle-linear",
                          color: "text-red-500",
                        },
                        {
                          id: "no",
                          label: "No, not at this time",
                          icon: "solar:clock-circle-linear",
                          color: "text-slate-400",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          className={cn(
                            "relative flex flex-col p-6 rounded-3xl border transition-all duration-200 cursor-pointer group",
                            formData.wantToHelp === opt.id
                              ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800"
                              : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-indigo-100",
                          )}
                          onClick={() =>
                            handleInputChange("wantToHelp", opt.id)
                          }
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={cn(
                                "p-3 rounded-2xl",
                                formData.wantToHelp === opt.id
                                  ? "bg-indigo-100"
                                  : "bg-slate-50",
                              )}
                            >
                              <Icon
                                icon={opt.icon}
                                className={cn(
                                  "w-6 h-6",
                                  formData.wantToHelp === opt.id
                                    ? "text-indigo-600"
                                    : opt.color,
                                )}
                              />
                            </div>
                            <RadioGroupItem value={opt.id} id={opt.id} />
                          </div>
                          <Label
                            htmlFor={opt.id}
                            className="font-black text-lg text-slate-900 dark:text-white cursor-pointer"
                          >
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormField>
                </FormSection>

                <AnimatePresence>
                  {formData.wantToHelp === "yes" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-8 overflow-hidden"
                    >
                      {/* Contact Details */}
                      <FormSection
                        variant="indigo"
                        title="Contact Information"
                        subtitle="How should students reach out to you?"
                        icon="solar:letter-linear"
                      >
                        <FormGrid columns={2}>
                          <FormField label="Preferred Method">
                            <EnhancedSelect
                              value={formData.contactMethod}
                              onValueChange={(v) =>
                                handleInputChange("contactMethod", v)
                              }
                            >
                              <EnhancedSelectTrigger>
                                <EnhancedSelectValue placeholder="Select method" />
                              </EnhancedSelectTrigger>
                              <EnhancedSelectContent>
                                <EnhancedSelectItem value="email">
                                  Email
                                </EnhancedSelectItem>
                                <EnhancedSelectItem value="instagram">
                                  Instagram
                                </EnhancedSelectItem>
                                <EnhancedSelectItem value="linkedin">
                                  LinkedIn
                                </EnhancedSelectItem>
                              </EnhancedSelectContent>
                            </EnhancedSelect>
                          </FormField>
                          <FormField label="Email Address">
                            <EnhancedInput
                              type="email"
                              placeholder="your@email.com"
                              value={formData.email}
                              onChange={(e) =>
                                handleInputChange("email", e.target.value)
                              }
                            />
                          </FormField>
                          <FormField label="Instagram">
                            <EnhancedInput
                              placeholder="@username"
                              value={formData.instagramUsername}
                              onChange={(e) =>
                                handleInputChange(
                                  "instagramUsername",
                                  e.target.value,
                                )
                              }
                            />
                          </FormField>
                          <FormField label="LinkedIn Profile">
                            <EnhancedInput
                              placeholder="linkedin.com/in/..."
                              value={formData.linkedinProfile}
                              onChange={(e) =>
                                handleInputChange(
                                  "linkedinProfile",
                                  e.target.value,
                                )
                              }
                            />
                          </FormField>
                        </FormGrid>
                      </FormSection>

                      {/* Mentor Profile */}
                      <FormSection
                        variant="indigo"
                        title="Mentor Profile"
                        subtitle="Tell us more about your background"
                        icon="solar:user-id-linear"
                      >
                        <FormGrid columns={2}>
                          <FormField label="Nickname / Preferred Name">
                            <EnhancedInput
                              placeholder="What should we call you?"
                              value={formData.nickname}
                              onChange={(e) =>
                                handleInputChange("nickname", e.target.value)
                              }
                            />
                          </FormField>
                          <FormField label="Response Time">
                            <EnhancedSelect
                              value={formData.responseTime}
                              onValueChange={(v) =>
                                handleInputChange("responseTime", v)
                              }
                            >
                              <EnhancedSelectTrigger>
                                <EnhancedSelectValue placeholder="How fast do you reply?" />
                              </EnhancedSelectTrigger>
                              <EnhancedSelectContent>
                                <EnhancedSelectItem value="same-day">
                                  Same Day
                                </EnhancedSelectItem>
                                <EnhancedSelectItem value="1-2-days">
                                  1-2 Days
                                </EnhancedSelectItem>
                                <EnhancedSelectItem value="weekly">
                                  Weekly
                                </EnhancedSelectItem>
                              </EnhancedSelectContent>
                            </EnhancedSelect>
                          </FormField>
                        </FormGrid>

                        <div className="grid md:grid-cols-2 gap-8 mt-6">
                          <FormField label="Languages You Speak">
                            <div className="grid grid-cols-2 gap-2">
                              {languages.map((lang) => (
                                <div
                                  key={lang}
                                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                                >
                                  <Checkbox
                                    id={lang}
                                    checked={formData.languagesSpoken.includes(
                                      lang,
                                    )}
                                    onCheckedChange={(c) =>
                                      handleArrayChange(
                                        "languagesSpoken",
                                        lang,
                                        c as boolean,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={lang}
                                    className="text-xs font-bold"
                                  >
                                    {lang}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </FormField>
                          <FormField label="Help Topics">
                            <div className="grid grid-cols-2 gap-2">
                              {helpTopics.map((topic) => (
                                <div
                                  key={topic}
                                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                                >
                                  <Checkbox
                                    id={topic}
                                    checked={formData.helpTopics.includes(
                                      topic,
                                    )}
                                    onCheckedChange={(c) =>
                                      handleArrayChange(
                                        "helpTopics",
                                        topic,
                                        c as boolean,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={topic}
                                    className="text-xs font-bold"
                                  >
                                    {topic}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </FormField>
                        </div>
                      </FormSection>

                      {/* Privacy */}
                      <FormSection
                        variant="indigo"
                        title="Privacy Settings"
                        subtitle="Control your visibility"
                        icon="solar:shield-keyhole-linear"
                      >
                        <FormGrid columns={2}>
                          <FormField label="Public Profile?">
                            <RadioGroup
                              value={formData.publicProfile}
                              onValueChange={(v) =>
                                handleInputChange("publicProfile", v)
                              }
                              className="flex gap-4 mt-2"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="yes" id="pub-y" />
                                <Label htmlFor="pub-y">Yes</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="no" id="pub-n" />
                                <Label htmlFor="pub-n">No</Label>
                              </div>
                            </RadioGroup>
                          </FormField>
                          <FormField label="Direct Contact?">
                            <RadioGroup
                              value={formData.allowPublicContact}
                              onValueChange={(v) =>
                                handleInputChange("allowPublicContact", v)
                              }
                              className="flex gap-4 mt-2"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="yes" id="con-y" />
                                <Label htmlFor="con-y">Yes</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <RadioGroupItem value="no" id="con-n" />
                                <Label htmlFor="con-n">No</Label>
                              </div>
                            </RadioGroup>
                          </FormField>
                        </FormGrid>
                      </FormSection>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Final Advice */}
                <FormSection
                  variant="indigo"
                  title="Final Words"
                  subtitle="Any last advice for future Erasmus students?"
                  icon="solar:chat-round-dots-linear"
                >
                  <FormField label="Additional Advice">
                    <EnhancedTextarea
                      placeholder="Share anything else that might be helpful..."
                      value={formData.additionalAdvice}
                      onChange={(e) =>
                        handleInputChange("additionalAdvice", e.target.value)
                      }
                      className="min-h-[150px]"
                    />
                  </FormField>
                </FormSection>

                {/* Navigation */}
                <div className="pt-8">
                  <StepNavigation
                    currentStep={currentStepNumber}
                    totalSteps={5}
                    onPrevious={() => router.push("/living-expenses")}
                    onNext={handleSubmit}
                    onSaveDraft={handleSaveDraftToDatabase}
                    canProceed={!isSubmitting}
                    isLastStep={true}
                    isSubmitting={isSubmitting}
                    showPrevious={true}
                    showSaveDraft={true}
                  />
                </div>

                {/* Auto-save indicator */}
                <div className="fixed top-24 right-6 z-50">
                  <AnimatePresence>
                    {showSavedIndicator && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center bg-indigo-500/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-medium shadow-2xl border border-indigo-400/50"
                      >
                        <Icon
                          icon="solar:check-circle-linear"
                          className="w-4 h-4 mr-2"
                        />
                        Changes saved
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {submitError && (
                  <Alert
                    variant="destructive"
                    className="mt-4 rounded-2xl border-red-100 bg-red-50 dark:bg-red-900/20"
                  >
                    <Icon
                      icon="solar:danger-circle-linear"
                      className="w-5 h-5"
                    />
                    <AlertDescription className="font-medium">
                      {submitError}
                    </AlertDescription>
                  </Alert>
                )}
              </motion.form>
            </div>
          </div>
        </div>
      </SubmissionGuard>
    </StepGuard>
  );
}
