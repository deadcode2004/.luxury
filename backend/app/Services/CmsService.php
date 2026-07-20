<?php

namespace App\Services;

use App\Exceptions\DomainException;
use App\Models\CmsSetting;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class CmsService
{
    public const STOREFRONT_KEY = 'storefront';

    public function defaults(): array
    {
        return [
            'hero' => [
                'heading' => [
                    'ar' => 'اكتشف جوهر الفخامة',
                    'en' => 'Discover the Essence of Luxury',
                ],
                'subtitle' => [
                    'ar' => 'المجموعة الجديدة',
                    'en' => 'NEW COLLECTION',
                ],
                'description' => [
                    'ar' => 'اكتشف مجموعتنا الحصرية المصممة بعناية لتمنحك إطلالة لا تقاوم.',
                    'en' => 'Discover our exclusive collection carefully crafted for an irresistible look.',
                ],
                'cta' => [
                    'ar' => 'تسوق الآن',
                    'en' => 'Shop Now',
                ],
                'link' => '/shop',
                'image' => '/images/products/paradisecare-home02.jpg',
            ],
            'announcement' => [
                'enabled' => true,
                'text' => [
                    'ar' => 'شحن مجاني للطلبات فوق 500 ريال',
                    'en' => 'Free shipping on orders over 500 SAR',
                ],
            ],
        ];
    }

    public function getStorefront(): array
    {
        if (! $this->tableReady()) {
            return $this->defaults();
        }

        try {
            $row = CmsSetting::query()->where('key', self::STOREFRONT_KEY)->first();
            if (! $row) {
                return $this->defaults();
            }

            return array_replace_recursive($this->defaults(), $row->value ?? []);
        } catch (QueryException $e) {
            Log::warning('CMS read failed; returning defaults', ['error' => $e->getMessage()]);

            return $this->defaults();
        }
    }

    public function updateStorefront(array $payload): array
    {
        if (! $this->tableReady()) {
            throw new DomainException(
                'CMS table is missing. Run `php artisan migrate` then try again.',
                503,
                'CMS_TABLE_MISSING'
            );
        }

        $merged = array_replace_recursive($this->getStorefront(), $payload);

        CmsSetting::query()->updateOrCreate(
            ['key' => self::STOREFRONT_KEY],
            ['value' => $merged]
        );

        return $merged;
    }

    private function tableReady(): bool
    {
        try {
            return Schema::hasTable('cms_settings');
        } catch (\Throwable) {
            return false;
        }
    }
}
