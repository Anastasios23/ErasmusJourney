// Enhanced Design System for Erasmus Journey Platform

// Spacing Scale - Consistent spacing throughout the app
export const spacing = {
  // Component internal spacing
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px  
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  '5xl': '6rem',   // 96px
  
  // Layout spacing
  section: '4rem',     // Between major sections
  container: '2rem',   // Container padding
  card: '1.5rem',      // Card internal padding
  stack: '1rem',       // Vertical spacing in stacks
} as const;

// Typography Scale
export const typography = {
  // Headings
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
  h2: 'text-2xl md:text-3xl lg:text-4xl font-bold', 
  h3: 'text-xl md:text-2xl font-semibold',
  h4: 'text-lg md:text-xl font-semibold',
  h5: 'text-base md:text-lg font-medium',
  h6: 'text-sm md:text-base font-medium',
  
  // Body text
  body: 'text-base leading-relaxed',
  bodyLarge: 'text-lg leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
  
  // Special text
  lead: 'text-lg md:text-xl text-gray-600 leading-relaxed',
  muted: 'text-sm text-gray-600',
  label: 'text-sm font-medium text-gray-700',
} as const;

// Color Semantic Tokens
export const semanticColors = {
  // Status colors
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200', 
    text: 'text-green-800',
    accent: 'text-green-600'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800', 
    accent: 'text-yellow-600'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    accent: 'text-red-600'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    accent: 'text-blue-600'
  },
  
  // Brand colors
  primary: {
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-white',
    textDark: 'text-blue-900'
  },
  
  // Neutral colors
  neutral: {
    bg: 'bg-gray-50',
    bgCard: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textMuted: 'text-gray-600'
  }
} as const;

// Component Variants
export const componentVariants = {
  // Card variants
  card: {
    default: 'bg-white rounded-lg border border-gray-200 shadow-sm',
    elevated: 'bg-white rounded-xl shadow-lg border border-gray-100',
    interactive: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
    featured: 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm'
  },
  
  // Button intents
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    ghost: 'hover:bg-gray-100 text-gray-700',
    link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline'
  },
  
  // Badge variants  
  badge: {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800', 
    danger: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent'
  }
} as const;

// Layout Utilities
export const layouts = {
  // Container widths
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  containerNarrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  containerWide: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',
  
  // Grid layouts
  gridAuto: 'grid grid-cols-1 gap-6',
  grid2: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  
  // Flex layouts
  flexBetween: 'flex items-center justify-between',
  flexCenter: 'flex items-center justify-center',
  flexStart: 'flex items-center justify-start',
  flexCol: 'flex flex-col',
  flexColCenter: 'flex flex-col items-center',
  
  // Spacing
  section: 'py-16 lg:py-24',
  sectionSm: 'py-8 lg:py-12',
  stack: 'space-y-4',
  stackSm: 'space-y-2',
  stackLg: 'space-y-6',
} as const;

// Interactive States
export const interactiveStates = {
  hover: 'transition-all duration-200 hover:scale-105',
  hoverShadow: 'transition-shadow duration-200 hover:shadow-lg',
  hoverTranslate: 'transition-transform duration-200 hover:-translate-y-1',
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'
} as const;

// Responsive Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Animation Utilities
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin'
} as const;

// Utility Functions
export function createClasses(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getResponsiveText(base: string, md?: string, lg?: string): string {
  const classes = [base];
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  return classes.join(' ');
}

export function getSpacingClass(size: keyof typeof spacing): string {
  return `p-${spacing[size]}`;
}

// Content Hierarchy Helpers
export const contentHierarchy = {
  // Page structure
  pageHeader: {
    container: 'text-center mb-12 lg:mb-16',
    title: typography.h1 + ' text-gray-900 mb-4',
    subtitle: typography.lead + ' max-w-3xl mx-auto'
  },
  
  // Section structure  
  sectionHeader: {
    container: 'text-center mb-8 lg:mb-12',
    title: typography.h2 + ' text-gray-900 mb-4',
    subtitle: typography.bodyLarge + ' text-gray-600 max-w-2xl mx-auto'
  },
  
  // Card structure
  cardHeader: {
    container: 'mb-4',
    title: typography.h4 + ' text-gray-900 mb-2',
    subtitle: typography.muted
  }
} as const;

// Export all design tokens
export const designSystem = {
  spacing,
  typography,
  semanticColors,
  componentVariants,
  layouts,
  interactiveStates,
  breakpoints,
  animations,
  contentHierarchy,
  // Utility functions
  createClasses,
  getResponsiveText,
  getSpacingClass
} as const;

export default designSystem;
