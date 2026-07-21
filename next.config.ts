import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import {
  CACHE_HTML_REVALIDATE,
  CACHE_PRIVATE_NO_STORE,
  CACHE_PUBLIC_IMMUTABLE,
} from "./src/lib/build/cachePolicy";

/**
 * Shared Next config for Local + Vercel.
 * API calls use same-origin `/api/v1/*` and are rewritten to Laravel via API_PROXY_ORIGIN.
 */
/** Must match `.env.local` → API_PROXY_ORIGIN (canonical local port: 8000). */
const apiProxyOrigin = (
  process.env.API_PROXY_ORIGIN ||
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

const isProd = process.env.NODE_ENV === "production";

function resolveBuildId(): string {
  // Dev: unique per `next dev` process boot.
  // After a restart, ClientCacheGuard hard-reloads every open browser (Chrome included)
  // so tabs cannot keep a dead webpack/HMR shell. File edits still use Fast Refresh
  // because this value is fixed for the life of the process.
  if (!isProd) {
    return (
      process.env.NEXT_PUBLIC_BUILD_ID ||
      `dev-${process.pid}-${Date.now()}`
    );
  }

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

const buildId = resolveBuildId();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  experimental: {
    /**
     * Router Cache (App Router client cache):
     * - dynamic: 0 → navigations refetch RSC for dynamic segments
     * - static: 30 → Next 16 minimum; avoid Link prefetch={true} / router.prefetch
     */
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  /**
   * Dev stability: webpack's filesystem cache under `.next/cache` can serve a stale
   * module graph to one browser (often Chrome) while another gets a fresh compile.
   * Memory cache keeps Fast Refresh correct without cross-process stale artifacts.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
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
    qualities: [75, 85, 90, 100],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    // Custom Cache-Control in development breaks Next.js Fast Refresh / HMR
    // (Next warns about this). Chrome is especially sensitive and can keep an
    // old document/module shell until the whole process is restarted.
    if (!isProd) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: CACHE_PRIVATE_NO_STORE },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        source: "/storage/:path*",
        headers: [{ key: "Cache-Control", value: CACHE_PUBLIC_IMMUTABLE }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "Cache-Control", value: CACHE_PRIVATE_NO_STORE }],
      },
      {
        source: "/account/:path*",
        headers: [{ key: "Cache-Control", value: CACHE_PRIVATE_NO_STORE }],
      },
      {
        source: "/checkout/:path*",
        headers: [{ key: "Cache-Control", value: CACHE_PRIVATE_NO_STORE }],
      },
      {
        source: "/((?!_next/static|_next/image|api/|storage/).*)",
        headers: [
          { key: "Cache-Control", value: CACHE_HTML_REVALIDATE },
          { key: "Vary", value: "Cookie" },
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
