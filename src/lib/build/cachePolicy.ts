/**
 * Production HTTP cache policy for PARADISE (Next.js 16 + Laravel 12).
 *
 * IMPORTANT: These headers are applied only when `NODE_ENV === "production"`.
 * Custom Cache-Control in `next dev` breaks Fast Refresh / HMR (Chrome often
 * keeps a stale document/module shell until the Next process is restarted).
 *
 * Layer map (App Router, production):
 *
 * | Layer              | Strategy                                                                 |
 * |--------------------|--------------------------------------------------------------------------|
 * | Full Route Cache   | Off for personalized shells (`cookies()` in root layout) — correct      |
 * | Data Cache         | Off for catalog/CMS (`fetch`/`apiRequest` → `no-store`)                 |
 * | Router Cache       | `staleTimes.dynamic: 0`; avoid `prefetch={true}` / `router.prefetch`    |
 * | Browser HTML       | `private, max-age=0, must-revalidate` (+ `Vary: Cookie`)                |
 * | Browser/CDN API    | `private, no-store` (Laravel middleware + Next `/api/*` headers)        |
 * | `/_next/static`    | Immutable long-cache (Next default; content-hashed)                     |
 * | `/storage/*`       | Immutable long-cache (UUID filenames; safe across deploys)              |
 * | Deploy safety      | `ClientCacheGuard` + `/api/build` hard-reloads open tabs                |
 *
 * Development extras (see `next.config.ts`):
 * - Per-boot `NEXT_PUBLIC_BUILD_ID` so every browser reloads after `next dev` restart
 * - Webpack `cache: { type: "memory" }` to avoid stale filesystem compile graphs
 * - Use a single stack (`npm run dev:stack`) — never `next start` alongside `next dev`
 */

export const CACHE_HTML_REVALIDATE =
  "private, max-age=0, must-revalidate";

export const CACHE_PRIVATE_NO_STORE =
  "private, no-store, no-cache, must-revalidate, max-age=0";

/** UUID upload objects and other content-addressed public files. */
export const CACHE_PUBLIC_IMMUTABLE =
  "public, max-age=31536000, immutable";
