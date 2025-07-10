"use client";

import { useEffect } from "react";

const HMRErrorHandler = () => {
  useEffect(() => {
    // Only run in development environment
    if (process.env.NODE_ENV !== "development") return;

    // Store original fetch function
    const originalFetch = window.fetch;

    // Override fetch to handle HMR-related errors gracefully
    window.fetch = async (
      ...args: Parameters<typeof fetch>
    ): Promise<Response> => {
      try {
        return await originalFetch(...args);
      } catch (error) {
        const url = args[0];

        // Check if this is an HMR-related request
        if (
          typeof url === "string" &&
          (url.includes("_next/static") ||
            url.includes("webpack") ||
            url.includes("hmr") ||
            url.includes("hot-update"))
        ) {
          // Silently handle HMR fetch failures
          console.warn("HMR fetch failed, continuing...", error);
          return new Response("{}", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Re-throw non-HMR errors
        throw error;
      }
    };

    // Handle unhandled promise rejections from HMR
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      // Check if it's an HMR-related error
      if (
        error &&
        error.message &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("webpack") ||
          error.message.includes("HMR") ||
          error.message.includes("hot-update"))
      ) {
        // Prevent the error from being logged to console
        event.preventDefault();
        console.warn("HMR error suppressed:", error.message);
      }
    };

    // Add event listener for unhandled promise rejections
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup function
    return () => {
      window.fetch = originalFetch;
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null; // This component doesn't render anything
};

export default HMRErrorHandler;
