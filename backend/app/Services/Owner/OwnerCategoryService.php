<?php

namespace App\Services\Owner;

use App\Models\Category;
use App\Services\CategoryService;
use App\Services\Translation\ProductTranslationService;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class OwnerCategoryService
{
    public function __construct(private readonly ProductTranslationService $translator) {}

    public function list(): Collection
    {
        return Category::query()->orderBy('sort_order')->orderBy('id')->get();
    }

    public function create(array $data): Category
    {
        $data = $this->normalizeAndTranslate($data);
        $category = Category::query()->create($data);
        CategoryService::flushCache();

        return $category;
    }

    public function update(Category $category, array $data): Category
    {
        $previous = ['name' => $category->name];
        $data = $this->normalizeAndTranslate($data, $previous);
        $category->update($data);
        CategoryService::flushCache();

        return $category->fresh();
    }

    public function delete(Category $category): void
    {
        $category->delete();
        CategoryService::flushCache();
    }

    /**
     * Find category by Arabic name (case-insensitive) or create a new one with EN translation.
     */
    public function resolveByArabicName(string $arabicName, ?string $image = null): Category
    {
        $arabicName = trim($arabicName);
        $existing = Category::query()->get()->first(function (Category $cat) use ($arabicName) {
            return mb_strtolower(trim((string) data_get($cat->name, 'ar', ''))) === mb_strtolower($arabicName);
        });

        if ($existing) {
            return $existing;
        }

        return $this->create([
            'name' => ['ar' => $arabicName],
            'image' => $image ?: '/images/products/paradisecare-home02.jpg',
            'is_active' => true,
        ]);
    }

    private function normalizeAndTranslate(array $data, ?array $previous = null): array
    {
        if (! isset($data['name']) || ! is_array($data['name'])) {
            return $data;
        }

        $ar = trim((string) ($data['name']['ar'] ?? ''));
        $en = trim((string) ($data['name']['en'] ?? ''));
        $prevAr = trim((string) data_get($previous, 'name.ar', ''));

        // Translate once: only when EN empty, or Arabic text changed.
        if ($ar !== '' && ($en === '' || ($prevAr !== '' && $ar !== $prevAr))) {
            $data['name']['en'] = $this->translator->translate($ar);
        } elseif ($en === '' && $ar !== '') {
            $data['name']['en'] = $ar;
        }

        if (empty($data['code'])) {
            $base = Str::slug($data['name']['en'] ?: $ar) ?: 'category';
            $code = $base;
            $i = 1;
            while (Category::query()->where('code', $code)->exists()) {
                $code = $base.'-'.$i;
                $i++;
            }
            $data['code'] = $code;
        }

        return $data;
    }
}
