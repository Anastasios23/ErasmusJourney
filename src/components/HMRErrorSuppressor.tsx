"use client";

import { useEffect } from "react";

export default function HMRErrorSuppressor() {
  useEffect(() => {
    // Suppress HMR-related fetch errors in cloud environments
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        return await originalFetch(...args);
      } catch (error) {
        const url = args[0]?.toString() || "";

        // Suppress webpack HMR update errors
        if (url.includes("webpack.hot-update.json") || url.includes("hmr")) {
          console.warn("HMR update failed (suppressed):", url);
          // Return a dummy response to prevent the error from propagating
          return new Response(JSON.stringify({}), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Re-throw other errors
        throw error;
      }
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
