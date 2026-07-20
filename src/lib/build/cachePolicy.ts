/**
 * Production HTTP cache policy for PARADISE (Next.js 16 + Laravel 12).
 *
 * Layer map (App Router):
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
 * Do NOT blanket `no-store` the whole site — that hurts performance/SEO
 * repeat visits without improving catalog freshness (already no-store JSON).
 */

export const CACHE_HTML_REVALIDATE =
  "private, max-age=0, must-revalidate";

export const CACHE_PRIVATE_NO_STORE =
  "private, no-store, no-cache, must-revalidate, max-age=0";

/** UUID upload objects and other content-addressed public files. */
export const CACHE_PUBLIC_IMMUTABLE =
  "public, max-age=31536000, immutable";
