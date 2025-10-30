/**
 * Utility functions for consistent date formatting across server and client
 * to prevent hydration errors
 */

/**
 * Format a date consistently across server and client
 * Uses ISO format to avoid locale differences
 */
export function formatDate(
  date: Date | string | null | undefined,
  options?: {
    includeTime?: boolean;
    format?: "short" | "long";
  },
): string {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "Invalid Date";

  const { includeTime = false, format = "short" } = options || {};

  if (format === "long") {
    // Always use en-US locale for consistency
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(includeTime && {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }

  // Short format: YYYY-MM-DD (ISO format, no locale issues)
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Format date for display in a user-friendly way
 * Safe for SSR - always returns consistent format
 */
export function formatDisplayDate(
  date: Date | string | null | undefined,
): string {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "Invalid Date";

  // Use consistent en-US format
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 * Client-side only to avoid hydration mismatches
 */
export function getRelativeTime(
  date: Date | string | null | undefined,
): string {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "Invalid Date";

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return formatDisplayDate(dateObj);
}
