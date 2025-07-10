"use client";

import { useEffect } from "react";

const HMRErrorHandler = () => {
  useEffect(() => {
    // Only run in development environment
    if (process.env.NODE_ENV !== "development") return;

    // Store original fetch function
    const originalFetch = window.fetch;

    // Override fetch to handle HMR and Next.js navigation errors gracefully
    window.fetch = async (
      ...args: Parameters<typeof fetch>
    ): Promise<Response> => {
      try {
        return await originalFetch(...args);
      } catch (error) {
        const url = args[0];
        const urlString = typeof url === "string" ? url : url?.toString() || "";

        // Check if this is a development-related request that should be handled gracefully
        const isDevelopmentRequest =
          urlString.includes("_next/static") ||
          urlString.includes("webpack") ||
          urlString.includes("hmr") ||
          urlString.includes("hot-update") ||
          urlString.includes("/_next/") ||
          urlString.includes("?reload=") ||
          // Handle PageLoader requests
          urlString.match(/\/_next\/static\/chunks\/pages\//) ||
          // Handle dynamic imports and code splitting
          urlString.match(/\/_next\/static\/chunks\/\d+\./) ||
          // Handle development server requests
          (urlString.includes("localhost") && urlString.includes("_next"));

        if (isDevelopmentRequest) {
          // Silently handle development fetch failures
          console.warn(
            "Development fetch failed, providing fallback:",
            urlString,
            error.message,
          );

          // Return appropriate fallback based on request type
          if (urlString.includes(".js") || urlString.includes("chunks")) {
            return new Response("// Fallback for missing chunk\n", {
              status: 200,
              headers: { "Content-Type": "application/javascript" },
            });
          } else if (urlString.includes(".json")) {
            return new Response("{}", {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          } else {
            return new Response("", {
              status: 200,
              headers: { "Content-Type": "text/plain" },
            });
          }
        }

        // Re-throw non-development errors
        throw error;
      }
    };

    // Handle unhandled promise rejections from development tools
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const errorMessage = error?.message || error?.toString() || "";

      // Check if it's a development-related error that should be suppressed
      const isDevelopmentError =
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("webpack") ||
        errorMessage.includes("HMR") ||
        errorMessage.includes("hot-update") ||
        errorMessage.includes("PageLoader") ||
        errorMessage.includes("_next/static") ||
        errorMessage.includes("chunk") ||
        errorMessage.includes("Loading chunk") ||
        errorMessage.includes("Loading CSS chunk") ||
        // Handle Next.js router errors
        errorMessage.includes("Router.change") ||
        errorMessage.includes("getPageList") ||
        // Handle network errors in development
        (errorMessage.includes("NetworkError") &&
          process.env.NODE_ENV === "development");

      if (isDevelopmentError) {
        // Prevent the error from being logged to console
        event.preventDefault();
        console.warn("Development error suppressed:", errorMessage);
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
