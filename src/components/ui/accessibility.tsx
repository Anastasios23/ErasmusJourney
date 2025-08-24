import React from "react";
import { cn } from "@/lib/utils";

// Screen Reader Only Text
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return (
    <span className={cn("sr-only", className)}>
      {children}
    </span>
  );
}

// Skip Navigation Link
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "absolute left-0 top-0 z-50 bg-blue-600 text-white px-4 py-2 text-sm font-medium",
        "transform -translate-y-full focus:translate-y-0 transition-transform",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  );
}

// Focus Trap for Modal/Dropdown Content
interface FocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export function FocusTrap({ children, isActive = true, className }: FocusTrapProps) {
  const trapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive || !trapRef.current) return;

    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Find the trigger element and focus it
        const trigger = document.querySelector('[aria-expanded="true"]') as HTMLElement;
        trigger?.focus();
      }
    };

    trapRef.current.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscapeKey);

    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      trapRef.current?.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return (
    <div ref={trapRef} className={className}>
      {children}
    </div>
  );
}

// Announcement Region for Dynamic Content
interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

export function Announcement({ message, priority = 'polite', className }: AnnouncementProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={cn("sr-only", className)}
    >
      {message}
    </div>
  );
}

// High Contrast Mode Detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

// Reduced Motion Detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Accessible Button with Loading State
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleButton({ 
  isLoading, 
  loadingText = "Loading...", 
  children, 
  className,
  ...props 
}: AccessibleButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading}
      className={cn(
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {isLoading ? (
        <>
          <ScreenReaderOnly>{loadingText}</ScreenReaderOnly>
          <span aria-hidden="true">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Mobile Touch Target Wrapper
interface TouchTargetProps {
  children: React.ReactNode;
  className?: string;
  minSize?: number; // in pixels, default 44px (Apple/Google guidelines)
}

export function TouchTarget({ children, className, minSize = 44 }: TouchTargetProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center",
        className
      )}
      style={{ minWidth: minSize, minHeight: minSize }}
    >
      {children}
    </div>
  );
}

// Responsive Text Utility Hook
export function useResponsiveText() {
  const [fontSize, setFontSize] = React.useState('base');

  React.useEffect(() => {
    const updateFontSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setFontSize('sm');
      } else if (width < 1024) {
        setFontSize('base');
      } else {
        setFontSize('lg');
      }
    };

    updateFontSize();
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, []);

  return fontSize;
}

// Keyboard Navigation Helper
interface KeyboardNavProps {
  children: React.ReactNode;
  onEscape?: () => void;
  onEnter?: () => void;
  className?: string;
}

export function KeyboardNav({ children, onEscape, onEnter, className }: KeyboardNavProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onEscape?.();
        break;
      case 'Enter':
        onEnter?.();
        break;
    }
  };

  return (
    <div
      className={className}
      onKeyDown={handleKeyDown}
      role="navigation"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

// Color Contrast Utilities
export const contrastColors = {
  // WCAG AA compliant color combinations
  highContrast: {
    text: 'text-gray-900',
    background: 'bg-white',
    border: 'border-gray-900'
  },
  normalContrast: {
    text: 'text-gray-700',
    background: 'bg-gray-50', 
    border: 'border-gray-300'
  }
} as const;

// Accessible Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormLabel({ required, children, className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-gray-700 mb-1",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <>
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          <ScreenReaderOnly>(required)</ScreenReaderOnly>
        </>
      )}
    </label>
  );
}

// Export all accessibility utilities
export const a11y = {
  ScreenReaderOnly,
  SkipLink,
  FocusTrap,
  Announcement,
  AccessibleButton,
  TouchTarget,
  KeyboardNav,
  FormLabel,
  useHighContrastMode,
  useReducedMotion,
  useResponsiveText,
  contrastColors
} as const;

export default a11y;
