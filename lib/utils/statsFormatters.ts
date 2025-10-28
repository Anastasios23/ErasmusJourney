/**
 * Statistics Formatting Utilities
 *
 * Helper functions for displaying stats in the UI
 */

/**
 * Format cents to EUR display
 */
export function formatCents(cents: number, includeCurrency = true): string {
  if (cents === 0) return includeCurrency ? "€0" : "0";

  const euros = cents / 100;
  const formatted = euros.toLocaleString("en-EU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return includeCurrency ? `€${formatted}` : formatted;
}

/**
 * Format cents to EUR with decimals
 */
export function formatCentsDetailed(cents: number): string {
  if (cents === 0) return "€0.00";

  const euros = cents / 100;
  return `€${euros.toLocaleString("en-EU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format price range
 */
export function formatPriceRange(minCents: number, maxCents: number): string {
  if (minCents === 0 && maxCents === 0) return "N/A";
  return `${formatCents(minCents)} - ${formatCents(maxCents)}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format count with label
 */
export function formatCount(
  count: number,
  singular: string,
  plural?: string,
): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + "s"}`;
}

/**
 * Get color class for price level
 */
export function getPriceColor(cents: number, avgCents: number): string {
  if (cents === 0 || avgCents === 0) return "text-gray-500";

  const ratio = cents / avgCents;

  if (ratio < 0.8) return "text-green-600"; // 20% below average
  if (ratio < 0.95) return "text-green-500"; // 5-20% below average
  if (ratio <= 1.05) return "text-gray-700"; // Within 5% of average
  if (ratio <= 1.2) return "text-orange-500"; // 5-20% above average
  return "text-red-600"; // 20%+ above average
}

/**
 * Get badge class for price level
 */
export function getPriceBadge(
  cents: number,
  avgCents: number,
): { label: string; className: string } {
  if (cents === 0 || avgCents === 0) {
    return { label: "No data", className: "bg-gray-100 text-gray-700" };
  }

  const ratio = cents / avgCents;

  if (ratio < 0.8) {
    return {
      label: "Very affordable",
      className: "bg-green-100 text-green-800",
    };
  }
  if (ratio < 0.95) {
    return { label: "Affordable", className: "bg-green-50 text-green-700" };
  }
  if (ratio <= 1.05) {
    return { label: "Average", className: "bg-gray-100 text-gray-700" };
  }
  if (ratio <= 1.2) {
    return { label: "Expensive", className: "bg-orange-50 text-orange-700" };
  }
  return { label: "Very expensive", className: "bg-red-100 text-red-800" };
}

/**
 * Get quality rating label and color
 */
export function getQualityRating(score: number): {
  label: string;
  className: string;
} {
  if (score === 0) {
    return { label: "Not rated", className: "bg-gray-100 text-gray-700" };
  }
  if (score >= 4.5) {
    return { label: "Excellent", className: "bg-green-100 text-green-800" };
  }
  if (score >= 4.0) {
    return { label: "Very good", className: "bg-green-50 text-green-700" };
  }
  if (score >= 3.5) {
    return { label: "Good", className: "bg-blue-50 text-blue-700" };
  }
  if (score >= 3.0) {
    return { label: "Average", className: "bg-gray-100 text-gray-700" };
  }
  if (score >= 2.0) {
    return {
      label: "Below average",
      className: "bg-orange-50 text-orange-700",
    };
  }
  return { label: "Poor", className: "bg-red-100 text-red-800" };
}

/**
 * Calculate savings compared to average
 */
export function calculateSavings(
  rentCents: number,
  avgCents: number,
): {
  amount: number;
  percentage: number;
  label: string;
} {
  if (rentCents === 0 || avgCents === 0) {
    return { amount: 0, percentage: 0, label: "N/A" };
  }

  const diff = avgCents - rentCents;
  const percentage = (diff / avgCents) * 100;

  if (diff > 0) {
    return {
      amount: diff,
      percentage: Math.round(percentage),
      label: `${formatPercentage(percentage, 0)} cheaper than average`,
    };
  } else {
    return {
      amount: Math.abs(diff),
      percentage: Math.round(Math.abs(percentage)),
      label: `${formatPercentage(Math.abs(percentage), 0)} more than average`,
    };
  }
}

/**
 * Format sample size with confidence indicator
 */
export function formatSampleSize(size: number): {
  text: string;
  confidence: string;
  className: string;
} {
  if (size === 0) {
    return {
      text: "No data",
      confidence: "No data available",
      className: "text-gray-500",
    };
  }
  if (size < 3) {
    return {
      text: `${size} submission${size === 1 ? "" : "s"}`,
      confidence: "Limited data",
      className: "text-orange-600",
    };
  }
  if (size < 10) {
    return {
      text: `${size} submissions`,
      confidence: "Moderate confidence",
      className: "text-blue-600",
    };
  }
  return {
    text: `${size} submissions`,
    confidence: "High confidence",
    className: "text-green-600",
  };
}

/**
 * Detect if value is an outlier
 */
export function isOutlier(value: number, p5: number, p95: number): boolean {
  return value < p5 || value > p95;
}

/**
 * Format outlier warning
 */
export function getOutlierWarning(
  value: number,
  p5: number,
  p95: number,
): string | null {
  if (value < p5) {
    return "This price is unusually low compared to similar accommodations";
  }
  if (value > p95) {
    return "This price is unusually high compared to similar accommodations";
  }
  return null;
}

/**
 * Format percentile range
 */
export function formatPercentileRange(p5: number, p95: number): string {
  return `${formatCents(p5)} - ${formatCents(p95)} (typical range)`;
}

/**
 * Get accommodation type label
 */
export function getAccommodationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    APARTMENT: "Apartment",
    STUDENT_RESIDENCE: "Student Residence",
    SHARED_FLAT: "Shared Flat",
    HOMESTAY: "Homestay",
    STUDIO: "Studio",
    OTHER: "Other",
  };
  return labels[type] || type;
}

/**
 * Get study level label
 */
export function getStudyLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    BACHELOR: "Bachelor",
    MASTER: "Master",
    PHD: "PhD",
    UNKNOWN: "Unknown",
  };
  return labels[level] || level;
}

/**
 * Format ECTS credits
 */
export function formatECTS(ects: number): string {
  if (ects === 0) return "N/A";
  return `${ects} ECTS`;
}

/**
 * Format quality score
 */
export function formatQualityScore(score: number): string {
  if (score === 0) return "Not rated";
  return `${score.toFixed(1)}/5.0 ⭐`;
}

/**
 * Calculate monthly budget breakdown
 */
export function calculateBudgetBreakdown(rentCents: number): {
  rent: number;
  food: number;
  transport: number;
  other: number;
  total: number;
} {
  // Estimates based on typical student expenses
  const rent = rentCents;
  const food = Math.round(rentCents * 0.4); // ~40% of rent
  const transport = Math.round(rentCents * 0.15); // ~15% of rent
  const other = Math.round(rentCents * 0.25); // ~25% of rent

  return {
    rent,
    food,
    transport,
    other,
    total: rent + food + transport + other,
  };
}
