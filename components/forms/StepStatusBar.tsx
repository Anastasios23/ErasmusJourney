import React from "react";
import { Icon } from "@iconify/react";

import { cn } from "@/lib/utils";
import {
  type ShareExperienceSaveState,
  getShareExperienceSaveStateMeta,
} from "@/lib/shareExperienceUi";

interface StepStatusBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  saveState: ShareExperienceSaveState;
  missingRequiredCount: number;
}

export function StepStatusBar({
  currentStep,
  totalSteps,
  stepTitle,
  saveState,
  missingRequiredCount,
}: StepStatusBarProps) {
  const saveStateMeta = getShareExperienceSaveStateMeta(saveState);

  return (
    <div className="sticky top-20 z-30 mb-6 rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur md:static dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                saveStateMeta.badgeClassName,
              )}
            >
              <Icon
                icon={saveStateMeta.icon}
                className={cn(
                  "h-3.5 w-3.5",
                  saveState === "saving" && "animate-spin",
                )}
              />
              {saveStateMeta.label}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {stepTitle}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {missingRequiredCount} required{" "}
              {missingRequiredCount === 1 ? "field" : "fields"} left
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
