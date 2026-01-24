"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// FLASHLIGHT CARD - Mouse-tracking highlight effect
// ============================================================================
interface FlashlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  /** Intensity of the flashlight effect (0-1) */
  intensity?: number;
}

export function FlashlightCard({
  children,
  className,
  intensity = 0.06,
  ...props
}: FlashlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      cardRef.current.style.setProperty("--mouse-x", `${x}%`);
      cardRef.current.style.setProperty("--mouse-y", `${y}%`);
    },
    []
  );

  return (
    <div
      ref={cardRef}
      className={cn("flashlight-card", className)}
      onMouseMove={handleMouseMove}
      style={
        {
          "--flashlight-intensity": intensity,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// BORDER BEAM BUTTON - Animated border on hover
// ============================================================================
interface BorderBeamButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  /** Whether the button should have pill shape */
  pill?: boolean;
}

export function BorderBeamButton({
  children,
  className,
  pill = true,
  ...props
}: BorderBeamButtonProps) {
  return (
    <button
      className={cn(
        "border-beam relative inline-flex items-center justify-center gap-2 px-6 py-3",
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold",
        "transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25",
        pill ? "rounded-full" : "rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ============================================================================
// REVEAL ON SCROLL - Lightweight intersection observer
// ============================================================================
interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Animation type: 'reveal-up' | 'blur-in' | 'slide-up' */
  animation?: "reveal-up" | "blur-in" | "slide-up";
  /** Delay in milliseconds */
  delay?: number;
  /** Threshold for intersection (0-1) */
  threshold?: number;
}

export function RevealOnScroll({
  children,
  className,
  animation = "blur-in",
  delay = 0,
  threshold = 0.1,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  const animationClass = {
    "reveal-up": "animate-reveal-up",
    "blur-in": "animate-blur-in",
    "slide-up": "animate-slide-up",
  }[animation];

  return (
    <div
      ref={ref}
      className={cn(
        isVisible ? animationClass : "invisible",
        className
      )}
      style={{
        animationDelay: isVisible ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MARQUEE SECTION - Infinite scrolling content
// ============================================================================
interface MarqueeSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Speed: 'normal' | 'slow' */
  speed?: "normal" | "slow";
  /** Direction of scroll */
  direction?: "left" | "right";
  /** Enable pause on hover */
  pauseOnHover?: boolean;
}

export function MarqueeSection({
  children,
  className,
  speed = "normal",
  direction = "left",
  pauseOnHover = true,
}: MarqueeSectionProps) {
  const animationClass = speed === "slow" ? "animate-marquee-slow" : "animate-marquee";
  const directionStyle = direction === "right" ? { animationDirection: "reverse" as const } : {};

  return (
    <div
      className={cn(
        "overflow-hidden",
        pauseOnHover && "marquee-container",
        className
      )}
    >
      <div
        className={cn("flex w-max", animationClass)}
        style={directionStyle}
      >
        {/* Duplicate content for seamless loop */}
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAGGERED CONTAINER - Animate children with delay
// ============================================================================
interface StaggeredContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  /** Base animation class to apply */
  animation?: "reveal-up" | "blur-in" | "slide-up";
}

export function StaggeredContainer({
  children,
  className,
  animation = "blur-in",
  ...props
}: StaggeredContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const animationClass = {
    "reveal-up": "animate-reveal-up",
    "blur-in": "animate-blur-in",
    "slide-up": "animate-slide-up",
  }[animation];

  return (
    <div
      ref={ref}
      className={cn(
        isVisible && "stagger-children",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: cn(
              (child.props as any).className,
              isVisible ? animationClass : "invisible"
            ),
          });
        }
        return child;
      })}
    </div>
  );
}

// ============================================================================
// HOVER LIFT CARD - Simple lift effect on hover
// ============================================================================
interface HoverLiftCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function HoverLiftCard({
  children,
  className,
  ...props
}: HoverLiftCardProps) {
  return (
    <div className={cn("hover-lift", className)} {...props}>
      {children}
    </div>
  );
}
