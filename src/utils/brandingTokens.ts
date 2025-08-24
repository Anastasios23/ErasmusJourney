// Branding and Design Tokens for Erasmus Journey Platform
// Consistent branding elements and accessibility-compliant colors

export const brandingTokens = {
  // Logo & Brand Identity
  brand: {
    name: "Erasmus Journey",
    tagline: "Cyprus Edition • EU Programme",
    shortTagline: "Cyprus Edition",
    colors: {
      primary: "#003399", // EU Blue
      secondary: "#FFD700", // EU Gold
      accent: "#20B2AA", // Mediterranean Teal
      bronze: "#CD7F32", // Heritage Bronze
    },
  },

  // Typography Hierarchy
  typography: {
    display: "font-display", // Outfit for headings and brand
    body: "font-sans", // Inter for body text
    sizes: {
      xs: "text-xs", // 12px
      sm: "text-sm", // 14px
      base: "text-base", // 16px
      lg: "text-lg", // 18px
      xl: "text-xl", // 20px
      "2xl": "text-2xl", // 24px
    },
    weights: {
      light: "font-light", // 300
      normal: "font-normal", // 400
      medium: "font-medium", // 500
      semibold: "font-semibold", // 600
      bold: "font-bold", // 700
      extrabold: "font-extrabold", // 800
    },
  },

  // WCAG AA Compliant Colors
  colors: {
    // High contrast text for accessibility
    text: {
      primary: "text-gray-900 dark:text-gray-100", // 4.5:1 contrast
      secondary: "text-gray-700 dark:text-gray-200", // 4.5:1 contrast
      tertiary: "text-gray-600 dark:text-gray-300", // 4.5:1 contrast
      muted: "text-gray-500 dark:text-gray-400", // 3:1 contrast (large text only)
      accent: "text-blue-600 dark:text-blue-400", // 4.5:1 contrast
      link: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
    },

    // Background variants
    background: {
      primary: "bg-white dark:bg-gray-900",
      secondary: "bg-gray-50 dark:bg-gray-800",
      accent: "bg-blue-50 dark:bg-blue-900/20",
      muted: "bg-gray-100 dark:bg-gray-700",
    },

    // Interactive states
    interactive: {
      hover: "hover:bg-gray-100 dark:hover:bg-gray-800",
      active:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      focus:
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    },

    // Borders
    border: {
      default: "border-gray-200 dark:border-gray-700",
      accent: "border-blue-200 dark:border-blue-800",
      muted: "border-gray-100 dark:border-gray-600",
    },
  },

  // Spacing and Layout
  spacing: {
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    "3xl": "32px",
    "4xl": "48px",
  },

  // Component-specific tokens
  components: {
    header: {
      height: "h-16",
      background: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
      border: "border-b border-gray-200 dark:border-gray-700",
    },
    card: {
      background: "bg-white dark:bg-gray-800",
      border: "border border-gray-200 dark:border-gray-700",
      shadow: "shadow-sm",
      radius: "rounded-lg",
    },
    button: {
      primary:
        "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white",
      secondary:
        "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600",
    },
  },

  // Accessibility helpers
  accessibility: {
    screenReaderOnly: "sr-only",
    focusVisible:
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
    skipLink:
      "absolute -top-full left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-md focus:top-4 transition-all",
  },
};

// Helper functions for consistent class application
export const getTextColor = (
  variant: keyof typeof brandingTokens.colors.text,
) => {
  return brandingTokens.colors.text[variant];
};

export const getBackgroundColor = (
  variant: keyof typeof brandingTokens.colors.background,
) => {
  return brandingTokens.colors.background[variant];
};

export const getInteractiveState = (
  variant: keyof typeof brandingTokens.colors.interactive,
) => {
  return brandingTokens.colors.interactive[variant];
};
