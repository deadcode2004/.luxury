import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import {
  CACHE_HTML_REVALIDATE,
  CACHE_PRIVATE_NO_STORE,
} from "./src/lib/build/cachePolicy";

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

/** Stable per git commit / Vercel deploy — used by ClientCacheGuard. */
const buildId = resolveBuildId();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  experimental: {
    // Dynamic segments refetch on navigation. Static floor is Next 16 minimum (30s).
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
        // Mutable JSON — never reuse across users/deploys.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: CACHE_PRIVATE_NO_STORE },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        // Personalized / sensitive surfaces.
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
        /**
         * Storefront HTML/RSC: allow browser storage but always revalidate.
         * Better than no-store (enables conditional 304s) while still picking up
         * new deploys. `/_next/static` is intentionally excluded — Next serves
         * content-hashed assets with immutable long-cache.
         */
        source: "/((?!_next/static|_next/image|api/).*)",
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
