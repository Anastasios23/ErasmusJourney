/**
 * Form Design Utilities
 * Comprehensive utilities for consistent form styling across the Erasmus Journey platform
 */

export const formSpacing = {
  // Field spacing
  field: {
    vertical: "space-y-2", // Between label and input
    between: "space-y-4", // Between fields
    section: "space-y-6", // Between form sections
  },

  // Mobile-optimized spacing
  mobile: {
    field: "space-y-1.5",
    between: "space-y-3",
    section: "space-y-5",
    padding: "px-4 py-3",
  },

  // Desktop spacing
  desktop: {
    field: "md:space-y-2",
    between: "md:space-y-4",
    section: "md:space-y-6",
    padding: "md:px-6 md:py-4",
  },

  // Error message spacing
  error: {
    margin: "mt-1.5",
    padding: "px-1",
    lineHeight: "leading-relaxed",
  },

  // Helper text spacing
  helper: {
    margin: "mt-1",
    padding: "px-1",
    lineHeight: "leading-normal",
  },
} as const;

export const formLayout = {
  // Grid layouts for different screen sizes
  grid: {
    single: "grid grid-cols-1",
    double: "grid grid-cols-1 md:grid-cols-2",
    triple: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    responsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  },

  // Gap utilities
  gap: {
    tight: "gap-3",
    normal: "gap-4",
    loose: "gap-6",
    mobile: "gap-3 md:gap-4",
  },

  // Container widths
  container: {
    narrow: "max-w-2xl",
    normal: "max-w-4xl",
    wide: "max-w-6xl",
    full: "max-w-full",
  },

  // Form sections
  section: {
    container: "space-y-6",
    header: "space-y-2",
    content: "space-y-4",
  },
} as const;

export const formStates = {
  // Input states
  input: {
    default: "border-input bg-background text-foreground",
    focus:
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    error: "border-red-500 focus-visible:ring-red-500 bg-red-50/50",
    disabled:
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200",
    success: "border-green-500 focus-visible:ring-green-500 bg-green-50/50",
  },

  // Label states
  label: {
    default: "text-sm font-medium text-gray-700",
    required: "text-sm font-medium text-gray-700",
    error: "text-sm font-medium text-red-700",
    disabled: "text-sm font-medium text-gray-400",
  },

  // Message states
  message: {
    error: "text-sm text-red-500 leading-relaxed",
    helper: "text-sm text-gray-500 leading-relaxed",
    success: "text-sm text-green-600 leading-relaxed",
    warning: "text-sm text-yellow-600 leading-relaxed",
  },

  // Disabled field indicators
  disabled: {
    hint: "text-xs text-gray-400 italic flex items-center space-x-1",
    overlay: "absolute inset-0 bg-gray-100/30 pointer-events-none rounded-md",
  },
} as const;

export const formAnimations = {
  // Transition classes
  transition: {
    default: "transition-colors duration-200",
    fast: "transition-all duration-150",
    smooth: "transition-all duration-300 ease-in-out",
  },

  // Focus animations
  focus: {
    ring: "focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-200",
    scale: "focus:scale-[1.02] transition-transform duration-150",
  },

  // Error animations
  error: {
    shake: "animate-shake", // You'll need to define this in Tailwind config
    fadeIn: "animate-fade-in",
  },
} as const;

export const responsiveFormDesign = {
  // Mobile-first form styling
  mobile: {
    input: "text-base px-3 py-3", // Larger touch targets
    select: "text-base px-3 py-3 min-h-[44px]",
    button: "text-base px-4 py-3 min-h-[44px]",
    spacing: "space-y-4",
    container: "px-4 py-6",
  },

  // Tablet adjustments
  tablet: {
    input: "md:text-sm md:px-3 md:py-2",
    select: "md:text-sm md:px-3 md:py-2 md:min-h-[40px]",
    button: "md:text-sm md:px-4 md:py-2 md:min-h-[40px]",
    spacing: "md:space-y-4",
    container: "md:px-6 md:py-6",
  },

  // Desktop refinements
  desktop: {
    input: "lg:text-sm",
    spacing: "lg:space-y-4",
    container: "lg:px-8 lg:py-8",
  },
} as const;

// Helper functions for dynamic class generation
export const getFieldClasses = (options: {
  error?: boolean;
  disabled?: boolean;
  mobile?: boolean;
}) => {
  const { error, disabled, mobile } = options;

  const baseClasses = [
    "flex w-full rounded-md border bg-background text-sm ring-offset-background",
    "placeholder:text-muted-foreground",
    formStates.input.focus,
    formAnimations.transition.default,
  ];

  if (mobile) {
    baseClasses.push(responsiveFormDesign.mobile.input);
    baseClasses.push(responsiveFormDesign.tablet.input);
  } else {
    baseClasses.push("h-10 px-3 py-2");
  }

  if (error) {
    baseClasses.push(formStates.input.error);
  } else if (disabled) {
    baseClasses.push(formStates.input.disabled);
  } else {
    baseClasses.push(formStates.input.default);
  }

  return baseClasses.join(" ");
};

export const getSelectClasses = (options: {
  error?: boolean;
  disabled?: boolean;
  mobile?: boolean;
}) => {
  const { error, disabled, mobile } = options;

  const baseClasses = [
    "flex w-full items-center justify-between rounded-md border bg-background text-sm ring-offset-background",
    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed [&>span]:line-clamp-1",
    formAnimations.transition.default,
  ];

  if (mobile) {
    baseClasses.push(responsiveFormDesign.mobile.select);
    baseClasses.push(responsiveFormDesign.tablet.select);
  } else {
    baseClasses.push("h-10 px-3 py-2");
  }

  if (error) {
    baseClasses.push(formStates.input.error);
  } else if (disabled) {
    baseClasses.push(formStates.input.disabled);
  } else {
    baseClasses.push(formStates.input.default);
  }

  return baseClasses.join(" ");
};

export const getLabelClasses = (options: {
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
}) => {
  const { error, disabled, required } = options;

  if (error) return formStates.label.error;
  if (disabled) return formStates.label.disabled;
  return required ? formStates.label.required : formStates.label.default;
};

// Predefined form patterns
export const formPatterns = {
  // Standard two-column form
  twoColumn: {
    container: "grid grid-cols-1 md:grid-cols-2 gap-4",
    fullWidth: "md:col-span-2",
  },

  // Personal information section
  personalInfo: {
    nameRow: "grid grid-cols-1 sm:grid-cols-2 gap-4",
    contactRow: "grid grid-cols-1 md:grid-cols-2 gap-4",
    addressRow: "grid grid-cols-1 gap-4",
  },

  // Academic information section
  academicInfo: {
    institutionRow: "grid grid-cols-1 md:grid-cols-2 gap-4",
    detailsRow: "grid grid-cols-1 md:grid-cols-3 gap-4",
  },

  // Form navigation
  navigation: {
    container:
      "flex justify-between items-center pt-6 border-t border-gray-200",
    buttonGroup: "flex space-x-3",
  },
} as const;

// Accessibility utilities
export const a11yClasses = {
  // Screen reader classes
  srOnly: "sr-only",

  // Focus management
  focusVisible:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  focusWithin: "focus-within:ring-2 focus-within:ring-offset-2",

  // Error announcement
  errorRole: "role-alert",

  // Required field indicators
  requiredIndicator: "aria-label-required",
} as const;
