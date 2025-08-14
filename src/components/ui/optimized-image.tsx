import React, { useState, useCallback, useRef, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "../../lib/utils";
import { Skeleton } from "./skeleton";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallback?: string;
  showSkeleton?: boolean;
  aspectRatio?: "square" | "video" | "wide" | number;
  lazy?: boolean;
  onLoadComplete?: () => void;
  onError?: () => void;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallback = "/images/placeholder.jpg",
  showSkeleton = true,
  aspectRatio,
  lazy = true,
  onLoadComplete,
  onError,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  }, [fallback, onError]);

  // Reset state when src changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageSrc(src);
  }, [src]);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[16/9]",
  };

  const aspectRatioClass =
    typeof aspectRatio === "string"
      ? aspectRatioClasses[aspectRatio]
      : aspectRatio
        ? `aspect-[${aspectRatio}]`
        : "";

  return (
    <div
      className={cn("relative overflow-hidden", aspectRatioClass, className)}
    >
      {isLoading && showSkeleton && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      <Image
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? "lazy" : "eager"}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "opacity-75",
        )}
        {...props}
      />

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
}

// Image gallery component with lazy loading
export function ImageGallery({
  images,
  className,
  itemClassName,
}: {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  itemClassName?: string;
}) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  }, []);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
    >
      {images.map((image, index) => (
        <div key={index} className={cn("relative group", itemClassName)}>
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            aspectRatio="video"
            onLoadComplete={() => handleImageLoad(index)}
            className="rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
            fill
          />
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 rounded-b-lg">
              <p className="text-sm">{image.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Avatar component with optimized loading
export function Avatar({
  src,
  alt,
  size = "md",
  fallbackInitials,
  className,
}: {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackInitials?: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-xl",
  };

  const handleError = () => {
    setHasError(true);
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full bg-gray-300 flex items-center justify-center font-medium text-gray-600",
          sizeClasses[size],
          className,
        )}
      >
        {fallbackInitials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden",
        sizeClasses[size],
        className,
      )}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        aspectRatio="square"
        onError={handleError}
        showSkeleton={false}
        className="object-cover"
      />
    </div>
  );
}

// Progressive image component for large images
export function ProgressiveImage({
  src,
  placeholder,
  alt,
  className,
  ...props
}: {
  src: string;
  placeholder?: string;
  alt: string;
  className?: string;
} & Omit<ImageProps, "src" | "alt">) {
  const [imgSrc, setImgSrc] = useState(placeholder || src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!placeholder) return;

    const img = new window.Image();
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src, placeholder]);

  return (
    <div className={cn("relative", className)}>
      <Image
        src={imgSrc}
        alt={alt}
        className={cn(
          "transition-all duration-500",
          !isLoaded && placeholder ? "blur-sm scale-105" : "blur-0 scale-100",
        )}
        {...props}
      />
    </div>
  );
}
