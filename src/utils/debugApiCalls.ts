// Debugging utility to monitor API calls

let originalFetch: typeof window.fetch;

export function setupApiCallMonitoring() {
  if (typeof window !== "undefined") {
    // Save the original fetch
    originalFetch = window.fetch;

    // Override fetch to log calls
    window.fetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;

      // Only log API calls
      if (url.includes("/api/")) {
        console.log(`📡 API Request: ${init?.method || "GET"} ${url}`);
      }

      // Call original fetch
      const response = await originalFetch(input, init);

      // Log responses for API calls
      if (url.includes("/api/")) {
        console.log(`✅ API Response: ${response.status} ${url}`);
      }

      return response;
    };
  }
}

export function restoreOriginalFetch() {
  if (typeof window !== "undefined" && originalFetch) {
    window.fetch = originalFetch;
  }
}
