"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BorderBeamButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  beamColor?: string;
}

export function BorderBeamButton({
  children,
  className,
  variant = "primary",
  size = "md",
  beamColor,
  ...props
}: BorderBeamButtonProps) {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
    secondary:
      "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
    outline:
      "bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-full font-semibold transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        "border-beam",
        className,
      )}
      style={
        beamColor
          ? ({
              "--beam-color": beamColor,
            } as React.CSSProperties)
          : undefined
      }
      {...props}
    >
      {/* Animated border beam */}
      <span
        className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          padding: "1px",
          background: `linear-gradient(90deg, transparent, ${beamColor || "rgba(99, 102, 241, 0.5)"}, ${beamColor || "rgba(139, 92, 246, 0.5)"}, transparent)`,
          backgroundSize: "200% 100%",
          animation: "border-beam 3s linear infinite",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

export default BorderBeamButton;
