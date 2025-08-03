import React from "react";
import { Badge } from "./ui/badge";
import { Euro, DollarSign } from "lucide-react";

interface CostLevelBadgeProps {
  level: "low" | "medium" | "high";
  amount?: number;
  currency?: "EUR" | "USD";
  className?: string;
}

export function CostLevelBadge({
  level,
  amount,
  currency = "EUR",
  className,
}: CostLevelBadgeProps) {
  const getVariant = () => {
    switch (level) {
      case "low":
        return "cost_low" as const;
      case "medium":
        return "cost_medium" as const;
      case "high":
        return "cost_high" as const;
      default:
        return "secondary" as const;
    }
  };

  const getIcon = () => {
    return currency === "EUR" ? Euro : DollarSign;
  };

  const getLabel = () => {
    const baseLabel = level.charAt(0).toUpperCase() + level.slice(1);
    if (amount) {
      const symbol = currency === "EUR" ? "€" : "$";
      return `${baseLabel} (${symbol}${amount})`;
    }
    return `${baseLabel} Cost`;
  };

  const Icon = getIcon();

  return (
    <Badge variant={getVariant()} className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {getLabel()}
    </Badge>
  );
}

export default CostLevelBadge;
