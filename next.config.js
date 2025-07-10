/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode only in production to reduce dev noise
  reactStrictMode: process.env.NODE_ENV === "production",
  // Enhanced webpack config for cloud environment stability
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve file watching for cloud environments
      config.watchOptions = {
        aggregateTimeout: 5000, // Longer delay for stability
        poll: false,
        ignored: /node_modules/,
      };

      // Configure HMR for better error handling
      config.optimization = {
        ...config.optimization,
        moduleIds: "named", // More stable module IDs
      };

      // Add error handling for HMR fetch failures
      config.plugins = config.plugins || [];
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEnvironment.tap("HMRErrorHandler", () => {
            // Add global error handler for fetch failures
            if (typeof window !== "undefined") {
              const originalFetch = window.fetch;
              window.fetch = async (...args) => {
                try {
                  return await originalFetch(...args);
                } catch (error) {
                  // Silently ignore HMR-related fetch errors
                  if (
                    args[0] &&
                    typeof args[0] === "string" &&
                    (args[0].includes("_next/static") ||
                      args[0].includes("webpack"))
                  ) {
                    console.warn(
                      "HMR fetch failed, continuing...",
                      error.message,
                    );
                    return new Response("{}", { status: 200 });
                  }
                  throw error;
                }
              };
            }
          });
        },
      });

      // Reduce HMR noise in cloud environments
      if (config.devServer) {
        config.devServer.client = {
          ...config.devServer.client,
          logging: "error", // Only show errors
          overlay: {
            errors: false, // Disable error overlays for HMR issues
            warnings: false,
          },
          reconnect: 3, // Limit reconnection attempts
        };
      }
    }
    return config;
  },
  // Reduce network requests and improve stability
  generateEtags: false,
  compress: false, // Disable compression in dev to reduce processing
  // Experimental features for better cloud support
  experimental: {
    // Reduce memory usage and improve stability
    workerThreads: false,
    cpus: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
