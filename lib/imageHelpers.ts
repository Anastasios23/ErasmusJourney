/**
 * Image Helper Utilities for Erasmus Journey App
 * Handles fallback images, optimization, and reliable image loading
 */

export interface ImageSource {
  url: string;
  alt: string;
  credit?: string;
  fallbackUrl?: string;
}

// Reliable fallback images from Unsplash with stable IDs
export const FALLBACK_IMAGES = {
  destinations: {
    europe:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=600&fit=crop&auto=format",
    city: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&auto=format",
    university:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop&auto=format",
    default:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&auto=format",
  },
  placeholder: "/placeholder.svg",
  error:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zOTkuNSAzMDBIMzk5LjVNMzk5LjUgMzAwSDM5OS41TTM5OS41IDMwMEgzOTkuNU0zOTkuNSAzMDBIMzk5LjVNMzk5LjUgMzAwSDM5OS41TTM5OS41IDMwMEgzOTkuNSIgc3Ryb2tlPSIjOUM5Q0E0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K",
};

/**
 * Generate optimized image URL with fallbacks
 */
export function getOptimizedImageUrl(
  originalUrl: string | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    fallbackType?: keyof typeof FALLBACK_IMAGES.destinations;
  } = {},
): string {
  const {
    width = 800,
    height = 600,
    quality = 80,
    fallbackType = "default",
  } = options;

  if (!originalUrl) {
    return FALLBACK_IMAGES.destinations[fallbackType];
  }

  // If it's already an Unsplash URL, optimize it
  if (originalUrl.includes("unsplash.com")) {
    const baseUrl = originalUrl.split("?")[0];
    return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format&q=${quality}`;
  }

  // If it's a local image, return as is
  if (originalUrl.startsWith("/")) {
    return originalUrl;
  }

  // For other URLs, return original or fallback
  return originalUrl || FALLBACK_IMAGES.destinations[fallbackType];
}

/**
 * Get destination-specific image based on location/type
 */
export function getDestinationImage(destination: {
  name?: string;
  country?: string;
  imageUrl?: string;
}): ImageSource {
  const { name, country, imageUrl } = destination;

  // Use provided image first
  if (imageUrl) {
    return {
      url: getOptimizedImageUrl(imageUrl),
      alt: `${name || "Destination"} - Study abroad location`,
      fallbackUrl: FALLBACK_IMAGES.destinations.default,
    };
  }

  // Generate appropriate fallback based on location
  let fallbackType: keyof typeof FALLBACK_IMAGES.destinations = "default";

  if (
    country?.toLowerCase().includes("germany") ||
    country?.toLowerCase().includes("france") ||
    country?.toLowerCase().includes("italy")
  ) {
    fallbackType = "europe";
  }

  return {
    url: FALLBACK_IMAGES.destinations[fallbackType],
    alt: `${name || "Study destination"} - ${country || "International"} study location`,
    fallbackUrl: FALLBACK_IMAGES.destinations.default,
  };
}

/**
 * Image component props with error handling
 */
export interface SafeImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Validate if image URL is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Batch validate multiple image URLs
 */
export async function validateImageUrls(
  urls: string[],
): Promise<Record<string, boolean>> {
  const results = await Promise.allSettled(
    urls.map((url) => validateImageUrl(url)),
  );

  return urls.reduce(
    (acc, url, index) => {
      const result = results[index];
      acc[url] = result.status === "fulfilled" ? result.value : false;
      return acc;
    },
    {} as Record<string, boolean>,
  );
}
