/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@cloudreno/design-pricing']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.cloudrenovation.ca',
      },
      {
        protocol: 'https',
        hostname: 'img.cloudrenos.com',
      },
      {
        protocol: 'https',
        hostname: 'products.cloudrenos.com',
      },
      {
        protocol: 'https',
        hostname: '5aaa1ad8f395c6c0bb0dacc2809d30aa.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  env: {
    CUSTOM_KEY: 'quote-app'
  }
};

export default nextConfig;