/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**",
        port: "",
      },
      {
        protocol: "http",
        hostname: "**",
        pathname: "/**",
        port: "",
      },
    ],
    domains: ["*"],
  },
  experimental: {
    serverComponentsExternalPackages: ["mjml"],
  },
};

export default nextConfig;
