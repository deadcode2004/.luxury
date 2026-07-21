<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class ProductService
{
    /**
     * Public catalog reads always hit the database.
     *
     * Caching product lists caused cross-browser stale storefront data after
     * admin edits (Redis TTL up to 5 minutes). Realtime architecture requires
     * every visitor to see the current DB state immediately.
     */
    public function list(array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 12), 50);

        $query = Product::query()
            ->with('category')
            ->active();

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['category_code'])) {
            $query->whereHas('category', fn ($q) => $q->where('code', $filters['category_code']));
        }

        if (! empty($filters['search'])) {
            $term = '%'.$filters['search'].'%';
            $query->where(function ($q) use ($term) {
                $q->where('code', 'like', $term)
                    ->orWhere('name', 'like', $term)
                    ->orWhere('brand', 'like', $term);
            });
        }

        if (! empty($filters['featured'])) {
            $query->where('is_featured', true);
        }

        if (! empty($filters['best_seller'])) {
            $query->where('is_best_seller', true);
        }

        if (! empty($filters['new']) || ! empty($filters['is_new'])) {
            $query->where('is_new', true);
        }

        if (! empty($filters['offers']) || ! empty($filters['is_offer'])) {
            $query->where('is_offer', true);
        }

        if (! empty($filters['discounts']) || ! empty($filters['on_sale'])) {
            $query->whereNotNull('old_price')->whereColumn('old_price', '>', 'price');
        }

        $sort = $filters['sort'] ?? 'featured';
        match ($sort) {
            'price-asc' => $query->orderBy('price'),
            'price-desc' => $query->orderByDesc('price'),
            'newest' => $query->orderByDesc('is_new')->orderByDesc('id'),
            default => $query->orderByDesc('is_featured')->orderByDesc('id'),
        };

        return $query->paginate($perPage);
    }

    public function findByIdOrCode(string|int $id): Product
    {
        $key = trim((string) $id);

        return Product::query()
            ->with('category')
            ->active()
            ->where(function ($q) use ($key) {
                // Postgres rejects non-numeric values when comparing against bigint `id`.
                if (ctype_digit($key)) {
                    $q->where('id', (int) $key)->orWhere('code', $key);
                } else {
                    $q->where('code', $key);
                }
            })
            ->firstOrFail();
    }

    public function related(Product $product, int $limit = 4)
    {
        return Product::query()
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit($limit)
            ->get();
    }

    /**
     * Clears any legacy list-cache version marker left from older releases.
     */
    public static function flushListCache(): void
    {
        Cache::forget('products:list:version');
    }
}
