<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class CategoryService
{
    public function listActive(): Collection
    {
        return Cache::remember('categories:active', now()->addHour(), function () {
            return Category::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();
        });
    }

    public static function flushCache(): void
    {
        Cache::forget('categories:active');
    }
}
