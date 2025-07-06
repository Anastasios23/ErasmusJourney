/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode only in production to reduce dev noise
  reactStrictMode: process.env.NODE_ENV === "production",
  // Minimal webpack config for cloud environment stability
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce file watching aggressiveness and HMR frequency
      config.watchOptions = {
        aggregateTimeout: 3000, // Increased delay
        poll: false,
        ignored: /node_modules/,
      };

      // Reduce HMR noise in cloud environments
      if (config.devServer) {
        config.devServer.client = {
          ...config.devServer.client,
          logging: "warn", // Reduce logging verbosity
          overlay: {
            errors: true,
            warnings: false, // Hide warning overlays
          },
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
