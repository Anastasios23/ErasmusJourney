/**
 * Responsive Layout Utilities
 * Ensures consistent responsive behavior across different screen sizes
 */

/**
 * Responsive grid layouts for common patterns
 */
export const GRID_LAYOUTS = {
  // Two column desktop, single column mobile
  twoColumn: "grid grid-cols-1 lg:grid-cols-2 gap-6",

  // Three column desktop, single column mobile with intermediate tablet layout
  threeColumn: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",

  // Four column desktop with progressive scaling
  fourColumn:
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",

  // Sidebar layout (25% sidebar, 75% content on desktop)
  sidebar: "grid grid-cols-1 lg:grid-cols-4 gap-8",
  sidebarMain: "lg:col-span-3 order-1 lg:order-2",
  sidebarAside: "lg:col-span-1 order-2 lg:order-1",

  // Content with sticky sidebar
  contentWithSidebar: "grid grid-cols-1 lg:grid-cols-4 gap-8",
  mainContent: "lg:col-span-3",
  stickySidebar: "lg:col-span-1",
} as const;

/**
 * Responsive padding and margins
 */
export const RESPONSIVE_SPACING = {
  section: "px-4 sm:px-6 lg:px-8 py-8 lg:py-12",
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  card: "p-4 sm:p-6",
  hero: "py-12 sm:py-16 lg:py-20",
} as const;

/**
 * Responsive text sizes
 */
export const RESPONSIVE_TEXT = {
  hero: "text-3xl sm:text-4xl lg:text-6xl",
  heading: "text-2xl sm:text-3xl lg:text-4xl",
  subheading: "text-xl sm:text-2xl",
  body: "text-base sm:text-lg",
  nav: "text-sm sm:text-base",
} as const;

/**
 * Mobile-first navigation patterns
 */
export const NAVIGATION = {
  desktop: "hidden md:flex",
  mobile: "md:hidden",
  mobileMenu: "fixed inset-0 z-50 md:hidden",
  overlay: "fixed inset-0 bg-black/50 md:hidden",
} as const;

/**
 * Form layout responsive patterns
 */
export const FORM_LAYOUTS = {
  singleColumn: "space-y-6",
  twoColumn: "grid grid-cols-1 md:grid-cols-2 gap-6",
  threeColumn: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  mixed: "space-y-6", // Can be customized per form section
} as const;

/**
 * Card responsive behavior
 */
export const CARD_RESPONSIVE = {
  base: "w-full",
  hover: "transition-all duration-200 hover:shadow-lg",
  mobile: "mx-4 sm:mx-0", // Handles mobile margin
  stack: "space-y-4 sm:space-y-6", // Stacked cards spacing
} as const;

/**
 * Image responsive patterns
 */
export const IMAGE_RESPONSIVE = {
  hero: "aspect-video w-full object-cover",
  thumbnail: "aspect-square w-full object-cover",
  profile: "aspect-square w-full object-cover rounded-full",
  banner: "aspect-[3/1] w-full object-cover",
} as const;

/**
 * Utility to generate responsive classes for sidebar behavior
 */
export const getSidebarClasses = (position: "left" | "right" = "left") => {
  const baseClasses = "lg:col-span-1";
  const orderClasses =
    position === "left"
      ? "order-2 lg:order-1" // Sidebar appears after content on mobile
      : "order-2 lg:order-2"; // Sidebar appears after content on all sizes

  return `${baseClasses} ${orderClasses}`;
};

/**
 * Utility for responsive button sizing
 */
export const getButtonResponsive = (size: "sm" | "md" | "lg" = "md") => {
  const sizeMap = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base sm:px-6 sm:py-3",
    lg: "px-6 py-3 text-lg sm:px-8 sm:py-4",
  };

  return sizeMap[size];
};

/**
 * Breakpoint utilities for conditional rendering
 */
export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Mobile-first media queries (for use in CSS-in-JS if needed)
 */
export const MEDIA_QUERIES = {
  sm: "@media (min-width: 640px)",
  md: "@media (min-width: 768px)",
  lg: "@media (min-width: 1024px)",
  xl: "@media (min-width: 1280px)",
  "2xl": "@media (min-width: 1536px)",
} as const;

export default {
  GRID_LAYOUTS,
  RESPONSIVE_SPACING,
  RESPONSIVE_TEXT,
  NAVIGATION,
  FORM_LAYOUTS,
  CARD_RESPONSIVE,
  IMAGE_RESPONSIVE,
  getSidebarClasses,
  getButtonResponsive,
  BREAKPOINTS,
  MEDIA_QUERIES,
};
