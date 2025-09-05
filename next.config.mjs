/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle Bootstrap and other client-side libraries
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure Bootstrap is properly handled on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Ensure proper handling of CSS and JS imports
  experimental: {
    optimizePackageImports: ['bootstrap'],
  },
  // Configure allowed image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '0fare.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9988',
        pathname: '/uploads/**',
      },
    ],
    // Allow unoptimized images for local development
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
