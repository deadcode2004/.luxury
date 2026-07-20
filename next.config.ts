import type { NextConfig } from "next";

/**
 * Shared Next config for Local + Vercel.
 * API calls use same-origin `/api/v1/*` and are rewritten to Laravel via API_PROXY_ORIGIN.
 */
const apiProxyOrigin = (
  process.env.API_PROXY_ORIGIN ||
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
    // Must include every `quality={...}` used in the app (Next 16).
    qualities: [75, 90, 100],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyOrigin}/api/v1/:path*`,
      },
      {
        source: "/sanctum/:path*",
        destination: `${apiProxyOrigin}/sanctum/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${apiProxyOrigin}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;
