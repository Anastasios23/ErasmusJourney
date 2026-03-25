import React from "react";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { getPublicDestinationSignalSummary } from "../lib/publicDestinationPresentation";

interface PublicDestinationSignalNoticeProps {
  submissionCount: number;
  hostUniversityCount?: number;
  compact?: boolean;
  className?: string;
}

const toneClasses = {
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
} as const;

const badgeVariants = {
  warning: "warning",
  info: "info",
  success: "success",
} as const;

export default function PublicDestinationSignalNotice({
  submissionCount,
  hostUniversityCount = 0,
  compact = false,
  className,
}: PublicDestinationSignalNoticeProps) {
  const summary = getPublicDestinationSignalSummary(
    submissionCount,
    hostUniversityCount,
  );

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        toneClasses[summary.tone],
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badgeVariants[summary.tone]}>{summary.label}</Badge>
        <p className="text-sm font-medium">{summary.evidenceLine}</p>
      </div>
      {!compact ? (
        <p className="mt-2 text-sm leading-6 text-current/80">
          {summary.description}
        </p>
      ) : null}
    </div>
  );
}
