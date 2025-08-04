import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import StandardIcon from "../src/components/StandardIcon";

// Form step components
import BasicInformationStep from "../components/forms/steps/BasicInformationStep";
import CourseMatchingStep from "../components/forms/steps/CourseMatchingStep";
import AccommodationStep from "../components/forms/steps/AccommodationStep";
import LivingExpensesStep from "../components/forms/steps/LivingExpensesStep";
import ExperienceStep from "../components/forms/steps/ExperienceStep";

// Form provider and utilities
import { FormProvider } from "../components/forms/FormProvider";
import { AutosaveIndicator } from "../components/AutosaveIndicator";
import Header from "../components/Header";

interface FormStep {
  id: number;
  title: string;
  subtitle: string;
  iconType: "users" | "book" | "home" | "cost" | "favorite";
  component: React.ComponentType<{
    data: any;
    onComplete: (data: any) => void;
    onSave: (data: any) => void;
  }>;
  estimatedTime: string;
}

const FORM_STEPS: FormStep[] = [
  {
    id: 1,
    title: "Basic Information",
    subtitle: "Your academic and exchange details",
    icon: UserIcon,
    component: BasicInformationStep,
    estimatedTime: "5 min",
  },
  {
    id: 2,
    title: "Course Matching",
    subtitle: "Academic courses and equivalences",
    icon: BookOpenIcon,
    component: CourseMatchingStep,
    estimatedTime: "10 min",
  },
  {
    id: 3,
    title: "Accommodation",
    subtitle: "Housing details and recommendations",
    icon: HomeIcon,
    component: AccommodationStep,
    estimatedTime: "8 min",
  },
  {
    id: 4,
    title: "Living Expenses",
    subtitle: "Budget and cost information",
    icon: CurrencyEuroIcon,
    component: LivingExpensesStep,
    estimatedTime: "7 min",
  },
  {
    id: 5,
    title: "Share Experience",
    subtitle: "Help future Erasmus students",
    icon: HeartIcon,
    component: ExperienceStep,
    estimatedTime: "15 min",
  },
];

export default function ErasmusExperienceForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load existing form data
  useEffect(() => {
    if (session?.user?.id) {
      loadFormData();
    }
  }, [session]);

  // Check for step parameter in URL
  useEffect(() => {
    const stepParam = router.query.step;
    if (stepParam && typeof stepParam === "string") {
      const step = parseInt(stepParam);
      if (step >= 1 && step <= FORM_STEPS.length) {
        setCurrentStep(step);
      }
    }
  }, [router.query.step]);

  const loadFormData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/erasmus-experience/${session?.user?.id}`,
      );

      if (response.ok) {
        const data = await response.json();
        setFormData(data.formData || {});
        setCurrentStep(data.currentStep || 1);
        setCompletedSteps(data.completedSteps || []);
        setLastSaved(data.lastSavedAt ? new Date(data.lastSavedAt) : null);
      }
    } catch (error) {
      console.error("Failed to load form data:", error);
      setError("Failed to load your previous form data");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFormData = async (stepData: any, stepNumber: number) => {
    if (!session?.user?.id) return;

    try {
      setIsSaving(true);
      setError(null);

      const updatedFormData = {
        ...formData,
        ...stepData,
      };

      const response = await fetch(
        `/api/erasmus-experience/${session.user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formData: updatedFormData,
            currentStep: Math.max(currentStep, stepNumber),
            completedSteps: Array.from(
              new Set([...completedSteps, stepNumber]),
            ),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save form data");
      }

      const result = await response.json();
      setFormData(updatedFormData);
      setCompletedSteps(result.completedSteps || []);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save form data:", error);
      setError("Failed to save your form data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStepComplete = async (stepData: any) => {
    await saveFormData(stepData, currentStep);

    if (currentStep < FORM_STEPS.length) {
      setCurrentStep(currentStep + 1);
      router.push(
        `/erasmus-experience-form?step=${currentStep + 1}`,
        undefined,
        { shallow: true },
      );
    }
  };

  const submitForm = async () => {
    if (!session?.user?.id) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/erasmus-experience/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      router.push("/dashboard?submitted=true");
    } catch (error) {
      console.error("Failed to submit form:", error);
      setError("Failed to submit your form");
    } finally {
      setIsSaving(false);
    }
  };

  const navigateToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    router.push(`/erasmus-experience-form?step=${stepNumber}`, undefined, {
      shallow: true,
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const currentStepConfig = FORM_STEPS[currentStep - 1];
  const StepComponent = currentStepConfig.component;
  const isLastStep = currentStep === FORM_STEPS.length;
  const canNavigateNext =
    completedSteps.includes(currentStep) || currentStep === 1;

  return (
    <>
      <Head>
        <title>Share Your Erasmus Experience - Step {currentStep}</title>
        <meta
          name="description"
          content="Share your complete Erasmus experience to help future students"
        />
      </Head>

      <Header />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Erasmus Experience Form
              </h1>
              <AutosaveIndicator
                isSaving={isSaving}
                lastSaved={lastSaved}
                error={error}
              />
            </div>

            {/* Step Progress */}
            <div className="flex items-center space-x-4 mb-6">
              {FORM_STEPS.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                const IconComponent = step.icon;

                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => navigateToStep(step.id)}
                      disabled={
                        !isCompleted &&
                        !isCurrent &&
                        step.id > Math.max(...completedSteps, 1)
                      }
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isCurrent
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-gray-100 border-gray-300 text-gray-400"
                      } ${
                        isCompleted ||
                        isCurrent ||
                        step.id <= Math.max(...completedSteps, 1)
                          ? "cursor-pointer hover:scale-105"
                          : "cursor-not-allowed"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </button>
                    {index < FORM_STEPS.length - 1 && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${
                          completedSteps.includes(step.id)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current Step Info */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Step {currentStep}: {currentStepConfig.title}
              </h2>
              <p className="text-gray-600 mb-1">{currentStepConfig.subtitle}</p>
              <p className="text-sm text-gray-500">
                Estimated time: {currentStepConfig.estimatedTime}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <FormProvider
            formData={formData}
            onSave={(data) => saveFormData(data, currentStep)}
            currentStep={currentStep}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <StepComponent
                data={formData}
                onComplete={handleStepComplete}
                onSave={(data) => saveFormData(data, currentStep)}
              />
            </div>
          </FormProvider>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigateToStep(currentStep - 1)}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 rounded-md ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Previous
            </button>

            <div className="flex space-x-4">
              <button
                onClick={() => saveFormData(formData, currentStep)}
                disabled={isSaving}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <DocumentIcon className="w-5 h-5 mr-2" />
                {isSaving ? "Saving..." : "Save Draft"}
              </button>

              {isLastStep ? (
                <button
                  onClick={submitForm}
                  disabled={
                    isSaving || completedSteps.length < FORM_STEPS.length
                  }
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Submitting..." : "Submit Form"}
                </button>
              ) : (
                <button
                  onClick={() => navigateToStep(currentStep + 1)}
                  disabled={!canNavigateNext}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    canNavigateNext
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                  <ChevronRightIcon className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
