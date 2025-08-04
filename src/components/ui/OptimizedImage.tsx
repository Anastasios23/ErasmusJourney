import React, { useState } from "react";
import Image from "next/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  lazy?: boolean;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  fallbacks?: string[]; // Array of fallback image URLs
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  lazy = true,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  fill = false,
  fallbacks = [],
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);

  // Build array of all possible sources: original + fallbacks
  const allSources = [
    src,
    ...fallbacks,
    "/images/destinations/placeholder.svg",
  ];
  const currentSrc = allSources[currentSrcIndex];

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);

    // Try next fallback if available
    if (currentSrcIndex < allSources.length - 1) {
      setCurrentSrcIndex((prev) => prev + 1);
      setIsLoading(true); // Start loading next image
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-blue-600 text-2xl mb-2">🏛️</div>
          <span className="text-blue-700 text-sm font-medium">
            Destination Image
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${!fill ? className : ""}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
      <Image
        src={currentSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        className={`transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${fill ? className : ""}`}
        priority={priority}
        loading={priority ? undefined : lazy ? "lazy" : "eager"}
        sizes={sizes}
        quality={quality}
        onLoad={handleLoad}
        onError={handleError}
        key={currentSrc} // Force re-render when source changes
      />
    </div>
  );
};
