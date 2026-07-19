<?php

namespace App\Services\Owner;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InventoryService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Product::query()->with('category');

        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', $search)
                    ->orWhere('name', 'like', $search);
            });
        }

        return $query->latest('id')->paginate(min((int) ($filters['per_page'] ?? 15), 50));
    }

    public function create(array $data): Product
    {
        $product = Product::query()->create($data);
        ProductService::flushListCache();

        return $product->load('category');
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        ProductService::flushListCache();

        return $product->fresh('category');
    }

    public function delete(Product $product): void
    {
        $product->delete();
        ProductService::flushListCache();
    }
}
