// Safe fetch wrapper that avoids conflicts with analytics/monitoring tools

let originalFetch: typeof fetch;

// Store the original fetch before any tools can wrap it
if (typeof window !== 'undefined' && window.fetch) {
  originalFetch = window.fetch.bind(window);
} else if (typeof global !== 'undefined' && global.fetch) {
  originalFetch = global.fetch.bind(global);
} else {
  originalFetch = fetch;
}

export async function safeFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    // Use the original fetch to avoid conflicts with wrapped versions
    return await originalFetch(input, init);
  } catch (error) {
    // If original fetch fails, try the current fetch as fallback
    console.warn('Original fetch failed, trying current fetch:', error);
    try {
      return await fetch(input, init);
    } catch (fallbackError) {
      console.error('Both original and current fetch failed:', fallbackError);
      throw fallbackError;
    }
  }
}

// Export a fetch that's guaranteed to work
export default safeFetch;
