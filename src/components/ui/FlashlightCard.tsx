"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface FlashlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  borderGlow?: boolean;
}

export function FlashlightCard({
  children,
  className,
  glowColor = "rgba(99, 102, 241, 0.15)",
  glowSize = 300,
  borderGlow = false,
  ...props
}: FlashlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Flashlight glow effect */}
      <div
        className="pointer-events-none absolute transition-opacity duration-300"
        style={{
          width: glowSize,
          height: glowSize,
          left: mousePosition.x - glowSize / 2,
          top: mousePosition.y - glowSize / 2,
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          opacity: isHovering ? 1 : 0,
        }}
      />

      {/* Border glow effect */}
      {borderGlow && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(${glowSize / 2}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`,
            opacity: isHovering ? 1 : 0,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default FlashlightCard;
