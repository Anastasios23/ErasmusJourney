import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

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

const stepIcons = [
  "solar:user-circle-linear",
  "solar:notebook-linear",
  "solar:home-2-linear",
  "solar:wallet-linear",
  "solar:heart-linear",
];

export function FormProgressBar({
  steps,
  currentStep,
  completedSteps,
}: FormProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;
  const totalCompleted = completedSteps.length;

  return (
    <div className="mb-12">
      {/* Overall Progress Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping absolute opacity-20" />
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/30">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {Math.round((totalCompleted / steps.length) * 100)}% Complete
          </span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8 shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_2s_linear_infinite]" />
        </motion.div>
      </div>

      {/* Step Indicators */}
      <div className="relative px-2">
        {/* Connector Line */}
        <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-100 dark:bg-slate-800" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className="absolute top-5 left-4 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.number);
            const isCurrent = currentStep === step.number;
            const isAccessible =
              isCompleted ||
              isCurrent ||
              completedSteps.includes(step.number - 1) ||
              step.number === 1;

            const stepIcon = stepIcons[index] || "solar:user-circle-linear";

            const StepContent = (
              <motion.div
                whileHover={isAccessible ? { scale: 1.05 } : {}}
                whileTap={isAccessible ? { scale: 0.95 } : {}}
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Circle with Icon */}
                <div
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300 z-10 border-2
                    ${
                      isCompleted
                        ? "bg-gradient-to-br from-blue-500 to-indigo-500 border-transparent text-white shadow-lg shadow-blue-500/30"
                        : isCurrent
                          ? "bg-white dark:bg-slate-900 border-blue-500 text-blue-600 dark:text-blue-400 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/30"
                          : isAccessible
                            ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 group-hover:border-blue-400 group-hover:text-blue-500"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Icon icon="solar:check-read-linear" className="h-5 w-5" />
                  ) : (
                    <Icon icon={stepIcon} className="h-5 w-5" />
                  )}

                  {/* Pulse Animation for Current Step */}
                  {isCurrent && (
                    <span className="absolute -inset-1 border-2 border-blue-500/30 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    mt-3 text-xs font-bold tracking-tight transition-colors duration-300
                    ${
                      isCurrent
                        ? "text-blue-600 dark:text-blue-400"
                        : isCompleted
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-600"
                    }
                  `}
                >
                  {step.name}
                </span>
              </motion.div>
            );

            return (
              <div key={step.number} className="flex-1 flex justify-center">
                {isAccessible ? (
                  <Link href={step.href} className="no-underline">
                    {StepContent}
                  </Link>
                ) : (
                  <div className="cursor-not-allowed opacity-60">
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
