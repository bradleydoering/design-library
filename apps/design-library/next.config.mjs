import { execSync } from 'child_process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: true,
    domains: ["cloudrenovation.ca", "img.cloudrenovation.ca", "img.cloudrenos.com"],
  },
  experimental: {
    optimizePackageImports: ["tailwindcss"],
  },
  webpack: (config, { isServer, dev }) => {
    // Generate sitemap during build (only on server side and not in dev mode)
    if (isServer && !dev) {
      try {
        execSync('node ../../scripts/generate-sitemap.js', {
          stdio: 'inherit',
          cwd: process.cwd()
        });
      } catch (error) {
        console.warn('Failed to generate sitemap:', error.message);
      }
    }
    return config;
  },
};

export default nextConfig;
