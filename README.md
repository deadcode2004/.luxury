# PARADISE — Luxury E-Commerce

Next.js storefront + Laravel 12 API.

## Environment parity (Local = Vercel)

Both environments must use the **same bundler** and the **same API path**:

| Concern | Value |
|---------|-------|
| Bundler | Webpack (`next dev --webpack` / `next build --webpack`) |
| Browser API base | `/api/v1` (same-origin) |
| Laravel proxy | `API_PROXY_ORIGIN` (Next rewrite) |

See full audit: [`docs/ENVIRONMENT_PARITY_REPORT.md`](./docs/ENVIRONMENT_PARITY_REPORT.md)

### Local development (recommended)

`.env.local` → `API_PROXY_ORIGIN` is the **single source of truth** for the Laravel port
(default `http://127.0.0.1:8000`). Do not flip between 8000/8001 manually.

```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
npm install
cd backend && composer install && php artisan key:generate && php artisan migrate --seed && php artisan storage:link && cd ..

# Start BOTH (safe — does not cross-kill processes)
npm run dev:all
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Laravel API: [http://127.0.0.1:8000](http://127.0.0.1:8000)

Or in two terminals (either side never kills the other):

```bash
npm run dev:laravel   # ONLY Laravel (multi-worker PHP server)
npm run dev:next      # ONLY Next.js
```

Seeded accounts:

| Role  | Email               | Password |
|-------|---------------------|----------|
| Owner | owner@paradise.test | password |
| User  | ahmed@example.com   | password |

### Production checklist (Vercel)

1. Set env vars:
   - `NEXT_PUBLIC_API_URL=/api/v1`
   - `API_PROXY_ORIGIN=https://YOUR-LARAVEL-HOST`
2. Ensure Production deploys the intended Git branch (not a stale `main`).
3. On Laravel host set `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `SANCTUM_STATEFUL_DOMAINS`.
4. Verify with: `npm run build && npm run start` locally — must match Vercel visuals.

### Scripts

```bash
npm run dev:all       # Laravel + Next together (recommended)
npm run dev:laravel   # Laravel only (never touches Next)
npm run dev:next      # Next only (never touches Laravel)
npm run dev           # Next only (raw)
npm run build         # webpack production build (same as Vercel)
npm run start         # serve production build — do NOT run beside `dev`
npm run lint
```

