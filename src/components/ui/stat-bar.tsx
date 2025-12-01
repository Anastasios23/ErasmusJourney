import React from "react";
import { cn } from "../../lib/utils";

interface StatBarProps {
  label: string;
  value: number; // 0 to 100 or 0 to 5
  maxValue?: number;
  color?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
}

export function StatBar({
  label,
  value,
  maxValue = 5,
  color = "bg-blue-600",
  showValue = true,
  valuePrefix = "",
  valueSuffix = "",
  className,
}: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showValue && (
          <span className="text-sm font-semibold text-gray-900">
            {valuePrefix}
            {value.toFixed(1)}
            {valueSuffix}
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={cn("h-2.5 rounded-full transition-all duration-500 ease-out", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
