"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

interface ContentCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
}

export function ContentCarousel<T>({
  items,
  renderItem,
  className,
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showIndicators = true,
}: ContentCarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [items.length, isAnimating]);

  const goToPrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [items.length, isAnimating]);

  const goToIndex = useCallback(
    (index: number) => {
      if (isAnimating || index === currentIndex) return;
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [currentIndex, isAnimating],
  );

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, goToNext, items.length]);

  if (items.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Carousel content */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {items.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation controls */}
      {showControls && items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors"
            aria-label="Previous"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-colors"
            aria-label="Next"
          >
            <Icon icon="solar:alt-arrow-right-linear" className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && items.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "w-6 bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Card carousel variant with multiple visible items
interface CardCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  visibleItems?: number;
  gap?: number;
}

export function CardCarousel<T>({
  items,
  renderItem,
  className,
  visibleItems = 3,
  gap = 16,
}: CardCarouselProps<T>) {
  const [startIndex, setStartIndex] = useState(0);
  const maxIndex = Math.max(0, items.length - visibleItems);

  const goToNext = () => {
    setStartIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const goToPrev = () => {
    setStartIndex((prev) => Math.max(prev - 1, 0));
  };

  if (items.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            gap: `${gap}px`,
            transform: `translateX(-${startIndex * (100 / visibleItems + gap / visibleItems)}%)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: `calc(${100 / visibleItems}% - ${(gap * (visibleItems - 1)) / visibleItems}px)`,
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      {items.length > visibleItems && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={goToPrev}
            disabled={startIndex === 0}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            disabled={startIndex >= maxIndex}
            className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon icon="solar:alt-arrow-right-linear" className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ContentCarousel;
