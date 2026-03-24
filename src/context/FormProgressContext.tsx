import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useErasmusExperience } from "../hooks/useErasmusExperience";

type FormStep =
  | "basic-info"
  | "course-matching"
  | "accommodation"
  | "living-expenses"
  | "help-future-students";

interface FormProgressContextType {
  currentStep: FormStep;
  completedSteps: FormStep[];
  isStepCompleted: (step: FormStep) => boolean;
  canAccessStep: (step: FormStep) => boolean;
  markStepCompleted: (step: FormStep) => void;
  setCurrentStep: (step: FormStep) => void;
  cacheFormData: (type: string, data: any) => void;
  getCachedFormData: (type: string) => any;
  // Numeric step tracking
  currentStepNumber: number;
  completedStepNumbers: number[];
  getStepNumber: (step: FormStep) => number;
  getStepName: (stepNumber: number) => FormStep;
  isLoading: boolean;
  isSynced: boolean;
}

const FormProgressContext = createContext<FormProgressContextType | undefined>(
  undefined,
);

const stepOrder: FormStep[] = [
  "basic-info",
  "course-matching",
  "accommodation",
  "living-expenses",
  "help-future-students",
];

// Numeric step helpers
const getStepNumber = (step: FormStep): number => {
  return stepOrder.indexOf(step) + 1;
};

const getStepName = (stepNumber: number): FormStep => {
  return stepOrder[stepNumber - 1];
};

export function FormProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use the unified experience hook
  const { data: experienceData, loading: experienceLoading } =
    useErasmusExperience();

  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [currentStep, setCurrentStep] = useState<FormStep>("basic-info");
  // Add cache for form data
  const [formDataCache, setFormDataCache] = useState<Record<string, any>>({});
  // Track if we have synced with backend
  const [isSynced, setIsSynced] = useState(false);

  // Cache form data
  const cacheFormData = useCallback((type: string, data: any) => {
    setFormDataCache((prev) => ({
      ...prev,
      [type]: data,
    }));
  }, []);

  // Get cached form data
  const getCachedFormData = useCallback(
    (type: string) => {
      return formDataCache[type];
    },
    [formDataCache],
  );

  // Sync with unified experience data
  const lastExperienceDataId = useRef<string | null>(null);
  const lastCompletedStepsStr = useRef<string>("");

  useEffect(() => {
    if (experienceData) {
      // 1. Sync completed steps with deep comparison
      if (
        experienceData.completedSteps &&
        Array.isArray(experienceData.completedSteps)
      ) {
        const steps = experienceData.completedSteps
          .map((num) => getStepName(num))
          .filter(Boolean) as FormStep[];

        const currentStepsStr = JSON.stringify([...steps].sort());
        if (currentStepsStr !== lastCompletedStepsStr.current) {
          setCompletedSteps(steps);
          lastCompletedStepsStr.current = currentStepsStr;
        }
      }

      // 2. Mark as synced once we have data
      if (
        experienceData.id &&
        experienceData.id !== lastExperienceDataId.current
      ) {
        lastExperienceDataId.current = experienceData.id;
        setIsSynced(true);
      } else if (experienceData.id) {
        setIsSynced(true);
      }
    } else if (!experienceLoading) {
      // If not loading and no data, we are synced (empty state)
      setIsSynced(true);
    }
  }, [experienceData, experienceLoading]);

  const isStepCompleted = useCallback(
    (step: FormStep) => completedSteps.includes(step),
    [completedSteps],
  );

  const canAccessStep = useCallback(
    (step: FormStep) => {
      const stepIndex = stepOrder.indexOf(step);
      const previousStep = stepOrder[stepIndex - 1];

      // First step is always accessible
      if (stepIndex === 0) return true;

      // Other steps require previous step completion
      return !previousStep || isStepCompleted(previousStep);
    },
    [isStepCompleted],
  );

  const markStepCompleted = useCallback((step: FormStep) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step],
    );
  }, []);

  const currentStepNumber = getStepNumber(currentStep);
  const completedStepNumbers = completedSteps.map((step) =>
    getStepNumber(step),
  );

  const value = useMemo(
    () => ({
      currentStep,
      completedSteps,
      isStepCompleted,
      canAccessStep,
      markStepCompleted,
      setCurrentStep,
      cacheFormData,
      getCachedFormData,
      currentStepNumber,
      completedStepNumbers,
      getStepNumber,
      getStepName,
      isLoading: experienceLoading || !isSynced,
      isSynced,
    }),
    [
      currentStep,
      completedSteps,
      isStepCompleted,
      canAccessStep,
      markStepCompleted,
      setCurrentStep,
      cacheFormData,
      getCachedFormData,
      currentStepNumber,
      completedStepNumbers,
      experienceLoading,
      isSynced,
    ],
  );

  return (
    <FormProgressContext.Provider value={value}>
      {children}
    </FormProgressContext.Provider>
  );
}

export const useFormProgress = () => {
  const context = useContext(FormProgressContext);
  if (context === undefined) {
    throw new Error(
      "useFormProgress must be used within a FormProgressProvider",
    );
  }
  return context;
};
