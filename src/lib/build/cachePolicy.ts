/**
 * Production HTTP cache policy for PARADISE.
 *
 * Layered strategy (do not blanket no-store the whole site):
 *
 * 1. `/_next/static/*`  → immutable long-cache (Next default; content-hashed)
 * 2. Public HTML/RSC    → private, max-age=0, must-revalidate
 *    Browser may keep a local copy but must revalidate every navigation.
 *    Fresh HTML after deploy points at new hashed JS/CSS → users get new UI.
 * 3. Auth / account UI  → private, no-store (personalized + sensitive)
 * 4. JSON APIs          → private, no-store (mutable business data)
 * 5. `/api/build`       → private, no-store (deploy stamp for client reload)
 *
 * Deploy safety net: ClientCacheGuard compares embedded build id vs `/api/build`.
 * One-time Service Worker purge only runs if a controlling SW exists (legacy).
 */

export const CACHE_HTML_REVALIDATE =
  "private, max-age=0, must-revalidate";

export const CACHE_PRIVATE_NO_STORE =
  "private, no-store, no-cache, must-revalidate, max-age=0";

export const CACHE_PUBLIC_IMMUTABLE =
  "public, max-age=31536000, immutable";
