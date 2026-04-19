import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Icon } from "@iconify/react";
import Header from "../components/Header";
import { Button } from "../src/components/ui/button";
import { Card, CardContent } from "../src/components/ui/card";
import { Alert, AlertDescription } from "../src/components/ui/alert";
import { Skeleton } from "../src/components/ui/skeleton";
import { FormProvider } from "../components/forms/FormProvider";
import { FormProgressBar } from "../components/forms/FormProgressBar";
import { useErasmusExperience } from "../src/hooks/useErasmusExperience";
import { useFormProgress } from "../src/context/FormProgressContext";
import {
  type AccommodationStepData,
  createEmptyAccommodationStepData,
  sanitizeAccommodationStepData,
} from "../src/lib/accommodation";
import {
  type BasicInformationData,
  sanitizeBasicInformationData,
} from "../src/lib/basicInformation";
import {
  type CourseMappingData,
  sanitizeCourseMappingsData,
} from "../src/lib/courseMatching";
import {
  type LivingExpensesStepData,
  createEmptyLivingExpensesStepData,
  sanitizeLivingExpensesStepData,
} from "../src/lib/livingExpenses";
import type { ExperienceStepData } from "../src/lib/schemas";
import { toast } from "../src/hooks/use-toast";
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
  getStudentLockedExperienceMessage,
  isStudentLockedExperienceStatus,
} from "../src/lib/experienceWorkflow";
import {
  type ShareExperienceSaveState,
} from "../src/lib/shareExperienceUi";

const FORM_STEPS = [
  {
    number: 1,
    name: "Basics",
    href: "#basic-info",
  },
  {
    number: 2,
    name: "Courses",
    href: "#course-matching",
  },
  {
    number: 3,
    name: "Housing",
    href: "#accommodation",
  },
  {
    number: 4,
    name: "Budget",
    href: "#living-expenses",
  },
  {
    number: 5,
    name: "Submit",
    href: "#experience",
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

function buildStepRoute(pathname: string, asPath: string, step: number) {
  const search = asPath.split("?")[1]?.split("#")[0];
  const searchParams = new URLSearchParams(search);
  searchParams.set("step", String(step));

  return {
    pathname,
    query: Object.fromEntries(searchParams.entries()),
  };
}

function toExperienceStepDraft(value: unknown): Partial<ExperienceStepData> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Partial<ExperienceStepData>;
}

type ShareExperienceFormData = {
  basicInfo: BasicInformationData;
  courses: CourseMappingData[];
  accommodation: AccommodationStepData;
  livingExpenses: LivingExpensesStepData;
  experience: Partial<ExperienceStepData>;
};

type ShareExperienceFormDataPatch = Partial<ShareExperienceFormData>;

type ShareExperiencePersistPayload = ShareExperienceFormDataPatch & {
  currentStep?: number;
  completedSteps?: number[];
};

function ShareExperienceLoadingSkeleton() {
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
          <section className="mb-6 space-y-2">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </section>

          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {FORM_STEPS.map((step) => (
                <div
                  key={step.number}
                  className="rounded-md border border-gray-200 bg-white px-3 py-3"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="space-y-6 p-5 sm:p-6">
              <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-96 max-w-full" />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-24 w-full" />
              </div>

              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-36" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

export default function ShareExperience() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const currentQueryStep = router.query.step;

  const {
    completedStepNumbers,
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
  const [submissionSucceeded, setSubmissionSucceeded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<ShareExperienceSaveState>("idle");
  const [, setCurrentStepMissingRequiredCount] = useState(0);
  const [formData, setFormData] = useState<ShareExperienceFormData>({
    basicInfo: sanitizeBasicInformationData(),
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

    const requestedStep = getRequestedStep(currentQueryStep, router.asPath);
    const hydratedFormData = {
      basicInfo: sanitizeBasicInformationData(experienceData.basicInfo),
      courses: sanitizeCourseMappingsData(experienceData.courses),
      accommodation: sanitizeAccommodationStepData(
        experienceData.accommodation,
      ),
      livingExpenses: sanitizeLivingExpensesStepData(
        experienceData.livingExpenses,
      ),
      experience: toExperienceStepDraft(experienceData.experience),
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
      setSaveState("saved");
    }
  }, [currentQueryStep, experienceLoading, experienceData, router.asPath]);

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

    const requestedStep = getRequestedStep(currentQueryStep, router.asPath);
    if (!requestedStep) {
      return;
    }

    // Only react to query changes here. Including currentStep causes local
    // step advances to be pulled back to the stale query step before the URL
    // update completes.
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
    currentQueryStep,
    router.asPath,
    router.isReady,
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

    const requestedStep = getRequestedStep(currentQueryStep, router.asPath);
    if (requestedStep === currentStep) {
      return;
    }

    void router.replace(
      buildStepRoute(router.pathname, router.asPath, currentStep),
      undefined,
      { shallow: true },
    );
  }, [
    currentStep,
    currentQueryStep,
    experienceData?.id,
    experienceLoading,
    router.asPath,
    router.isReady,
    router.pathname,
    router.replace,
  ]);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    setCurrentStepMissingRequiredCount(0);
  }, [currentStep]);

  const persistProgress = useCallback(
    async (payload: ShareExperiencePersistPayload) => {
      setSaveState("saving");

      try {
        const success = await saveProgress(payload);

        if (!success) {
          setSaveState("error");
          return false;
        }

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
    async (stepDataPatch: ShareExperienceFormDataPatch) => {
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
    async (stepNumber: number, stepData: ShareExperienceFormDataPatch) => {
      const updatedFormData = { ...formDataRef.current, ...stepData };
      formDataRef.current = updatedFormData;
      setFormData(updatedFormData);

      if (stepNumber === 5) {
        if (isSubmitting || submissionSucceeded) {
          return;
        }

        let didSubmitSucceed = false;

        try {
          setIsSubmitting(true);
          setSubmissionSucceeded(false);
          setSubmitError(null);

          const success = await submitExperience(updatedFormData);

          if (success) {
            didSubmitSucceed = true;
            setSubmissionSucceeded(true);
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
          setSubmissionSucceeded(false);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          if (!didSubmitSucceed) {
            setIsSubmitting(false);
          }
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
      submissionSucceeded,
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

  const handleCurrentStepComplete = useCallback(
    (data: ShareExperienceFormDataPatch) =>
      handleStepComplete(currentStep, data),
    [currentStep, handleStepComplete],
  );

  const stepProps = useMemo(
    () => ({
      data: formData,
      onComplete: handleCurrentStepComplete,
      onSave: handleFormDataChange,
      onPrevious: handlePreviousStep,
      saveState,
      onRequiredCountChange: setCurrentStepMissingRequiredCount,
    }),
    [
      formData,
      handleCurrentStepComplete,
      handleFormDataChange,
      handlePreviousStep,
      saveState,
    ],
  );

  const stepContent = useMemo(() => {
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
            isSubmitting={isSubmitting || submissionSucceeded}
            onGoToStep={handleStepClick}
          />
        );
      default:
        return <BasicInformationStep {...stepProps} />;
    }
  }, [
    currentStep,
    handleStepClick,
    isSubmitting,
    stepProps,
    submissionSucceeded,
  ]);

  if (sessionStatus === "loading" || experienceLoading) {
    return <ShareExperienceLoadingSkeleton />;
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

  const isEditLocked = isStudentLockedExperienceStatus(experienceData?.status);

  if (isEditLocked) {
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
            <section className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-950 sm:text-3xl">
                Share your Erasmus experience
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Your submission is available in My Submissions.
              </p>
            </section>

            <Alert className="mb-5">
              <Icon
                icon="solar:lock-keyhole-bold-duotone"
                className="h-4 w-4"
              />
              <AlertDescription>
                {getStudentLockedExperienceMessage(experienceData?.status)}
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void router.push("/my-submissions")}>
                Go to My Submissions
              </Button>
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
          {submitError && (
            <Alert variant="destructive" className="mb-5">
              <Icon
                icon="solar:danger-triangle-bold-duotone"
                className="h-4 w-4"
              />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {experienceError && !submitError && (
            <Alert variant="destructive" className="mb-5">
              <Icon
                icon="solar:danger-triangle-bold-duotone"
                className="h-4 w-4"
              />
              <AlertDescription>{experienceError}</AlertDescription>
            </Alert>
          )}

          <section className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-950 sm:text-3xl">
              Share your Erasmus experience
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Share practical details future Erasmus students can use.
            </p>
          </section>

          <FormProgressBar
            steps={progressSteps}
            currentStep={currentStep}
            completedSteps={completedStepNumbers}
            onStepClick={handleStepClick}
          />

          <FormProvider
            formData={formData}
            onSave={handleFormDataChange}
            currentStep={currentStep}
          >
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-5 sm:p-6">{stepContent}</CardContent>
            </Card>
          </FormProvider>
        </div>
      </main>
    </>
  );
}
