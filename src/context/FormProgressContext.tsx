import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();

  // Use the unified experience hook
  const {
    data: experienceData,
    saveProgress,
    loading: experienceLoading,
  } = useErasmusExperience();

  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [currentStep, setCurrentStep] = useState<FormStep>("basic-info");
  // Add cache for form data
  const [formDataCache, setFormDataCache] = useState<Record<string, any>>({});
  // Track if we have synced with backend
  const [isSynced, setIsSynced] = useState(false);

  // Add request debouncing
  const requestTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

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

  // Debounced request
  const debouncedRequest = useCallback(
    (key: string, fn: () => void, delay = 100) => {
      // Clear existing timeout
      const existingTimeout = requestTimeouts.current.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const newTimeout = setTimeout(fn, delay);
      requestTimeouts.current.set(key, newTimeout);
    },
    [],
  );

  useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      requestTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      requestTimeouts.current.clear();
    };
  }, []);

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

  const markStepCompleted = useCallback(
    async (step: FormStep) => {
      // Update local state
      let newCompletedSteps: FormStep[] = [];
      setCompletedSteps((prev) => {
        if (prev.includes(step)) {
          newCompletedSteps = prev;
          return prev;
        }
        newCompletedSteps = [...prev, step];
        return newCompletedSteps;
      });

      // Save to backend
      if (saveProgress && experienceData?.id) {
        const stepNumber = getStepNumber(step);
        const nextStepNumber = stepNumber + 1;

        // Calculate new completed steps numbers
        const currentCompletedNumbers = completedSteps.map((s) =>
          getStepNumber(s),
        );
        if (!currentCompletedNumbers.includes(stepNumber)) {
          currentCompletedNumbers.push(stepNumber);
        }

        await saveProgress({
          completedSteps: currentCompletedNumbers,
          currentStep: nextStepNumber <= 5 ? nextStepNumber : 5,
        });
      }
    },
    [saveProgress, experienceData?.id, completedSteps],
  );

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
