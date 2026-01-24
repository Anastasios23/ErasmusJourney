"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  repeat?: number;
}

export function MarqueeSection({
  children,
  className,
  speed = "normal",
  direction = "left",
  pauseOnHover = true,
  repeat = 2,
}: MarqueeSectionProps) {
  const speedClasses = {
    slow: "marquee-slow",
    normal: "",
    fast: "marquee-fast",
  };

  const directionClasses = {
    left: "",
    right: "marquee-reverse",
  };

  return (
    <div
      className={cn(
        "marquee-container",
        speedClasses[speed],
        directionClasses[direction],
        className,
      )}
    >
      <div
        className={cn("marquee-content", pauseOnHover && "hover:pause")}
        style={{
          animationPlayState: pauseOnHover ? undefined : "running",
        }}
      >
        {/* Original content */}
        {children}
        {/* Repeated content for seamless loop */}
        {Array.from({ length: repeat - 1 }).map((_, i) => (
          <React.Fragment key={i}>{children}</React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Pre-styled marquee for logos/partners
interface LogoMarqueeProps {
  logos: Array<{
    name: string;
    src?: string;
    icon?: React.ReactNode;
  }>;
  className?: string;
  speed?: "slow" | "normal" | "fast";
}

export function LogoMarquee({
  logos,
  className,
  speed = "normal",
}: LogoMarqueeProps) {
  return (
    <MarqueeSection speed={speed} className={className}>
      {logos.map((logo, index) => (
        <div
          key={index}
          className="flex items-center justify-center px-8 py-4 grayscale hover:grayscale-0 transition-all duration-300"
        >
          {logo.src ? (
            <img
              src={logo.src}
              alt={logo.name}
              className="h-8 w-auto object-contain"
            />
          ) : logo.icon ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              {logo.icon}
              <span className="font-medium">{logo.name}</span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {logo.name}
            </span>
          )}
        </div>
      ))}
    </MarqueeSection>
  );
}

// Pre-styled marquee for testimonials
interface TestimonialMarqueeProps {
  testimonials: Array<{
    quote: string;
    author: string;
    university?: string;
    destination?: string;
  }>;
  className?: string;
}

export function TestimonialMarquee({
  testimonials,
  className,
}: TestimonialMarqueeProps) {
  return (
    <div className={cn("testimonials-marquee", className)}>
      <MarqueeSection speed="slow" repeat={3}>
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-80 p-6 mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
              "{testimonial.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {testimonial.author.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {testimonial.author}
                </p>
                {(testimonial.university || testimonial.destination) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {testimonial.university}
                    {testimonial.university && testimonial.destination && " → "}
                    {testimonial.destination}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </MarqueeSection>
    </div>
  );
}

export default MarqueeSection;
