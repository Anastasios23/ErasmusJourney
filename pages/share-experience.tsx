import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Card, CardContent } from "../src/components/ui/card";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { FormProvider } from "../components/forms/FormProvider";
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
import { buildLoginRedirectUrl } from "../src/lib/authRedirect";

import BasicInformationStep from "../components/forms/steps/BasicInformationStep";
import CourseMatchingStep from "../components/forms/steps/CourseMatchingStep";
import AccommodationStep from "../components/forms/steps/AccommodationStep";
import LivingExpensesStep from "../components/forms/steps/LivingExpensesStep";
import ExperienceStep from "../components/forms/steps/ExperienceStep";

import {
  clampShareExperienceStep,
  getNextAccessibleShareExperienceStep,
} from "../src/lib/shareExperienceStepAccess";
import {
  type ShareExperienceSaveState,
  formatShareExperienceSavedTime,
} from "../src/lib/shareExperienceUi";

const FORM_STEPS = [
  {
    number: 1,
    name: "Basic Information",
    href: "#basic-info",
    description: "Add your exchange details and study context.",
  },
  {
    number: 2,
    name: "Course Matching",
    href: "#course-matching",
    description: "Share course equivalences and recognition outcomes.",
  },
  {
    number: 3,
    name: "Accommodation",
    href: "#accommodation",
    description: "Add the housing details students need first.",
  },
  {
    number: 4,
    name: "Living Expenses",
    href: "#living-expenses",
    description: "Record practical monthly budget and cost guidance.",
  },
  {
    number: 5,
    name: "Final Review",
    href: "#experience",
    description: "Review and submit practical insights for future students.",
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

function getRequestedStep(
  step: string | string[] | undefined,
  asPath: string,
): number | null {
  const parsedFromQuery = parseStepQuery(step);

  if (parsedFromQuery) {
    return parsedFromQuery;
  }

  const search = asPath.split("?")[1];
  if (!search) {
    return null;
  }

  const searchParams = new URLSearchParams(search);
  return parseStepQuery(searchParams.get("step") ?? undefined);
}

export default function ShareExperience() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const {
    completedStepNumbers,
    setCurrentStep,
    markStepCompleted,
    getStepName,
  } = useFormProgress();

  const {
    data: experienceData,
    loading: experienceLoading,
    error: experienceError,
    saveProgress,
    submitExperience,
    refreshData: refreshExperience,
  } = useErasmusExperience();

  const [currentStep, setLocalCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<ShareExperienceSaveState>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentStepMissingRequiredCount, setCurrentStepMissingRequiredCount] =
    useState(0);
  const [formData, setFormData] = useState({
    basicInfo: {},
    courses: [],
    accommodation: createEmptyAccommodationStepData(),
    livingExpenses: createEmptyLivingExpensesStepData(),
    experience: {},
  });
  const formDataRef = useRef(formData);
  const hydratedExperienceIdRef = useRef<string | null>(null);
  const pendingResolvedStepRef = useRef<number | null>(null);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      void router.replace(
        buildLoginRedirectUrl(router.asPath, "/share-experience?step=1"),
      );
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (experienceLoading || !experienceData?.id) {
      return;
    }

    if (hydratedExperienceIdRef.current === experienceData.id) {
      return;
    }

    const requestedStep = getRequestedStep(router.query.step, router.asPath);
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

    const initialStep = clampShareExperienceStep(
      requestedStep ?? experienceData.currentStep ?? 1,
      hydratedFormData,
    );

    pendingResolvedStepRef.current = initialStep;
    setLocalCurrentStep(initialStep);

    if (experienceData.lastSavedAt) {
      const parsedLastSaved = new Date(experienceData.lastSavedAt);

      if (!Number.isNaN(parsedLastSaved.getTime())) {
        setLastSaved(parsedLastSaved);
        setSaveState("saved");
      }
    }
  }, [experienceLoading, experienceData?.id, router.asPath, router.query.step]);

  useEffect(() => {
    if (!router.isReady || experienceLoading) {
      return;
    }

    if (
      experienceData?.id &&
      hydratedExperienceIdRef.current !== experienceData.id
    ) {
      return;
    }

    const requestedStep = getRequestedStep(router.query.step, router.asPath);
    if (!requestedStep) {
      return;
    }

    const allowedStep = clampShareExperienceStep(
      requestedStep,
      formDataRef.current,
    );

    pendingResolvedStepRef.current = allowedStep;

    if (allowedStep !== currentStep) {
      setLocalCurrentStep(allowedStep);
    }
  }, [
    experienceData?.id,
    experienceLoading,
    router.asPath,
    router.isReady,
    router.query.step,
    currentStep,
  ]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (experienceLoading) {
      return;
    }

    if (
      experienceData?.id &&
      hydratedExperienceIdRef.current !== experienceData.id
    ) {
      return;
    }

    if (
      pendingResolvedStepRef.current !== null &&
      currentStep !== pendingResolvedStepRef.current
    ) {
      return;
    }

    if (pendingResolvedStepRef.current === currentStep) {
      pendingResolvedStepRef.current = null;
    }

    const currentQueryStep = getRequestedStep(router.query.step, router.asPath);
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
  }, [
    currentStep,
    experienceData?.id,
    experienceLoading,
    router.asPath,
    router.isReady,
    router.pathname,
    router.query,
    router.replace,
  ]);

  useEffect(() => {
    const stepName = getStepName(currentStep);
    if (stepName) {
      setCurrentStep(stepName);
    }
  }, [currentStep, setCurrentStep, getStepName]);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    setCurrentStepMissingRequiredCount(0);
  }, [currentStep]);

  const persistProgress = useCallback(
    async (payload: Record<string, unknown>) => {
      setSaveState("saving");

      try {
        const success = await saveProgress(payload);

        if (!success) {
          setSaveState("error");
          return false;
        }

        const savedAt = new Date();
        setLastSaved(savedAt);
        setSaveState("saved");
        return true;
      } catch (error) {
        console.error("Save failed:", error);
        setSaveState("error");
        return false;
      }
    },
    [saveProgress],
  );

  const handleFormDataChange = useCallback(
    async (stepDataPatch: any) => {
      const mergedData = {
        ...formDataRef.current,
        ...stepDataPatch,
      };

      formDataRef.current = mergedData;
      setFormData(mergedData);

      await persistProgress(mergedData);
    },
    [persistProgress],
  );

  const handleStepComplete = useCallback(
    async (stepNumber: number, stepData: any) => {
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
              title: "Success",
              description: "Your Erasmus experience has been submitted.",
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

      try {
        const updatedCompletedSteps = [
          ...new Set([...completedStepNumbers, stepNumber]),
        ];

        const success = await persistProgress({
          ...updatedFormData,
          currentStep: Math.min(stepNumber + 1, 5),
          completedSteps: updatedCompletedSteps,
        });

        if (!success) {
          throw new Error("Failed to save progress");
        }

        markStepCompleted(getStepName(stepNumber));

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
      persistProgress,
      submitExperience,
      markStepCompleted,
      getStepName,
    ],
  );

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setLocalCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepNumber: number) => {
    const allowedStep = clampShareExperienceStep(
      stepNumber,
      formDataRef.current,
    );

    if (allowedStep === stepNumber) {
      setLocalCurrentStep(stepNumber);
    }
  }, []);

  const currentStepConfig = FORM_STEPS[currentStep - 1];
  const nextAccessibleStep = getNextAccessibleShareExperienceStep(formData);
  const progressSteps = FORM_STEPS.map((step) => {
    const isLocked = step.number > nextAccessibleStep;

    return {
      ...step,
      isClickable: step.number <= nextAccessibleStep,
      isLocked,
      lockedReason: isLocked
        ? `Complete ${FORM_STEPS[nextAccessibleStep - 1].name} first.`
        : undefined,
    };
  });

  const progressPercentage =
    ((currentStep - 1) / (FORM_STEPS.length - 1)) * 100;
  const savedTimeLabel = formatShareExperienceSavedTime(lastSaved);

  const draftStatus = useMemo(() => {
    if (saveState === "saving") {
      return {
        label: "Saving...",
        icon: "solar:refresh-linear",
        iconClass: "h-4 w-4 animate-spin text-amber-600",
        dotClass: "bg-amber-500",
      };
    }

    if (saveState === "error") {
      return {
        label: "Save failed",
        icon: "solar:danger-circle-linear",
        iconClass: "h-4 w-4 text-red-600",
        dotClass: "bg-red-500",
      };
    }

    return {
      label: "Saved",
      icon: "solar:check-circle-linear",
      iconClass: "h-4 w-4 text-emerald-600",
      dotClass: "bg-emerald-500",
    };
  }, [saveState]);

  if (sessionStatus === "loading" || experienceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Icon
            icon="solar:refresh-circle-bold-duotone"
            className="h-8 w-8 animate-spin text-gray-700"
          />
          <p className="text-gray-600">Loading your draft...</p>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return null;
  }

  if (experienceError && !experienceData) {
    return (
      <>
        <Head>
          <title>Share your Erasmus experience | Erasmus Journey</title>
          <meta
            name="description"
            content="Share practical information from your Erasmus experience."
          />
        </Head>

        <Header />

        <main className="min-h-screen bg-gray-50 py-8">
          <div className="mx-auto max-w-3xl px-4">
            <Alert variant="destructive" className="mb-5">
              <Icon
                icon="solar:danger-triangle-bold-duotone"
                className="h-4 w-4"
              />
              <AlertDescription>{experienceError}</AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void refreshExperience()}>Retry</Button>
              <Button
                variant="outline"
                onClick={() => void router.push("/dashboard")}
              >
                Back to dashboard
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const renderStepContent = () => {
    const stepProps = {
      data: formData,
      onComplete: (data: any) => handleStepComplete(currentStep, data),
      onSave: handleFormDataChange,
      onPrevious: handlePreviousStep,
      saveState,
      onRequiredCountChange: setCurrentStepMissingRequiredCount,
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
        return (
          <ExperienceStep
            {...stepProps}
            isSubmitting={isSubmitting}
            onGoToStep={handleStepClick}
          />
        );
      default:
        return <BasicInformationStep {...stepProps} />;
    }
  };

  return (
    <>
      <Head>
        <title>Share your Erasmus experience | Erasmus Journey</title>
        <meta
          name="description"
          content="Share practical information from your Erasmus experience."
        />
      </Head>

      <Header />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          {(submitError || experienceError) && (
            <Alert variant="destructive" className="mb-5">
              <Icon
                icon="solar:danger-triangle-bold-duotone"
                className="h-4 w-4"
              />
              <AlertDescription>
                {submitError || experienceError}
              </AlertDescription>
            </Alert>
          )}

          <section className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-950 sm:text-3xl">
              Share your Erasmus experience
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Help future students with practical destination, housing, and
              course information.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Your draft saves automatically while you work. Takes about 10-15
              minutes.
            </p>
          </section>

          <section className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Step {currentStep} of {FORM_STEPS.length}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {currentStepConfig.name}
                </p>
                {currentStepMissingRequiredCount > 0 ? (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {currentStepMissingRequiredCount} required{" "}
                    {currentStepMissingRequiredCount === 1 ? "field" : "fields"}{" "}
                    left
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span
                  className={cn("h-2 w-2 rounded-full", draftStatus.dotClass)}
                />
                <Icon
                  icon={draftStatus.icon}
                  className={draftStatus.iconClass}
                />
                <span className="font-medium">{draftStatus.label}</span>
                {saveState !== "saving" &&
                saveState !== "error" &&
                savedTimeLabel ? (
                  <span className="text-gray-500">
                    Saved at {savedTimeLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <div className="h-1.5 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gray-900 transition-all duration-200"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {progressSteps.map((step) => {
                const isCompleted = completedStepNumbers.includes(step.number);
                const isCurrent = currentStep === step.number;
                const isLocked = Boolean(step.isLocked);
                const isClickable = Boolean(step.isClickable);

                return (
                  <button
                    key={step.number}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => {
                      if (isClickable) {
                        handleStepClick(step.number);
                      }
                    }}
                    className={cn(
                      "rounded-md border px-2 py-2 text-left text-xs transition-colors",
                      isCurrent
                        ? "border-gray-900 bg-gray-100 text-gray-900"
                        : isCompleted
                          ? "border-gray-300 bg-white text-gray-800"
                          : isLocked
                            ? "border-gray-200 bg-gray-50 text-gray-400"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100",
                      !isClickable && "cursor-not-allowed",
                    )}
                  >
                    <span className="mb-1 flex items-center gap-1">
                      {isCompleted ? (
                        <Icon
                          icon="solar:check-circle-linear"
                          className="h-3.5 w-3.5"
                        />
                      ) : isLocked ? (
                        <Icon
                          icon="solar:lock-keyhole-linear"
                          className="h-3.5 w-3.5"
                        />
                      ) : (
                        <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[10px] font-semibold">
                          {step.number}
                        </span>
                      )}
                      <span className="font-medium">Step {step.number}</span>
                    </span>
                    <span className="block truncate">{step.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <FormProvider
            formData={formData}
            onSave={handleFormDataChange}
            currentStep={currentStep}
          >
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {currentStepConfig.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {currentStepConfig.description}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </FormProvider>
        </div>
      </main>
    </>
  );
}
