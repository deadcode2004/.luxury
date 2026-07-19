<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class ProductService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $perPage = min((int) ($filters['per_page'] ?? 12), 50);
        $page = max((int) ($filters['page'] ?? 1), 1);

        $cacheKey = 'products:list:'.md5(json_encode([$filters, $perPage, $page]));

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($filters, $perPage) {
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

            $sort = $filters['sort'] ?? 'featured';
            match ($sort) {
                'price-asc' => $query->orderBy('price'),
                'price-desc' => $query->orderByDesc('price'),
                'newest' => $query->orderByDesc('is_new')->orderByDesc('id'),
                default => $query->orderByDesc('is_featured')->orderByDesc('id'),
            };

            return $query->paginate($perPage);
        });
    }

    public function findByIdOrCode(string|int $id): Product
    {
        return Product::query()
            ->with('category')
            ->active()
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('code', $id);
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

    public static function flushListCache(): void
    {
        // Simple versioned flush: bump a generation key consumers can namespace if needed.
        Cache::forever('products:list:version', now()->timestamp);
        Cache::flush();
    }
}
