/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix HMR issues in cloud environment
  webpack: (config, { dev, isServer, webpack }) => {
    if (dev && !isServer) {
      // Configure for cloud environment - reduce HMR aggressiveness
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 1000,
        ignored: ["**/node_modules/**", "**/.git/**"],
      };
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
