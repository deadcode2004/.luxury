<?php

namespace App\Services;

use App\Models\CmsSetting;

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
        $row = CmsSetting::query()->where('key', self::STOREFRONT_KEY)->first();
        if (! $row) {
            return $this->defaults();
        }

        return array_replace_recursive($this->defaults(), $row->value ?? []);
    }

    public function updateStorefront(array $payload): array
    {
        $merged = array_replace_recursive($this->getStorefront(), $payload);

        CmsSetting::query()->updateOrCreate(
            ['key' => self::STOREFRONT_KEY],
            ['value' => $merged]
        );

        return $merged;
    }
}
