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

      // Disable problematic HMR features in cloud environment
      config.devtool = "eval-cheap-module-source-map";

      // Add custom HMR configuration
      if (config.entry && typeof config.entry === "object") {
        Object.keys(config.entry).forEach((key) => {
          if (Array.isArray(config.entry[key])) {
            config.entry[key] = config.entry[key].filter(
              (entry) =>
                !entry.includes("webpack-hot-middleware") &&
                !entry.includes("webpack/hot"),
            );
          }
        });
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
        protocol: "https",
        hostname: "api.dicebear.com",
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
