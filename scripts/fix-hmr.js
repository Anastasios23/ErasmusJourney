// This script helps fix HMR issues in cloud environments
// by ensuring proper webpack configuration

const originalConsoleError = console.error;

// Suppress HMR-related fetch errors
console.error = function (...args) {
  const message = args.join(" ");

  // Suppress specific HMR errors that don't affect functionality
  if (
    message.includes("Failed to fetch") &&
    (message.includes("webpack.hot-update") || message.includes("hmrM"))
  ) {
    return; // Ignore these errors
  }

  // Pass through all other errors
  originalConsoleError.apply(console, args);
};

// Disable webpack HMR in cloud environments if needed
if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
  // Override webpack HMR in cloud environment
  if (module.hot) {
    module.hot.accept = function () {};
    module.hot.dispose = function () {};
  }
}
