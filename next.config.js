/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix HMR issues in cloud environment
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable HMR polling which can cause issues in cloud environments
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  // Experimental features for better cloud support
  experimental: {
    // Reduce memory usage and improve stability
    workerThreads: false,
    cpus: 1,
  },
  // Development server configuration
  devIndicators: {
    buildActivity: false, // Disable build activity indicator to reduce console noise
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
