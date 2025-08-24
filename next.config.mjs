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
};

export default nextConfig;
