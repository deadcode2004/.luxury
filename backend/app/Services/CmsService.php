<?php

namespace App\Services;

use App\Exceptions\DomainException;
use App\Models\CmsSetting;
use App\Services\Translation\ProductTranslationService;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class CmsService
{
    public const STOREFRONT_KEY = 'storefront';

    public function __construct(private readonly ProductTranslationService $translator) {}

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
                    'ar' => 'شحن مجاني للطلبات فوق 500 ج.م',
                    'en' => 'Free shipping on orders over 500 EGP',
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

        $previous = $this->getStorefront();
        $merged = array_replace_recursive($previous, $payload);
        $merged = $this->translateAnnouncement($merged, $previous);

        CmsSetting::query()->updateOrCreate(
            ['key' => self::STOREFRONT_KEY],
            ['value' => $merged]
        );

        return $merged;
    }

    /**
     * Announcement is authored in Arabic only; English is filled automatically.
     */
    private function translateAnnouncement(array $merged, array $previous): array
    {
        $ar = trim((string) data_get($merged, 'announcement.text.ar', ''));
        $en = trim((string) data_get($merged, 'announcement.text.en', ''));
        $prevAr = trim((string) data_get($previous, 'announcement.text.ar', ''));

        if ($ar === '') {
            $merged['announcement']['text']['en'] = '';

            return $merged;
        }

        $shouldTranslate = $en === '' || ($prevAr !== '' && $ar !== $prevAr);
        if ($shouldTranslate) {
            $merged['announcement']['text']['en'] = $this->translator->translate($ar);
        }

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
