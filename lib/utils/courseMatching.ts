/**
 * Course Matching Utilities
 *
 * Helper functions for course equivalency, ECTS conversion, quality scoring,
 * and field matching in the Erasmus Journey platform.
 */

/**
 * Convert price to cents (handles both EUR decimals and cents)
 * @param price - Price as number (can be in EUR or cents)
 * @returns Price in cents
 */
export function convertToCents(price: number | null): number | null {
  if (price === null) return null;
  // If price > 1000, assume already in cents
  return price > 1000 ? Math.round(price) : Math.round(price * 100);
}

/**
 * Convert cents to EUR
 * @param cents - Price in cents
 * @returns Price in EUR
 */
export function centsToEUR(cents: number | null): number | null {
  if (cents === null) return null;
  return cents / 100;
}

/**
 * Format ECTS credits display
 * @param ects - ECTS credits
 * @returns Formatted string
 */
export function formatECTS(ects: number | null): string {
  if (ects === null) return "N/A";
  return `${ects} ECTS`;
}

/**
 * Calculate ECTS equivalency ratio
 * @param hostECTS - ECTS credits at host university
 * @param homeECTS - ECTS credits at home university
 * @returns Equivalency ratio (1.0 = perfect match)
 */
export function calculateECTSRatio(
  hostECTS: number | null,
  homeECTS: number | null,
): number | null {
  if (hostECTS === null || homeECTS === null || homeECTS === 0) return null;
  return hostECTS / homeECTS;
}

/**
 * Determine if ECTS credits are equivalent (within 10% tolerance)
 * @param hostECTS - ECTS credits at host university
 * @param homeECTS - ECTS credits at home university
 * @returns True if equivalent
 */
export function isECTSEquivalent(
  hostECTS: number | null,
  homeECTS: number | null,
): boolean {
  if (hostECTS === null || homeECTS === null) return false;
  const ratio = hostECTS / homeECTS;
  return ratio >= 0.9 && ratio <= 1.1;
}

/**
 * Get quality rating label
 * @param quality - Quality score (1-5)
 * @returns Label and color class
 */
export function getQualityLabel(quality: number | null): {
  label: string;
  color: string;
  className: string;
} {
  if (quality === null) {
    return { label: "Not Rated", color: "gray", className: "text-gray-600" };
  }

  if (quality >= 4.5) {
    return { label: "Excellent", color: "green", className: "text-green-600" };
  } else if (quality >= 4.0) {
    return { label: "Very Good", color: "blue", className: "text-blue-600" };
  } else if (quality >= 3.0) {
    return { label: "Good", color: "yellow", className: "text-yellow-600" };
  } else if (quality >= 2.0) {
    return { label: "Fair", color: "orange", className: "text-orange-600" };
  } else {
    return { label: "Poor", color: "red", className: "text-red-600" };
  }
}

/**
 * Get difficulty level badge
 * @param difficulty - Difficulty level string or number
 * @returns Badge info
 */
export function getDifficultyBadge(difficulty: string | number | null): {
  label: string;
  className: string;
  icon: string;
} {
  if (difficulty === null) {
    return {
      label: "Unknown",
      className: "bg-gray-100 text-gray-700",
      icon: "❓",
    };
  }

  const diffStr =
    typeof difficulty === "string" ? difficulty.toLowerCase() : "";
  const diffNum = typeof difficulty === "number" ? difficulty : 0;

  if (diffStr.includes("easy") || diffNum <= 2) {
    return {
      label: "Easy",
      className: "bg-green-100 text-green-700",
      icon: "😊",
    };
  } else if (
    diffStr.includes("medium") ||
    diffStr.includes("moderate") ||
    (diffNum > 2 && diffNum <= 3)
  ) {
    return {
      label: "Medium",
      className: "bg-yellow-100 text-yellow-700",
      icon: "🤔",
    };
  } else if (
    diffStr.includes("hard") ||
    diffStr.includes("difficult") ||
    diffNum > 3
  ) {
    return { label: "Hard", className: "bg-red-100 text-red-700", icon: "😰" };
  }

  return {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700",
    icon: "🤔",
  };
}

/**
 * Get study level badge
 * @param level - Study level (bachelor, master, phd)
 * @returns Badge info
 */
export function getStudyLevelBadge(level: string | null): {
  label: string;
  className: string;
  icon: string;
} {
  if (!level) {
    return {
      label: "Unknown",
      className: "bg-gray-100 text-gray-700",
      icon: "🎓",
    };
  }

  const levelLower = level.toLowerCase();

  if (levelLower.includes("bachelor") || levelLower.includes("undergraduate")) {
    return {
      label: "Bachelor",
      className: "bg-blue-100 text-blue-700",
      icon: "🎓",
    };
  } else if (levelLower.includes("master") || levelLower.includes("graduate")) {
    return {
      label: "Master",
      className: "bg-purple-100 text-purple-700",
      icon: "🎓",
    };
  } else if (levelLower.includes("phd") || levelLower.includes("doctoral")) {
    return { label: "PhD", className: "bg-red-100 text-red-700", icon: "🎓" };
  }

  return { label: level, className: "bg-gray-100 text-gray-700", icon: "🎓" };
}

/**
 * Calculate matching score between two courses
 * @param hostCourse - Host university course
 * @param homeCourse - Home university course
 * @returns Matching score (0-100)
 */
export function calculateMatchingScore(
  hostCourse: {
    name: string;
    code?: string | null;
    ects?: number | null;
    field?: string | null;
  },
  homeCourse: {
    name: string;
    code?: string | null;
    ects?: number | null;
    field?: string | null;
  },
): number {
  let score = 0;

  // Name similarity (40 points)
  const nameSimilarity = calculateStringSimilarity(
    hostCourse.name.toLowerCase(),
    homeCourse.name.toLowerCase(),
  );
  score += nameSimilarity * 40;

  // ECTS equivalency (30 points)
  if (isECTSEquivalent(hostCourse.ects, homeCourse.ects)) {
    score += 30;
  } else if (hostCourse.ects && homeCourse.ects) {
    const ectsDiff = Math.abs(hostCourse.ects - homeCourse.ects);
    if (ectsDiff <= 2) {
      score += 20;
    } else if (ectsDiff <= 5) {
      score += 10;
    }
  }

  // Field match (20 points)
  if (hostCourse.field && homeCourse.field) {
    const fieldSimilarity = calculateStringSimilarity(
      hostCourse.field.toLowerCase(),
      homeCourse.field.toLowerCase(),
    );
    score += fieldSimilarity * 20;
  }

  // Code similarity (10 points)
  if (hostCourse.code && homeCourse.code) {
    const codeSimilarity = calculateStringSimilarity(
      hostCourse.code.toLowerCase(),
      homeCourse.code.toLowerCase(),
    );
    score += codeSimilarity * 10;
  }

  return Math.round(score);
}

/**
 * Calculate string similarity (Jaro-Winkler inspired)
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score (0-1)
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  // Simple word-based similarity
  const words1 = str1.split(/\s+/).filter(Boolean);
  const words2 = str2.split(/\s+/).filter(Boolean);

  let matches = 0;
  const maxLength = Math.max(words1.length, words2.length);

  words1.forEach((word1) => {
    if (
      words2.some((word2) => word2.includes(word1) || word1.includes(word2))
    ) {
      matches++;
    }
  });

  return maxLength > 0 ? matches / maxLength : 0;
}

/**
 * Get agreement type badge
 * @param agreementType - Agreement type (BOTH, INCOMING, OUTGOING)
 * @returns Badge info
 */
export function getAgreementTypeBadge(agreementType: string): {
  label: string;
  className: string;
  icon: string;
} {
  const type = agreementType.toUpperCase();

  if (type === "BOTH" || type === "BILATERAL") {
    return {
      label: "Bilateral",
      className: "bg-green-100 text-green-700",
      icon: "🔄",
    };
  } else if (type === "INCOMING") {
    return {
      label: "Incoming Only",
      className: "bg-blue-100 text-blue-700",
      icon: "⬇️",
    };
  } else if (type === "OUTGOING") {
    return {
      label: "Outgoing Only",
      className: "bg-purple-100 text-purple-700",
      icon: "⬆️",
    };
  }

  return {
    label: agreementType,
    className: "bg-gray-100 text-gray-700",
    icon: "📝",
  };
}

/**
 * Format agreement duration
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Formatted duration
 */
export function formatAgreementDuration(
  startDate: string | null,
  endDate: string | null,
): string {
  if (!startDate && !endDate) return "Duration not specified";

  const start = startDate ? new Date(startDate).getFullYear() : "Unknown";
  const end = endDate ? new Date(endDate).getFullYear() : "Ongoing";

  return `${start} - ${end}`;
}

/**
 * Check if agreement is expiring soon (within 6 months)
 * @param endDate - End date string
 * @returns True if expiring soon
 */
export function isAgreementExpiring(endDate: string | null): boolean {
  if (!endDate) return false;

  const end = new Date(endDate);
  const now = new Date();
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  return end > now && end <= sixMonthsFromNow;
}

/**
 * Get field of study icon
 * @param field - Field of study
 * @returns Icon emoji
 */
export function getFieldIcon(field: string | null): string {
  if (!field) return "📚";

  const fieldLower = field.toLowerCase();

  if (fieldLower.includes("computer") || fieldLower.includes("software"))
    return "💻";
  if (fieldLower.includes("engineering")) return "⚙️";
  if (fieldLower.includes("business") || fieldLower.includes("management"))
    return "💼";
  if (fieldLower.includes("medicine") || fieldLower.includes("health"))
    return "🏥";
  if (fieldLower.includes("law")) return "⚖️";
  if (fieldLower.includes("art") || fieldLower.includes("design")) return "🎨";
  if (fieldLower.includes("music")) return "🎵";
  if (fieldLower.includes("science")) return "🔬";
  if (fieldLower.includes("math")) return "➗";
  if (fieldLower.includes("language") || fieldLower.includes("literature"))
    return "📖";
  if (fieldLower.includes("education")) return "👨‍🏫";
  if (fieldLower.includes("psychology")) return "🧠";
  if (fieldLower.includes("economics")) return "📊";
  if (fieldLower.includes("architecture")) return "🏛️";
  if (fieldLower.includes("biology")) return "🧬";
  if (fieldLower.includes("chemistry")) return "⚗️";
  if (fieldLower.includes("physics")) return "🔭";

  return "📚";
}

/**
 * Format exam types array
 * @param examTypes - Array of exam type strings
 * @returns Formatted string
 */
export function formatExamTypes(examTypes: string[]): string {
  if (examTypes.length === 0) return "Not specified";
  if (examTypes.length === 1) return examTypes[0];
  if (examTypes.length === 2) return examTypes.join(" and ");

  const last = examTypes[examTypes.length - 1];
  const others = examTypes.slice(0, -1);
  return `${others.join(", ")}, and ${last}`;
}

/**
 * Calculate recommended semester based on course availability
 * @param courseCount - Number of courses available
 * @param averageECTS - Average ECTS per course
 * @returns Recommended semester
 */
export function getRecommendedSemester(
  courseCount: number,
  averageECTS: number | null,
): {
  semester: string;
  reason: string;
} {
  const ects = averageECTS || 6;
  const semesterRequirement = 30; // Standard full semester

  const coursesNeeded = Math.ceil(semesterRequirement / ects);

  if (courseCount >= coursesNeeded * 2) {
    return {
      semester: "Full Academic Year",
      reason: `Excellent course variety (${courseCount} courses available)`,
    };
  } else if (courseCount >= coursesNeeded) {
    return {
      semester: "One Semester",
      reason: `Good course selection (${courseCount} courses available)`,
    };
  } else {
    return {
      semester: "Short Term / Summer",
      reason: `Limited courses (${courseCount} available)`,
    };
  }
}

/**
 * Get confidence indicator for statistics
 * @param sampleSize - Number of samples
 * @returns Confidence info
 */
export function getConfidenceLevel(sampleSize: number): {
  level: string;
  className: string;
  icon: string;
  description: string;
} {
  if (sampleSize >= 50) {
    return {
      level: "Very High",
      className: "text-green-600",
      icon: "✓✓✓",
      description: "Based on extensive data",
    };
  } else if (sampleSize >= 20) {
    return {
      level: "High",
      className: "text-blue-600",
      icon: "✓✓",
      description: "Reliable sample size",
    };
  } else if (sampleSize >= 10) {
    return {
      level: "Moderate",
      className: "text-yellow-600",
      icon: "✓",
      description: "Good sample size",
    };
  } else if (sampleSize >= 3) {
    return {
      level: "Low",
      className: "text-orange-600",
      icon: "~",
      description: "Small sample size",
    };
  } else {
    return {
      level: "Very Low",
      className: "text-red-600",
      icon: "?",
      description: "Insufficient data",
    };
  }
}
