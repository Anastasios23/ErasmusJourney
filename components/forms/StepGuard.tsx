import { useEffect } from "react";
import { useRouter } from "next/router";
import { useFormProgress } from "../../src/context/FormProgressContext";

interface StepGuardProps {
  requiredStep: number;
  children: React.ReactNode;
}

export function StepGuard({ requiredStep, children }: StepGuardProps) {
  const router = useRouter();
  const { completedSteps, isLoading, getStepName } = useFormProgress();

  useEffect(() => {
    // Wait for data to load
    if (isLoading) return;

    // Step 1 is always accessible
    if (requiredStep === 1) {
      return;
    }

    // Check if previous step is completed
    const previousStepName = getStepName(requiredStep - 1);
    const previousStepCompleted = completedSteps.includes(previousStepName);

    if (!previousStepCompleted) {
      console.warn(
        `Step ${requiredStep} requires step ${requiredStep - 1} to be completed. Redirecting to basic information.`,
      );
      router.replace("/basic-information");
    }
  }, [requiredStep, completedSteps, router, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Always render children - the redirect happens in useEffect
  return <>{children}</>;
}
