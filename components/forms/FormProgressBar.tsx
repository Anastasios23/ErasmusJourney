import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface Step {
  number: number;
  name: string;
  href: string;
}

interface FormProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export function FormProgressBar({
  steps,
  currentStep,
  completedSteps,
}: FormProgressBarProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />

        {/* Progress Line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            const isAccessible =
              isCompleted ||
              isCurrent ||
              completedSteps.includes(step.number - 1) ||
              step.number === 1;

            const StepContent = (
              <div className="flex flex-col items-center group cursor-pointer">
                {/* Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300 z-10
                    ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white group-hover:bg-green-600"
                        : isCurrent
                          ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100"
                          : isAccessible
                            ? "bg-white border-gray-300 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400"
                            : "bg-gray-100 border-gray-200 text-gray-300"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`
                      text-xs font-medium max-w-[100px] transition-colors duration-300
                      ${
                        isCurrent
                          ? "text-blue-600"
                          : isCompleted
                            ? "text-green-600 group-hover:text-green-700"
                            : isAccessible
                              ? "text-gray-500 group-hover:text-blue-500"
                              : "text-gray-300"
                      }
                    `}
                  >
                    {step.name}
                  </p>
                </div>
              </div>
            );

            return (
              <div key={step.number} className="relative z-10">
                {isAccessible ? (
                  <Link href={step.href}>{StepContent}</Link>
                ) : (
                  <div className="cursor-not-allowed opacity-70">
                    {StepContent}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
