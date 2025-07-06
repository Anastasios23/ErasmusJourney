/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix HMR issues in cloud environment
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Configure for cloud environment
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };

      // Disable problematic HMR features in cloud environment
      if (config.plugins) {
        config.plugins = config.plugins.filter((plugin) => {
          return plugin.constructor.name !== "HotModuleReplacementPlugin";
        });
      }
    }
    return config;
  },
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
