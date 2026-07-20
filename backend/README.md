# Paradise Luxury — Laravel 12 API

Production-oriented backend for the Paradise storefront and owner dashboard.

## Stack

- Laravel 12 / PHP 8.3+
- PostgreSQL
- Redis (cache + queues)
- Laravel Sanctum (API tokens)
- Laravel Filesystem (`public` disk)

## Architecture

- Thin API controllers under `app/Http/Controllers/Api/V1`
- Business logic in `app/Services`
- Form Requests + API Resources
- Policies for Owner/User authorization (simple `role` enum — no complex RBAC)
- Domain exceptions with unified JSON envelopes via `App\Support\ApiResponse`
- Events/Listeners for order lifecycle
- Single products table as catalog source of truth

## Roles

Only two roles:

- `owner` — admin/owner panel APIs under `/api/v1/owner/*`
- `user` — storefront customer APIs

## Setup

```bash
cd backend
composer install
cp .env.example .env   # or use existing .env
php artisan key:generate
# Ensure PostgreSQL DB + Redis are running
php artisan migrate --seed
php artisan storage:link
php artisan serve --host=0.0.0.0 --port=8000
```

### Default seeded accounts

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Owner | owner@paradise.test   | password  |
| User  | ahmed@example.com     | password  |

Catalog seeders convert the previous frontend mock products/categories/reviews into real DB rows (`p1`–`p4`, `c1`–`c4`) **without changing product images**.

## Important commerce rules

Cart/checkout/order creation all validate stock on the server:

- Add to cart cannot exceed stock
- Update cart cannot exceed stock
- Checkout uses DB transactions + `SELECT … FOR UPDATE` row locks
- Stock decrement is conditional (`WHERE stock >= qty`) and rolls back on failure

## API (prefix `/api/v1`)

### Public
- `GET /categories`
- `GET /products` (filters: `category_id`, `category_code`, `search`, `sort`, `featured`, `best_seller`, `page`, `per_page`)
- `GET /products/{id|code}`
- `GET /reviews`

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (Bearer token)
- `POST /auth/logout`

### Customer (auth)
- Cart: `GET/POST/PATCH/DELETE /cart...`
- `POST /checkout`
- `GET /orders`, `GET /orders/{order}`
- Account profile/addresses

### Owner (auth + owner middleware)
- `GET /owner/dashboard`
- Inventory CRUD
- Orders list/status
- Customers
- Coupons

## Unified response shape

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": { "pagination": {} }
}
```

Errors include `code` when applicable (`INSUFFICIENT_STOCK`, `VALIDATION_ERROR`, …).

## Tests

```bash
php artisan test --filter=Api
```

## Frontend compatibility

The Next.js UI currently still renders from local mock data and remains untouched by this backend work. The API shapes mirror those mocks (bilingual `name`/`brand`, product `code` like `p1`, VAT 15%, COD fee 15 SAR) so the frontend can be wired later without redesigning contracts.
