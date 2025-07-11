"use client";

import { useEffect } from "react";

const HMRErrorHandler = () => {
  useEffect(() => {
    // Only run in development environment
    if (process.env.NODE_ENV !== "development") return;

    // Prevent multiple initializations
    if ((window as any).__HMR_ERROR_HANDLER_INITIALIZED) return;
    (window as any).__HMR_ERROR_HANDLER_INITIALIZED = true;

    // Store original fetch function
    const originalFetch = window.fetch;

    // Override fetch to handle HMR and Next.js navigation errors gracefully
    window.fetch = async (
      ...args: Parameters<typeof fetch>
    ): Promise<Response> => {
      try {
        return await originalFetch(...args);
      } catch (error: any) {
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
          urlString.includes("fly.dev") ||
          // Handle PageLoader requests
          urlString.match(/\/_next\/static\/chunks\/pages\//) ||
          // Handle dynamic imports and code splitting
          urlString.match(/\/_next\/static\/chunks\/\d+\./) ||
          // Handle development server requests
          (urlString.includes("localhost") && urlString.includes("_next")) ||
          // Handle cloud environment HMR
          (error?.message?.includes("Failed to fetch") &&
            urlString.includes("?reload="));

        if (isDevelopmentRequest) {
          // Silently handle development fetch failures - don't log to avoid console spam

          // Return appropriate fallback based on request type
          if (urlString.includes(".js") || urlString.includes("chunks")) {
            return new Response("// Fallback for missing chunk\nexport {};", {
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
        errorMessage.includes("fly.dev") ||
        errorMessage.includes("?reload=") ||
        // Handle Next.js router errors
        errorMessage.includes("Router.change") ||
        errorMessage.includes("getPageList") ||
        // Handle network errors in development
        (errorMessage.includes("NetworkError") &&
          process.env.NODE_ENV === "development") ||
        // Handle cloud environment specific errors
        (errorMessage.includes("TypeError") && errorMessage.includes("fetch"));

      if (isDevelopmentError) {
        // Prevent the error from being logged to console
        event.preventDefault();
        // Don't log to avoid console spam
      }
    };

    // Handle window errors from development tools
    const handleWindowError = (event: ErrorEvent) => {
      const error = event.error;
      const errorMessage = event.message || error?.message || "";

      // Check if it's a development-related error
      const isDevelopmentError =
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("webpack") ||
        errorMessage.includes("chunk") ||
        errorMessage.includes("_next/static") ||
        errorMessage.includes("PageLoader") ||
        errorMessage.includes("Router.change") ||
        (errorMessage.includes("TypeError") && errorMessage.includes("fetch"));

      if (isDevelopmentError) {
        console.warn("Development window error suppressed:", errorMessage);
        event.preventDefault();
        return false;
      }
    };

    // Patch Next.js PageLoader to handle fetch errors gracefully
    const patchPageLoader = () => {
      try {
        // Access Next.js internals carefully
        const nextRouter = (window as any).__NEXT_DATA__?.router;
        if (nextRouter && (window as any).__NEXT_P) {
          const pageLoader = (window as any).__NEXT_P;

          // Patch the PageLoader fetch methods
          if (pageLoader && typeof pageLoader.getPageList === "function") {
            const originalGetPageList = pageLoader.getPageList;
            pageLoader.getPageList = function (...args: any[]) {
              try {
                return originalGetPageList.apply(this, args);
              } catch (error) {
                console.warn("PageLoader.getPageList error suppressed:", error);
                return Promise.resolve([]);
              }
            };
          }
        }
      } catch (error) {
        // Silently ignore patching errors
        console.warn("Could not patch PageLoader:", error);
      }
    };

    // Apply patches after a short delay to ensure Next.js is loaded
    setTimeout(patchPageLoader, 1000);

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);

    // Cleanup function
    return () => {
      window.fetch = originalFetch;
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleWindowError);
      delete (window as any).__HMR_ERROR_HANDLER_INITIALIZED;
    };
  }, []);

  return null; // This component doesn't render anything
};

export default HMRErrorHandler;
