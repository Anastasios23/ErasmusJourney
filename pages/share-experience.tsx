import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Header from "../components/Header";
import { HeroSection } from "@/components/ui/hero-section";
import { Button } from "../src/components/ui/button";
import { Card, CardContent } from "../src/components/ui/card";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { FormProvider } from "../components/forms/FormProvider";
import { FormProgressBar } from "../components/forms/FormProgressBar";
import { StepNavigation } from "../components/forms/StepNavigation";
import { useErasmusExperience } from "../src/hooks/useErasmusExperience";
import { useFormProgress } from "../src/context/FormProgressContext";
import {
  createEmptyAccommodationStepData,
  sanitizeAccommodationStepData,
} from "../src/lib/accommodation";
import {
  createEmptyLivingExpensesStepData,
  sanitizeLivingExpensesStepData,
} from "../src/lib/livingExpenses";
import { toast } from "../src/hooks/use-toast";
import { cn } from "../src/lib/utils";

// Import step components
import BasicInformationStep from "../components/forms/steps/BasicInformationStep";
import CourseMatchingStep from "../components/forms/steps/CourseMatchingStep";
import AccommodationStep from "../components/forms/steps/AccommodationStep";
import LivingExpensesStep from "../components/forms/steps/LivingExpensesStep";
import ExperienceStep from "../components/forms/steps/ExperienceStep";

// Import validation schemas and helpers
import {
  validateStep,
  getStepSchema,
  basicInformationStepSchema,
  courseMatchingStepSchema,
  accommodationStepSchema,
  livingExpensesStepSchema,
  experienceStepSchema,
} from "../src/lib/schemas";

const FORM_STEPS = [
  {
    number: 1,
    name: "Basic Information",
    href: "#basic-info",
    icon: "solar:user-circle-linear",
    description: "Your academic and exchange details",
    estimatedTime: "5 min",
  },
  {
    number: 2,
    name: "Course Matching",
    href: "#course-matching",
    icon: "solar:notebook-linear",
    description: "Academic courses and equivalences",
    estimatedTime: "10 min",
  },
  {
    number: 3,
    name: "Accommodation",
    href: "#accommodation",
    icon: "solar:home-2-linear",
    description: "Housing details and recommendations",
    estimatedTime: "8 min",
  },
  {
    number: 4,
    name: "Living Expenses",
    href: "#living-expenses",
    icon: "solar:wallet-linear",
    description: "Budget and cost information",
    estimatedTime: "7 min",
  },
  {
    number: 5,
    name: "Share Experience",
    href: "#experience",
    icon: "solar:heart-linear",
    description: "Help future Erasmus students",
    estimatedTime: "15 min",
  },
];

function parseStepQuery(step: string | string[] | undefined): number | null {
  if (typeof step !== "string") {
    return null;
  }

  const parsed = Number(step);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > FORM_STEPS.length) {
    return null;
  }

  return parsed;
}

export default function ShareExperience() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  // Form progress context
  const {
    currentStepNumber,
    completedStepNumbers,
    setCurrentStep,
    markStepCompleted,
    getStepName,
  } = useFormProgress();

  // Experience hook for data persistence
  const {
    data: experienceData,
    loading: experienceLoading,
    error: experienceError,
    saveProgress,
    submitExperience,
    refreshData: refreshExperience,
  } = useErasmusExperience();

  // Local state
  const [currentStep, setLocalCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [formData, setFormData] = useState({
    basicInfo: {},
    courses: [],
    accommodation: createEmptyAccommodationStepData(),
    livingExpenses: createEmptyLivingExpensesStepData(),
    experience: {},
  });
  const formDataRef = useRef(formData);
  const hydratedExperienceIdRef = useRef<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [sessionStatus, router]);

  // Load saved experience data
  useEffect(() => {
    if (experienceLoading || !experienceData?.id) {
      return;
    }

    if (hydratedExperienceIdRef.current === experienceData.id) {
      return;
    }

    const requestedStep = parseStepQuery(router.query.step);
    const hydratedFormData = {
      basicInfo: experienceData.basicInfo || {},
      courses: experienceData.courses || [],
      accommodation: sanitizeAccommodationStepData(
        experienceData.accommodation,
      ),
      livingExpenses: sanitizeLivingExpensesStepData(
        experienceData.livingExpenses,
      ),
      experience: experienceData.experience || {},
    };

    hydratedExperienceIdRef.current = experienceData.id;
    formDataRef.current = hydratedFormData;
    setFormData(hydratedFormData);

    // Respect direct step links from the dashboard when present.
    if (requestedStep) {
      setLocalCurrentStep(requestedStep);
    } else if (experienceData.currentStep) {
      setLocalCurrentStep(experienceData.currentStep);
    }
  }, [experienceLoading, experienceData?.id, router.query.step]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const requestedStep = parseStepQuery(router.query.step);
    if (requestedStep && requestedStep !== currentStep) {
      setLocalCurrentStep(requestedStep);
    }
  }, [router.isReady, router.query.step]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const currentQueryStep = parseStepQuery(router.query.step);
    if (currentQueryStep === currentStep) {
      return;
    }

    void router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, step: String(currentStep) },
      },
      undefined,
      { shallow: true },
    );
  }, [currentStep, router.isReady, router.pathname, router.query, router.replace]);

  // Sync local step with context
  useEffect(() => {
    const stepName = getStepName(currentStep);
    if (stepName) {
      setCurrentStep(stepName);
    }
  }, [currentStep, setCurrentStep, getStepName]);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Handle form data changes
  const handleFormDataChange = useCallback(
    async (stepDataPatch: any) => {
      const mergedData = {
        ...formDataRef.current,
        ...stepDataPatch,
      };

      formDataRef.current = mergedData;
      setFormData(mergedData);

      // Auto-save
      try {
        const success = await saveProgress(mergedData);
        if (success) {
          setLastSaved(new Date());
          setShowSavedIndicator(true);
          setTimeout(() => setShowSavedIndicator(false), 2000);
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    },
    [saveProgress],
  );

  // Handle step completion
  const handleStepComplete = useCallback(
    async (stepNumber: number, stepData: any) => {
      // Merge step data
      const updatedFormData = { ...formDataRef.current, ...stepData };
      formDataRef.current = updatedFormData;
      setFormData(updatedFormData);

      if (stepNumber === 5) {
        if (isSubmitting) {
          return;
        }

        try {
          setIsSubmitting(true);
          setSubmitError(null);

          const success = await submitExperience(updatedFormData);

          if (success) {
            toast({
              title: "Success!",
              description:
                "Your Erasmus experience has been submitted successfully.",
            });
          } else {
            throw new Error("Submission failed");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to submit experience";

          setSubmitError(errorMessage);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }

        return;
      }

      // Save progress with step completion
      try {
        const updatedCompletedSteps = [
          ...new Set([...completedStepNumbers, stepNumber]),
        ];

        await saveProgress({
          ...updatedFormData,
          currentStep: Math.min(stepNumber + 1, 5),
          completedSteps: updatedCompletedSteps,
        });

        // Mark step as completed in context
        markStepCompleted(getStepName(stepNumber));

        // Move to next step
        if (stepNumber < 5) {
          setLocalCurrentStep(stepNumber + 1);
        }

        toast({
          title: "Progress saved",
          description: `Step ${stepNumber} completed successfully.`,
        });
      } catch (error) {
        console.error("Error saving step completion:", error);
        toast({
          title: "Error",
          description: "Failed to save progress. Please try again.",
          variant: "destructive",
        });
      }
    },
    [
      isSubmitting,
      completedStepNumbers,
      saveProgress,
      submitExperience,
      markStepCompleted,
      getStepName,
    ],
  );

  // Handle save draft
  const handleSaveDraft = useCallback(async () => {
    try {
      await saveProgress({
        ...formDataRef.current,
        currentStep,
      });

      setLastSaved(new Date());
      setShowSavedIndicator(true);
      setTimeout(() => setShowSavedIndicator(false), 2000);

      toast({
        title: "Draft saved",
        description: "Your progress has been saved.",
      });
    } catch (error) {
      console.error("Save draft failed:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentStep, saveProgress]);

  // Handle previous step
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setLocalCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Navigate to specific step
  const handleStepClick = useCallback(
    (stepNumber: number) => {
      // Only allow navigation to completed steps or the next step
      if (
        completedStepNumbers.includes(stepNumber) ||
        stepNumber === 1 ||
        completedStepNumbers.includes(stepNumber - 1)
      ) {
        setLocalCurrentStep(stepNumber);
      }
    },
    [completedStepNumbers],
  );

  // Loading state
  if (sessionStatus === "loading" || experienceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        <div className="flex flex-col items-center gap-4">
          <Icon
            icon="solar:refresh-circle-bold-duotone"
            className="h-8 w-8 animate-spin text-blue-600"
          />
          <p className="text-slate-600 dark:text-slate-400">
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (sessionStatus === "unauthenticated") {
    return null; // Will redirect
  }

  if (experienceError && !experienceData) {
    return (
      <>
        <Head>
          <title>Share Your Erasmus Experience | Erasmus Journey</title>
          <meta
            name="description"
            content="Share your Erasmus experience to help future students"
          />
        </Head>

        <Header />

        <HeroSection
          title="Share Your Experience"
          subtitle="Help future Erasmus students by sharing your journey"
          icon="solar:document-add-linear"
          size="sm"
        />

        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 py-8">
          <div className="container max-w-3xl mx-auto px-4">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <Alert variant="destructive" className="mb-6">
                  <Icon
                    icon="solar:danger-triangle-bold-duotone"
                    className="h-4 w-4"
                  />
                  <AlertDescription>{experienceError}</AlertDescription>
                </Alert>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => void refreshExperience()}>
                    Retry connection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void router.push("/dashboard")}
                  >
                    Back to dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  // Render step content
  const renderStepContent = () => {
    const stepProps = {
      data: formData,
      onComplete: (data: any) => handleStepComplete(currentStep, data),
      onSave: handleFormDataChange,
      isSubmitting,
    };

    switch (currentStep) {
      case 1:
        return <BasicInformationStep {...stepProps} />;
      case 2:
        return <CourseMatchingStep {...stepProps} />;
      case 3:
        return <AccommodationStep {...stepProps} />;
      case 4:
        return <LivingExpensesStep {...stepProps} />;
      case 5:
        return <ExperienceStep {...stepProps} />;
      default:
        return <BasicInformationStep {...stepProps} />;
    }
  };

  return (
    <>
      <Head>
        <title>Share Your Erasmus Experience | Erasmus Journey</title>
        <meta
          name="description"
          content="Share your Erasmus experience to help future students"
        />
      </Head>

      <Header />

      {/* Hero Section */}
      <HeroSection
        title="Share Your Experience"
        subtitle="Help future Erasmus students by sharing your journey"
        icon="solar:document-add-linear"
        size="sm"
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 py-8">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Error Alert */}
          {(submitError || experienceError) && (
            <Alert variant="destructive" className="mb-6">
              <Icon
                icon="solar:danger-triangle-bold-duotone"
                className="h-4 w-4"
              />
              <AlertDescription>
                {submitError || experienceError}
              </AlertDescription>
            </Alert>
          )}

          {/* Save Indicator */}
          <AnimatePresence>
            {showSavedIndicator && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 right-4 z-50"
              >
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg shadow-lg">
                  <Icon
                    icon="solar:check-circle-bold-duotone"
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Saved</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Bar */}
          <FormProgressBar
            steps={FORM_STEPS}
            currentStep={currentStep}
            completedSteps={completedStepNumbers}
          />

          {/* Main Form Content */}
          <FormProvider
            formData={formData}
            onSave={handleFormDataChange}
            currentStep={currentStep}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                {/* Step Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        currentStep === 1
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                          : currentStep === 2
                            ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                            : currentStep === 3
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600"
                              : currentStep === 4
                                ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                                : "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
                      )}
                    >
                      <Icon
                        icon={FORM_STEPS[currentStep - 1].icon}
                        className="h-5 w-5"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {FORM_STEPS[currentStep - 1].name}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {FORM_STEPS[currentStep - 1].description}
                      </p>
                    </div>
                    <div className="ml-auto text-sm text-slate-400 dark:text-slate-500">
                      Est. {FORM_STEPS[currentStep - 1].estimatedTime}
                    </div>
                  </div>
                </div>

                {/* Step Content with Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <StepNavigation
                  currentStep={currentStep}
                  totalSteps={5}
                  onPrevious={handlePreviousStep}
                  onSaveDraft={handleSaveDraft}
                  isLastStep={currentStep === 5}
                  isSubmitting={isSubmitting}
                  showPrevious={currentStep > 1}
                  showSaveDraft={false}
                />
              </CardContent>
            </Card>
          </FormProvider>

          {/* Last Saved Indicator */}
          {lastSaved && (
            <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
