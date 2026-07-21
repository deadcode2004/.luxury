<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class CategoryService
{
    /**
     * Always read active categories from the database so storefront filters
     * and navigation match admin edits immediately for every visitor.
     */
    public function listActive(): Collection
    {
        return Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public static function flushCache(): void
    {
        Cache::forget('categories:active');
    }
}
