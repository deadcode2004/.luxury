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

    private const HERO_LOCALE_FIELDS = ['heading', 'subtitle', 'description', 'cta'];

    private const HERO_ACTIONS = [
        'shop_all',
        'shop_new',
        'shop_offers',
        'shop_discounts',
        'shop_featured',
        'custom',
    ];

    public function __construct(private readonly ProductTranslationService $translator) {}

    public function defaults(): array
    {
        return [
            'hero' => [
                'slides' => [
                    $this->defaultSlide(
                        'slide-1',
                        '/images/products/paradisecare-home02.jpg',
                        'جوهر الفخامة الحقيقية',
                        'Essence of True Luxury',
                        'المجموعة الجديدة ٢٠٢٦',
                        'NEW COLLECTION 2026',
                        'اكتشف مجموعتنا الحصرية المصممة بعناية لتمنحك إطلالة لا تقاوم وتفرد بلا حدود.',
                        'Discover our exclusive collection carefully crafted to give you an irresistible look and boundless uniqueness.',
                        'تسوق الآن',
                        'Shop Now',
                        'shop_all'
                    ),
                    $this->defaultSlide(
                        'slide-2',
                        '/images/products/paradisecare-home03.jpg',
                        'تصاميم تعكس شخصيتك',
                        'Designs Reflecting You',
                        'أناقة بلا تكلف',
                        'EFFORTLESS ELEGANCE',
                        'ارتقِ بمظهرك مع قطعنا الفريدة التي تجمع بين الرقي الكلاسيكي واللمسة العصرية.',
                        'Elevate your look with our unique pieces that blend classic sophistication with a modern touch.',
                        'اكتشف الجديد',
                        'Discover New',
                        'shop_new'
                    ),
                    $this->defaultSlide(
                        'slide-3',
                        '/images/products/paradisecare-shop-biomagneti-01-300x300.jpeg',
                        'فخامة بمتناول يديك',
                        'Luxury at Your Fingertips',
                        'عروض حصرية',
                        'EXCLUSIVE OFFERS',
                        'تسوق أفضل العلامات التجارية بأفضل الأسعار واستمتع بتجربة تسوق استثنائية.',
                        'Shop the best brands at the best prices and enjoy an exceptional shopping experience.',
                        'العروض الحالية',
                        'Current Offers',
                        'shop_offers'
                    ),
                ],
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

            $merged = array_replace_recursive($this->defaults(), $row->value ?? []);

            return $this->normalizeStorefront($merged);
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

        // Prefer full slides replacement when provided (avoid recursive merge of slide arrays).
        if (isset($payload['hero']['slides']) && is_array($payload['hero']['slides'])) {
            $merged = $previous;
            $merged['hero']['slides'] = $payload['hero']['slides'];
            unset($payload['hero']['slides']);
            $merged = array_replace_recursive($merged, $payload);
        } else {
            $merged = array_replace_recursive($previous, $payload);
        }

        $merged = $this->normalizeStorefront($merged);
        $merged = $this->translateAnnouncement($merged, $previous);
        $merged = $this->translateHeroSlides($merged, $previous);

        CmsSetting::query()->updateOrCreate(
            ['key' => self::STOREFRONT_KEY],
            ['value' => $merged]
        );

        return $merged;
    }

    private function normalizeStorefront(array $data): array
    {
        $hero = $data['hero'] ?? [];
        $slides = $hero['slides'] ?? null;

        // Migrate legacy single-hero shape → slides[].
        if (! is_array($slides) || $slides === []) {
            if (! empty($hero['heading']) || ! empty($hero['image'])) {
                $slides = [[
                    'id' => 'legacy-1',
                    'image' => (string) ($hero['image'] ?? ''),
                    'heading' => $this->localePair($hero['heading'] ?? []),
                    'subtitle' => $this->localePair($hero['subtitle'] ?? []),
                    'description' => $this->localePair($hero['description'] ?? []),
                    'cta' => $this->localePair($hero['cta'] ?? []),
                    'action' => [
                        'type' => 'custom',
                        'href' => (string) ($hero['link'] ?? '/shop'),
                    ],
                ]];
            } else {
                $slides = $this->defaults()['hero']['slides'];
            }
        }

        $normalized = [];
        foreach ($slides as $index => $slide) {
            if (! is_array($slide)) {
                continue;
            }
            $actionType = (string) data_get($slide, 'action.type', data_get($slide, 'action_type', 'shop_all'));
            if (! in_array($actionType, self::HERO_ACTIONS, true)) {
                $actionType = 'shop_all';
            }
            $href = (string) data_get($slide, 'action.href', data_get($slide, 'href', data_get($slide, 'link', '')));

            $normalized[] = [
                'id' => (string) ($slide['id'] ?? 'slide-'.($index + 1)),
                'image' => (string) ($slide['image'] ?? ''),
                'heading' => $this->localePair($slide['heading'] ?? []),
                'subtitle' => $this->localePair($slide['subtitle'] ?? []),
                'description' => $this->localePair($slide['description'] ?? []),
                'cta' => $this->localePair($slide['cta'] ?? []),
                'action' => [
                    'type' => $actionType,
                    'href' => $actionType === 'custom' ? ($href !== '' ? $href : '/shop') : null,
                ],
            ];
        }

        $data['hero'] = ['slides' => $normalized !== [] ? $normalized : $this->defaults()['hero']['slides']];

        return $data;
    }

    private function translateAnnouncement(array $merged, array $previous): array
    {
        $ar = trim((string) data_get($merged, 'announcement.text.ar', ''));
        $en = trim((string) data_get($merged, 'announcement.text.en', ''));
        $prevAr = trim((string) data_get($previous, 'announcement.text.ar', ''));

        if ($ar === '') {
            $merged['announcement']['text']['en'] = '';

            return $merged;
        }

        if ($en === '' || ($prevAr !== '' && $ar !== $prevAr)) {
            $merged['announcement']['text']['en'] = $this->translator->translate($ar);
        }

        return $merged;
    }

    private function translateHeroSlides(array $merged, array $previous): array
    {
        $slides = $merged['hero']['slides'] ?? [];
        $prevSlides = collect($previous['hero']['slides'] ?? [])->keyBy('id');

        foreach ($slides as $i => $slide) {
            $prev = $prevSlides->get($slide['id'] ?? '') ?? ($previous['hero']['slides'][$i] ?? null);

            foreach (self::HERO_LOCALE_FIELDS as $field) {
                $ar = trim((string) data_get($slide, "{$field}.ar", ''));
                $en = trim((string) data_get($slide, "{$field}.en", ''));
                $prevAr = trim((string) data_get($prev, "{$field}.ar", ''));

                if ($ar === '') {
                    $slides[$i][$field]['en'] = '';
                    continue;
                }

                if ($en === '' || ($prevAr !== '' && $ar !== $prevAr)) {
                    $slides[$i][$field]['en'] = $this->translator->translate($ar);
                }
            }
        }

        $merged['hero']['slides'] = $slides;

        return $merged;
    }

    private function defaultSlide(
        string $id,
        string $image,
        string $headingAr,
        string $headingEn,
        string $subtitleAr,
        string $subtitleEn,
        string $descriptionAr,
        string $descriptionEn,
        string $ctaAr,
        string $ctaEn,
        string $actionType
    ): array {
        return [
            'id' => $id,
            'image' => $image,
            'heading' => ['ar' => $headingAr, 'en' => $headingEn],
            'subtitle' => ['ar' => $subtitleAr, 'en' => $subtitleEn],
            'description' => ['ar' => $descriptionAr, 'en' => $descriptionEn],
            'cta' => ['ar' => $ctaAr, 'en' => $ctaEn],
            'action' => ['type' => $actionType, 'href' => null],
        ];
    }

    private function localePair(mixed $value): array
    {
        if (! is_array($value)) {
            return ['ar' => '', 'en' => ''];
        }

        return [
            'ar' => (string) ($value['ar'] ?? ''),
            'en' => (string) ($value['en'] ?? ''),
        ];
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
