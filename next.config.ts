import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Pages配置 - 使用standalone模式
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
