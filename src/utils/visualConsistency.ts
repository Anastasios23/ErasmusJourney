/**
 * Visual Consistency & Accessibility Utilities
 * Ensures consistent styling and proper contrast ratios throughout the application
 */

/**
 * Standardized color palette following the brand's blue theme
 */
export const BRAND_COLORS = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6", // Main brand blue
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  status: {
    success: "#059669", // green-600
    warning: "#d97706", // amber-600
    error: "#dc2626", // red-600
    info: "#2563eb", // blue-600
  },
} as const;

/**
 * Ensures text has sufficient contrast against backgrounds
 */
export const getContrastClass = (bgColor: "dark" | "light" | "brand") => {
  switch (bgColor) {
    case "dark":
      return "text-white";
    case "light":
      return "text-gray-900";
    case "brand":
      return "text-white drop-shadow-sm";
    default:
      return "text-gray-900";
  }
};

/**
 * Consistent spacing scale following Tailwind's system
 */
export const SPACING = {
  xs: "space-x-1 space-y-1",
  sm: "space-x-2 space-y-2",
  md: "space-x-4 space-y-4",
  lg: "space-x-6 space-y-6",
  xl: "space-x-8 space-y-8",
} as const;

/**
 * Consistent border radius for components
 */
export const BORDER_RADIUS = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
} as const;

/**
 * Consistent shadow levels
 */
export const SHADOWS = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
} as const;

/**
 * Hover and focus states for interactive elements
 */
export const INTERACTIVE_STATES = {
  hover: "hover:scale-105 transition-transform duration-200",
  focus: "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  active: "active:scale-95",
  disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
} as const;

/**
 * Card component styling consistency
 */
export const CARD_STYLES = {
  base: "bg-white rounded-lg shadow-sm border border-gray-200",
  hover: "hover:shadow-md transition-shadow duration-200",
  interactive:
    "cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200",
  featured: "bg-white rounded-lg shadow-lg border border-blue-200",
} as const;

/**
 * Typography scale for consistent text sizing
 */
export const TEXT_STYLES = {
  hero: "text-4xl md:text-6xl font-bold tracking-tight",
  heading: "text-2xl md:text-3xl font-bold",
  subheading: "text-xl md:text-2xl font-semibold",
  body: "text-base leading-relaxed",
  small: "text-sm text-gray-600",
  caption: "text-xs text-gray-500",
} as const;

/**
 * Utility function to ensure proper contrast on image overlays
 */
export const getImageOverlay = (intensity: "light" | "medium" | "dark") => {
  switch (intensity) {
    case "light":
      return "bg-black/20";
    case "medium":
      return "bg-black/40";
    case "dark":
      return "bg-black/60";
    default:
      return "bg-black/30";
  }
};

export default {
  BRAND_COLORS,
  getContrastClass,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  INTERACTIVE_STATES,
  CARD_STYLES,
  TEXT_STYLES,
  getImageOverlay,
};
