import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

// Animation variants
export const animations = {
  // Entrance animations
  fadeIn: "animate-in fade-in duration-300",
  fadeInUp: "animate-in fade-in slide-in-from-bottom-4 duration-300",
  fadeInDown: "animate-in fade-in slide-in-from-top-4 duration-300",
  fadeInLeft: "animate-in fade-in slide-in-from-left-4 duration-300",
  fadeInRight: "animate-in fade-in slide-in-from-right-4 duration-300",

  // Scale animations
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-200",

  // Slide animations
  slideInFromTop: "animate-in slide-in-from-top-full duration-300",
  slideInFromBottom: "animate-in slide-in-from-bottom-full duration-300",
  slideInFromLeft: "animate-in slide-in-from-left-full duration-300",
  slideInFromRight: "animate-in slide-in-from-right-full duration-300",

  // Rotation animations
  rotateIn: "animate-in spin-in-180 duration-300",

  // Bounce animations
  bounceIn: "animate-bounce duration-1000",

  // Pulse animations
  pulse: "animate-pulse",

  // Custom stagger animations
  staggerChild: "animate-in fade-in slide-in-from-bottom-2 duration-300",
} as const;

// Hook for intersection observer animations
export function useInViewAnimation(threshold = 0.1, rootMargin = "0px") {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Disconnect observer after first intersection for performance
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  return { ref, isInView };
}

// Animated container component
export function AnimatedContainer({
  children,
  animation = "fadeInUp",
  delay = 0,
  duration = 300,
  className,
  ...props
}: {
  children: React.ReactNode;
  animation?: keyof typeof animations | string;
  delay?: number;
  duration?: number;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { ref, isInView } = useInViewAnimation();

  const animationClass =
    typeof animation === "string" && animation in animations
      ? animations[animation as keyof typeof animations]
      : animation;

  return (
    <div
      ref={ref}
      className={cn(isInView ? animationClass : "opacity-0", className)}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Staggered animation container
export function StaggeredContainer({
  children,
  staggerDelay = 100,
  animation = "fadeInUp",
  className,
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  animation?: keyof typeof animations | string;
  className?: string;
}) {
  const { ref, isInView } = useInViewAnimation();

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedContainer
          animation={animation}
          delay={isInView ? index * staggerDelay : 0}
          key={index}
        >
          {child}
        </AnimatedContainer>
      ))}
    </div>
  );
}

// Hover animation component
export function HoverCard({
  children,
  className,
  hoverScale = 1.02,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out cursor-pointer",
        "hover:shadow-lg hover:-translate-y-1",
        className,
      )}
      style={
        {
          "--hover-scale": hoverScale,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

// Loading animation component
export function LoadingSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className,
      )}
    />
  );
}

// Progress animation component
export function ProgressBar({
  progress,
  animated = true,
  className,
}: {
  progress: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
      <div
        className={cn(
          "h-full bg-blue-600 rounded-full",
          animated && "transition-all duration-300 ease-out",
        )}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

// Count-up animation component
export function CountUpAnimation({
  end,
  duration = 1000,
  suffix = "",
  prefix = "",
  className,
}: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInViewAnimation();

  useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const progress = Math.min(1, (duration - remaining) / duration);

      setCount(Math.floor(progress * end));

      if (remaining === 0) {
        clearInterval(timer);
        setCount(end);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

// Typewriter animation component
export function TypewriterText({
  text,
  speed = 50,
  className,
  onComplete,
}: {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const { ref, isInView } = useInViewAnimation();

  useEffect(() => {
    if (!isInView || isComplete) return;

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [isInView, text, speed, isComplete, onComplete]);

  return (
    <div ref={ref} className={className}>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </div>
  );
}

// Micro-interaction button
export function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses =
    "relative inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:scale-95",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:scale-95",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 active:scale-95",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && "pointer-events-none",
        className,
      )}
      disabled={loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}
