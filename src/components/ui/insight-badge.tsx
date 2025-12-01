import React from "react";
import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";

interface InsightBadgeProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  color?: "blue" | "green" | "purple" | "orange" | "red";
  className?: string;
}

export function InsightBadge({
  icon: Icon,
  label,
  value,
  color = "blue",
  className,
}: InsightBadgeProps) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm",
        colorStyles[color],
        className
      )}
    >
      <div className="p-2 bg-white bg-opacity-60 rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-medium opacity-80 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-lg font-bold leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}
