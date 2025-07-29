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
import { useFormSubmissions } from "../hooks/useFormSubmissions";

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
  cacheFormData: (type: string, data: any) => void;
  getCachedFormData: (type: string) => any;
}

const FormProgressContext = createContext<FormProgressContextType | undefined>(
  undefined,
);

export function FormProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { getFormData } = useFormSubmissions();
  const [completedSteps, setCompletedSteps] = useState<FormStep[]>([]);
  const [currentStep, setCurrentStep] = useState<FormStep>("basic-info");
  // Add cache for form data
  const [formDataCache, setFormDataCache] = useState<Record<string, any>>({});

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

  // Load completed steps from submissions data
  useEffect(() => {
    const loadCompletedSteps = async () => {
      const steps: FormStep[] = [];
      for (const step of [
        "basic-info",
        "course-matching",
        "accommodation",
        "living-expenses",
        "help-future-students",
      ] as FormStep[]) {
        const formData = await getFormData(step);
        if (formData) {
          steps.push(step);
        }
      }
      setCompletedSteps(steps);
    };

    if (session) {
      loadCompletedSteps();
    }
  }, [session, getFormData]);

  useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      requestTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      requestTimeouts.current.clear();
    };
  }, []);

  const stepOrder: FormStep[] = [
    "basic-info",
    "course-matching",
    "accommodation",
    "living-expenses",
    "help-future-students",
  ];

  const isStepCompleted = (step: FormStep) => completedSteps.includes(step);

  const canAccessStep = (step: FormStep) => {
    const stepIndex = stepOrder.indexOf(step);
    const previousStep = stepOrder[stepIndex - 1];

    // First step is always accessible
    if (stepIndex === 0) return true;

    // Other steps require previous step completion
    return !previousStep || isStepCompleted(previousStep);
  };

  const markStepCompleted = (step: FormStep) => {
    setCompletedSteps((prev) => [...new Set([...prev, step])]);
  };

  const value = useMemo(
    () => ({
      currentStep,
      completedSteps,
      isStepCompleted,
      canAccessStep,
      markStepCompleted,
      cacheFormData,
      getCachedFormData,
    }),
    [
      currentStep,
      completedSteps,
      isStepCompleted,
      canAccessStep,
      markStepCompleted,
      cacheFormData,
      getCachedFormData,
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
