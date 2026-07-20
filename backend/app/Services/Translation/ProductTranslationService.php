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
                $data[$field]['en'] = $this->translate($ar);
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
                    $data['ingredients']['en'] = array_map(fn ($item) => $this->translate((string) $item), $arList);
                }
            }
        }

        return $data;
    }

    public function translate(string $text): string
    {
        $text = trim($text);
        if ($text === '') {
            return '';
        }

        try {
            $primary = Http::timeout(8)->get('https://api.mymemory.translated.net/get', [
                'q' => $text,
                'langpair' => 'ar|en',
            ]);

            if ($primary->successful()) {
                $translated = (string) data_get($primary->json(), 'responseData.translatedText', '');
                if ($this->isValidTranslation($translated, $text)) {
                    return $translated;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('MyMemory translation failed', ['error' => $e->getMessage()]);
        }

        try {
            $fallback = Http::timeout(8)->post('https://libretranslate.com/translate', [
                'q' => $text,
                'source' => 'ar',
                'target' => 'en',
                'format' => 'text',
            ]);

            if ($fallback->successful()) {
                $translated = (string) data_get($fallback->json(), 'translatedText', '');
                if ($this->isValidTranslation($translated, $text)) {
                    return $translated;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('LibreTranslate translation failed', ['error' => $e->getMessage()]);
        }

        // Last resort: keep Arabic so product remains usable.
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

        return true;
    }
}
