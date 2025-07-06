"use client";

import { useEffect } from "react";

export default function HMRErrorSuppressor() {
  useEffect(() => {
    // Suppress only console errors related to HMR, not actual fetch requests
    const originalConsoleError = console.error;

    console.error = (...args) => {
      const message = args.join(" ");

      // Suppress specific HMR-related errors that don't affect functionality
      if (
        message.includes("Failed to fetch") &&
        (message.includes("webpack.hot-update") ||
          message.includes("hmrM") ||
          message.includes("_next/static/webpack/"))
      ) {
        // Silently ignore these HMR errors
        return;
      }

      // Log all other errors normally
      originalConsoleError.apply(console, args);
    };

    // Also suppress unhandled promise rejections for HMR
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error && typeof error === "object" && error.message) {
        const message = error.message.toString();
        if (
          message.includes("Failed to fetch") &&
          (message.includes("webpack.hot-update") ||
            message.includes("_next/static/webpack/"))
        ) {
          event.preventDefault(); // Prevent the error from appearing in console
          return;
        }
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup on unmount
    return () => {
      console.error = originalConsoleError;
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
