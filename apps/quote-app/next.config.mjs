/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@cloudreno/design-pricing']
  },
  images: {
    domains: [
      'img.cloudrenovation.ca',
      '5aaa1ad8f395c6c0bb0dacc2809d30aa.r2.cloudflarestorage.com'
    ]
  },
  env: {
    CUSTOM_KEY: 'quote-app'
  }
};

export default nextConfig;