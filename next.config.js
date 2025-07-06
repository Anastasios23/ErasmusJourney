/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Minimal webpack config for cloud environment stability
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Reduce file watching aggressiveness
      config.watchOptions = {
        aggregateTimeout: 2000,
        poll: false,
        ignored: /node_modules/,
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
  // Disable fast refresh in cloud environment to prevent HMR errors
  reactStrictMode: process.env.NODE_ENV === "development" ? false : true,
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
