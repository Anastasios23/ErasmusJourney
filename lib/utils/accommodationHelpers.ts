/**
 * Accommodation Helper Utilities
 *
 * Helper functions for accommodation pricing, amenities, ratings,
 * and budget calculations in the Erasmus Journey platform.
 */

/**
 * Format monthly rent display
 * @param cents - Price in cents
 * @returns Formatted string (e.g., "€450/month")
 */
export function formatMonthlyRent(cents: number): string {
  const euros = cents / 100;
  return `€${euros.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/month`;
}

/**
 * Format total cost breakdown
 * @param rent - Monthly rent in cents
 * @param deposit - Deposit in cents
 * @param utilities - Utilities in cents
 * @returns Formatted breakdown
 */
export function formatCostBreakdown(
  rent: number,
  deposit: number | null,
  utilities: number | null,
): {
  monthly: string;
  deposit: string;
  utilities: string;
  totalMonthly: string;
  totalUpfront: string;
  yearly: string;
} {
  const totalMonthly = rent + (utilities || 0);
  const totalUpfront = rent + (deposit || 0);
  const yearly = totalMonthly * 12;

  return {
    monthly: `€${(rent / 100).toFixed(0)}`,
    deposit: deposit ? `€${(deposit / 100).toFixed(0)}` : "Not specified",
    utilities: utilities ? `€${(utilities / 100).toFixed(0)}` : "Included",
    totalMonthly: `€${(totalMonthly / 100).toFixed(0)}`,
    totalUpfront: `€${(totalUpfront / 100).toFixed(0)}`,
    yearly: `€${(yearly / 100).toFixed(0)}`,
  };
}

/**
 * Get affordability badge
 * @param rent - Monthly rent in cents
 * @param cityAverage - City average rent in cents
 * @returns Badge info
 */
export function getAffordabilityBadge(
  rent: number,
  cityAverage: number,
): {
  label: string;
  className: string;
  icon: string;
} {
  if (!cityAverage || cityAverage === 0) {
    return {
      label: "Average",
      className: "bg-gray-100 text-gray-700",
      icon: "💵",
    };
  }

  const ratio = rent / cityAverage;

  if (ratio <= 0.7) {
    return {
      label: "Very Affordable",
      className: "bg-green-100 text-green-700",
      icon: "💰",
    };
  } else if (ratio <= 0.9) {
    return {
      label: "Affordable",
      className: "bg-blue-100 text-blue-700",
      icon: "💵",
    };
  } else if (ratio <= 1.1) {
    return {
      label: "Average",
      className: "bg-gray-100 text-gray-700",
      icon: "💵",
    };
  } else if (ratio <= 1.3) {
    return {
      label: "Above Average",
      className: "bg-orange-100 text-orange-700",
      icon: "💳",
    };
  } else {
    return {
      label: "Premium",
      className: "bg-purple-100 text-purple-700",
      icon: "💎",
    };
  }
}

/**
 * Get amenity icon
 * @param amenity - Amenity name
 * @returns Emoji icon
 */
export function getAmenityIcon(amenity: string): string {
  const icons: Record<string, string> = {
    wifi: "📶",
    parking: "🅿️",
    kitchen: "🍳",
    laundry: "🧺",
    furnished: "🪑",
    aircon: "❄️",
    heating: "🔥",
    elevator: "🛗",
    balcony: "🏖️",
    gym: "💪",
    pool: "🏊",
    security: "🔒",
    pets: "🐕",
    bike: "🚲",
  };

  return icons[amenity.toLowerCase()] || "✨";
}

/**
 * Get accommodation type badge
 * @param type - Accommodation type
 * @returns Badge info
 */
export function getAccommodationTypeBadge(type: string): {
  label: string;
  className: string;
  icon: string;
} {
  const typeLower = type.toLowerCase();

  if (typeLower.includes("apartment")) {
    return {
      label: "Apartment",
      className: "bg-blue-100 text-blue-700",
      icon: "🏢",
    };
  } else if (typeLower.includes("studio")) {
    return {
      label: "Studio",
      className: "bg-purple-100 text-purple-700",
      icon: "🏠",
    };
  } else if (typeLower.includes("residence") || typeLower.includes("dorm")) {
    return {
      label: "Residence Hall",
      className: "bg-green-100 text-green-700",
      icon: "🏘️",
    };
  } else if (typeLower.includes("house") || typeLower.includes("villa")) {
    return {
      label: "House",
      className: "bg-yellow-100 text-yellow-700",
      icon: "🏡",
    };
  } else if (typeLower.includes("shared") || typeLower.includes("flatshare")) {
    return {
      label: "Shared",
      className: "bg-orange-100 text-orange-700",
      icon: "👥",
    };
  } else if (typeLower.includes("room")) {
    return {
      label: "Private Room",
      className: "bg-pink-100 text-pink-700",
      icon: "🚪",
    };
  }

  return { label: type, className: "bg-gray-100 text-gray-700", icon: "🏠" };
}

/**
 * Calculate budget breakdown with recommendations
 * @param monthlyRent - Rent in cents
 * @returns Budget breakdown
 */
export function calculateBudgetBreakdown(monthlyRent: number): {
  rent: number;
  food: number;
  transport: number;
  entertainment: number;
  utilities: number;
  misc: number;
  total: number;
  breakdown: Array<{ category: string; amount: number; percentage: number }>;
} {
  // Average student expenses (in cents)
  const food = 30000; // €300
  const transport = 5000; // €50
  const entertainment = 10000; // €100
  const utilities = Math.round(monthlyRent * 0.15); // ~15% of rent
  const misc = 5000; // €50

  const total =
    monthlyRent + food + transport + entertainment + utilities + misc;

  const breakdown = [
    {
      category: "Rent",
      amount: monthlyRent,
      percentage: Math.round((monthlyRent / total) * 100),
    },
    {
      category: "Food",
      amount: food,
      percentage: Math.round((food / total) * 100),
    },
    {
      category: "Utilities",
      amount: utilities,
      percentage: Math.round((utilities / total) * 100),
    },
    {
      category: "Entertainment",
      amount: entertainment,
      percentage: Math.round((entertainment / total) * 100),
    },
    {
      category: "Transport",
      amount: transport,
      percentage: Math.round((transport / total) * 100),
    },
    {
      category: "Miscellaneous",
      amount: misc,
      percentage: Math.round((misc / total) * 100),
    },
  ];

  return {
    rent: monthlyRent,
    food,
    transport,
    entertainment,
    utilities,
    misc,
    total,
    breakdown,
  };
}

/**
 * Get rating badge
 * @param rating - Rating value (1-5)
 * @returns Badge info
 */
export function getRatingBadge(rating: number | null): {
  label: string;
  className: string;
  stars: string;
  color: string;
} {
  if (rating === null) {
    return {
      label: "Not Rated",
      className: "bg-gray-100 text-gray-700",
      stars: "☆☆☆☆☆",
      color: "gray",
    };
  }

  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? "★" : "";
  const emptyStars = 5 - Math.ceil(rating);
  const stars = "★".repeat(fullStars) + halfStar + "☆".repeat(emptyStars);

  if (rating >= 4.5) {
    return {
      label: "Excellent",
      className: "bg-green-100 text-green-700",
      stars,
      color: "green",
    };
  } else if (rating >= 4.0) {
    return {
      label: "Very Good",
      className: "bg-blue-100 text-blue-700",
      stars,
      color: "blue",
    };
  } else if (rating >= 3.5) {
    return {
      label: "Good",
      className: "bg-yellow-100 text-yellow-700",
      stars,
      color: "yellow",
    };
  } else if (rating >= 3.0) {
    return {
      label: "Fair",
      className: "bg-orange-100 text-orange-700",
      stars,
      color: "orange",
    };
  } else {
    return {
      label: "Poor",
      className: "bg-red-100 text-red-700",
      stars,
      color: "red",
    };
  }
}

/**
 * Calculate savings compared to average
 * @param rent - Monthly rent in cents
 * @param average - Average rent in cents
 * @returns Savings info
 */
export function calculateSavings(
  rent: number,
  average: number,
): {
  amount: number;
  percentage: number;
  isSaving: boolean;
  label: string;
} {
  const diff = average - rent;
  const percentage = average > 0 ? Math.round((diff / average) * 100) : 0;

  if (diff > 0) {
    return {
      amount: Math.abs(diff),
      percentage: Math.abs(percentage),
      isSaving: true,
      label: `Save €${Math.round(Math.abs(diff) / 100)}/month (${Math.abs(percentage)}% below average)`,
    };
  } else if (diff < 0) {
    return {
      amount: Math.abs(diff),
      percentage: Math.abs(percentage),
      isSaving: false,
      label: `€${Math.round(Math.abs(diff) / 100)}/month more (${Math.abs(percentage)}% above average)`,
    };
  } else {
    return {
      amount: 0,
      percentage: 0,
      isSaving: false,
      label: "At average price",
    };
  }
}

/**
 * Format stay duration
 * @param duration - Duration string
 * @returns Formatted duration
 */
export function formatStayDuration(duration: string | null): string {
  if (!duration) return "Not specified";

  const durationLower = duration.toLowerCase();

  if (durationLower.includes("semester")) return "🗓️ One Semester";
  if (durationLower.includes("year") || durationLower.includes("academic"))
    return "📅 Full Academic Year";
  if (durationLower.includes("summer")) return "☀️ Summer";
  if (durationLower.includes("month")) {
    const match = duration.match(/(\d+)/);
    if (match) return `🗓️ ${match[1]} Months`;
  }

  return duration;
}

/**
 * Get neighborhood popularity badge
 * @param listingsCount - Number of listings
 * @param recommendationRate - Recommendation percentage (0-100)
 * @returns Badge info
 */
export function getNeighborhoodBadge(
  listingsCount: number,
  recommendationRate: number,
): {
  label: string;
  className: string;
  icon: string;
} {
  if (recommendationRate >= 80 && listingsCount >= 10) {
    return {
      label: "🌟 Popular & Highly Rated",
      className: "bg-gradient-to-r from-green-100 to-blue-100 text-green-700",
      icon: "🌟",
    };
  } else if (recommendationRate >= 80) {
    return {
      label: "⭐ Highly Rated",
      className: "bg-green-100 text-green-700",
      icon: "⭐",
    };
  } else if (listingsCount >= 10) {
    return {
      label: "🏘️ Many Options",
      className: "bg-blue-100 text-blue-700",
      icon: "🏘️",
    };
  } else if (recommendationRate >= 60) {
    return {
      label: "👍 Recommended",
      className: "bg-yellow-100 text-yellow-700",
      icon: "👍",
    };
  } else {
    return {
      label: "🏠 Available",
      className: "bg-gray-100 text-gray-700",
      icon: "🏠",
    };
  }
}

/**
 * Format price range display
 * @param min - Minimum price in cents
 * @param max - Maximum price in cents
 * @returns Formatted range
 */
export function formatPriceRange(min: number, max: number): string {
  const minEuros = Math.round(min / 100);
  const maxEuros = Math.round(max / 100);
  return `€${minEuros} - €${maxEuros}`;
}

/**
 * Get value for money score
 * @param rent - Monthly rent in cents
 * @param rating - Overall rating (1-5)
 * @returns Value score (1-10)
 */
export function getValueScore(rent: number, rating: number | null): number {
  if (!rating) return 5;

  // Lower rent + higher rating = better value
  const maxRent = 150000; // €1,500
  const affordabilityScore = Math.max(
    0,
    Math.min(10, (1 - rent / maxRent) * 10),
  );
  const qualityScore = (rating / 5) * 10;

  // Weighted: 40% affordability, 60% quality
  const valueScore = affordabilityScore * 0.4 + qualityScore * 0.6;

  return Math.round(valueScore * 10) / 10;
}

/**
 * Get move-in cost estimate
 * @param rent - Monthly rent in cents
 * @param deposit - Deposit in cents (typically 1-2 months rent)
 * @returns Move-in cost info
 */
export function getMoveInCost(
  rent: number,
  deposit: number | null,
): {
  firstMonth: number;
  deposit: number;
  total: number;
  formatted: string;
} {
  const depositAmount = deposit || rent; // Default to 1 month rent if not specified
  const total = rent + depositAmount;

  return {
    firstMonth: rent,
    deposit: depositAmount,
    total,
    formatted: `€${Math.round(total / 100)} (€${Math.round(rent / 100)} rent + €${Math.round(depositAmount / 100)} deposit)`,
  };
}
