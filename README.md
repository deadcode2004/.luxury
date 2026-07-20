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

### Frontend setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend setup

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
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
npm run dev     # webpack dev server
npm run build   # webpack production build (same as Vercel)
npm run start   # serve production build
npm run lint
```
