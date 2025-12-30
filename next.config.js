/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode only in production to reduce dev noise
  reactStrictMode: process.env.NODE_ENV === "production",
  // TypeScript checking during build - enable for production builds
  typescript: {
    // Set to false to enable strict type checking (recommended for production)
    // Set to true only for development if you need to bypass temporary type errors
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === "true",
  },
  // Allow cross-origin requests in development for cloud environments
  allowedDevOrigins: [
    // Allow the current fly.dev domain
    "e76e6937e0ab4494b4f81584380dda25-a5461613bb5b4ba69ae071f5c.fly.dev",
    // Allow localhost variations
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  // Enhanced webpack config for cloud environment stability
  webpack: (config, { dev, isServer }) => {
    // Add fallback for @prisma/client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@prisma/client": false,
    };

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
    // Force SWC instead of Babel
    forceSwcTransforms: true,
    // Reduce memory usage and improve stability
    workerThreads: false,
    cpus: 1,
  },
  images: {
    // Performance optimization for images
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
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
