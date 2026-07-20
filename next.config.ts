import { execSync } from "node:child_process";
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

function resolveBuildId(): string {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  if (process.env.VERCEL_DEPLOYMENT_ID) return process.env.VERCEL_DEPLOYMENT_ID;
  if (process.env.GIT_COMMIT) return process.env.GIT_COMMIT;
  if (process.env.NEXT_PUBLIC_BUILD_ID) return process.env.NEXT_PUBLIC_BUILD_ID;
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "local-dev";
  }
}

/**
 * Stable per git commit / Vercel deploy.
 * Surfaced to the client so Chrome can detect a newer shell and hard-reload.
 */
const buildId = resolveBuildId();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  experimental: {
    // Keep dynamic segments uncached. Next 16 requires static >= 30s; intentional
    // Link prefetch is disabled in UI (`prefetch={false}`) to avoid stale shells.
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
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
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
    // Must include every `quality={...}` used in the app (Next 16).
    qualities: [75, 90, 100],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        // HTML / RSC / pages — never treat as a long-lived document cache.
        // Leave `/_next/static/*` alone so Next can apply immutable hashed-asset caching
        // (fresh HTML → new hashes → browsers fetch new JS automatically).
        source: "/((?!_next/static|_next/image).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, no-cache, must-revalidate, max-age=0",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
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
