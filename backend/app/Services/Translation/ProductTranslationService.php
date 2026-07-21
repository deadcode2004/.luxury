<?php

namespace App\Services\Translation;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductTranslationService
{
    /**
     * Translate Arabic product fields to English once and return merged locale arrays.
     * Uses MyMemory as primary and LibreTranslate as fallback.
     */
    public function fillEnglishLocales(array $data, ?array $previous = null): array
    {
        foreach (['name', 'brand', 'description', 'usage'] as $field) {
            if (! isset($data[$field]) || ! is_array($data[$field])) {
                continue;
            }

            $ar = trim((string) ($data[$field]['ar'] ?? ''));
            $en = trim((string) ($data[$field]['en'] ?? ''));
            $prevAr = trim((string) data_get($previous, "{$field}.ar", ''));

            $shouldTranslate = $ar !== '' && ($en === '' || ($prevAr !== '' && $ar !== $prevAr));
            if ($shouldTranslate) {
                $data[$field]['en'] = $this->translate($ar, 'ar', 'en');
            } elseif ($en === '' && $ar !== '') {
                $data[$field]['en'] = $ar;
            }
        }

        if (isset($data['ingredients']) && is_array($data['ingredients'])) {
            $arList = $data['ingredients']['ar'] ?? null;
            $enList = $data['ingredients']['en'] ?? null;
            $prevArList = data_get($previous, 'ingredients.ar');

            if (is_array($arList) && $arList !== []) {
                $changed = json_encode($arList) !== json_encode($prevArList);
                if (! is_array($enList) || $enList === [] || $changed) {
                    $data['ingredients']['en'] = array_map(
                        fn ($item) => $this->translate((string) $item, 'ar', 'en'),
                        $arList
                    );
                }
            }
        }

        return $data;
    }

    /**
     * Build {ar, en} once from free-text (reviews). Re-uses previous locales when unchanged.
     *
     * - Arabic source → store ar, translate to en
     * - Latin / other (en, de, …) → store original in en, translate to ar
     *
     * @param  array{ar?: string, en?: string}|null  $previousLocales
     * @return array{ar: string, en: string}
     */
    public function bilingualFromText(string $text, ?array $previousLocales = null): array
    {
        $text = trim($text);
        if ($text === '') {
            return ['ar' => '', 'en' => ''];
        }

        $prevAr = trim((string) ($previousLocales['ar'] ?? ''));
        $prevEn = trim((string) ($previousLocales['en'] ?? ''));

        // Unchanged comment → keep stored translations (no re-translate).
        if ($previousLocales !== null && ($text === $prevAr || $text === $prevEn)) {
            return ['ar' => $prevAr, 'en' => $prevEn !== '' ? $prevEn : $prevAr];
        }

        $source = $this->detectSourceLocale($text);

        if ($source === 'ar') {
            return [
                'ar' => $text,
                'en' => $this->translate($text, 'ar', 'en') ?: $text,
            ];
        }

        // English / German / other Latin scripts: keep original on en, translate to ar once.
        return [
            'en' => $text,
            'ar' => $this->translate($text, 'auto', 'ar') ?: $text,
        ];
    }

    /**
     * @return 'ar'|'en'
     */
    public function detectSourceLocale(string $text): string
    {
        $text = trim($text);
        if ($text === '') {
            return 'ar';
        }

        $letters = preg_match_all('/\p{L}/u', $text);
        $arabic = preg_match_all('/\p{Arabic}/u', $text);

        if ($letters > 0 && ($arabic / max($letters, 1)) >= 0.3) {
            return 'ar';
        }

        return 'en';
    }

    /**
     * Translate between locales. Defaults keep existing product AR→EN behaviour.
     */
    public function translate(string $text, string $source = 'ar', string $target = 'en'): string
    {
        $text = trim($text);
        if ($text === '') {
            return '';
        }

        $source = strtolower($source);
        $target = strtolower($target);

        if ($source === $target) {
            return $text;
        }

        $langpair = $source === 'auto'
            ? 'Autodetect|'.$target
            : $source.'|'.$target;

        try {
            $primary = Http::timeout(8)->get('https://api.mymemory.translated.net/get', [
                'q' => $text,
                'langpair' => $langpair,
            ]);

            if ($primary->successful()) {
                $translated = (string) data_get($primary->json(), 'responseData.translatedText', '');
                if ($this->isValidTranslation($translated, $text)) {
                    return $translated;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('MyMemory translation failed', ['error' => $e->getMessage(), 'pair' => $langpair]);
        }

        try {
            $ltSource = $source === 'auto' ? 'auto' : $source;
            $fallback = Http::timeout(8)->post('https://libretranslate.com/translate', [
                'q' => $text,
                'source' => $ltSource,
                'target' => $target,
                'format' => 'text',
            ]);

            if ($fallback->successful()) {
                $translated = (string) data_get($fallback->json(), 'translatedText', '');
                if ($this->isValidTranslation($translated, $text)) {
                    return $translated;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('LibreTranslate translation failed', ['error' => $e->getMessage(), 'pair' => $langpair]);
        }

        return $text;
    }

    private function isValidTranslation(string $translated, string $source): bool
    {
        $translated = trim($translated);
        if ($translated === '') {
            return false;
        }

        // Reject obvious API error payloads.
        if (str_contains(strtolower($translated), 'invalid') && strlen($translated) < 40) {
            return false;
        }

        if (str_contains(strtolower($translated), 'please select') && strlen($translated) < 80) {
            return false;
        }

        return true;
    }
}
