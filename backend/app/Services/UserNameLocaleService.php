<?php

namespace App\Services;

use App\Models\User;
use App\Services\Translation\ProductTranslationService;

class UserNameLocaleService
{
    public function __construct(private readonly ProductTranslationService $translator) {}

    /**
     * Translate first/last name once into {ar,en} and keep string columns for legacy uses.
     *
     * @param  array{first_name: string, last_name: string}  $data
     * @return array{
     *   first_name: string,
     *   last_name: string,
     *   name: string,
     *   first_name_i18n: array{ar: string, en: string},
     *   last_name_i18n: array{ar: string, en: string},
     *   name_i18n: array{ar: string, en: string}
     * }
     */
    public function localizeNameParts(User $user, array $data): array
    {
        $first = $this->translator->bilingualFromText(
            trim((string) $data['first_name']),
            is_array($user->first_name_i18n) ? $user->first_name_i18n : null
        );
        $last = $this->translator->bilingualFromText(
            trim((string) $data['last_name']),
            is_array($user->last_name_i18n) ? $user->last_name_i18n : null
        );

        $name = [
            'ar' => trim(($first['ar'] ?? '').' '.($last['ar'] ?? '')),
            'en' => trim(($first['en'] ?? '').' '.($last['en'] ?? '')),
        ];

        // Prefer Arabic on legacy string columns (owner content source), else English.
        $firstStr = ($first['ar'] !== '' ? $first['ar'] : $first['en']) ?: trim((string) $data['first_name']);
        $lastStr = ($last['ar'] !== '' ? $last['ar'] : $last['en']) ?: trim((string) $data['last_name']);

        return [
            'first_name' => $firstStr,
            'last_name' => $lastStr,
            'name' => trim($firstStr.' '.$lastStr) ?: $firstStr,
            'first_name_i18n' => $first,
            'last_name_i18n' => $last,
            'name_i18n' => $name,
        ];
    }

    /**
     * Backfill missing i18n once for existing accounts (settings / me).
     */
    public function ensureLocales(User $user): User
    {
        if ($this->hasLocales($user)) {
            return $user;
        }

        $first = trim((string) ($user->first_name ?: ''));
        $last = trim((string) ($user->last_name ?: ''));
        if ($first === '' && trim((string) $user->name) !== '') {
            $parts = preg_split('/\s+/u', trim((string) $user->name), 2) ?: [];
            $first = trim((string) ($parts[0] ?? 'User'));
            $last = trim((string) ($parts[1] ?? ''));
        }
        if ($first === '') {
            $first = 'User';
        }

        $payload = $this->localizeNameParts($user, [
            'first_name' => $first,
            'last_name' => $last,
        ]);

        $user->fill($payload)->save();

        return $user->fresh() ?? $user;
    }

    private function hasLocales(User $user): bool
    {
        $first = is_array($user->first_name_i18n) ? $user->first_name_i18n : null;
        $last = is_array($user->last_name_i18n) ? $user->last_name_i18n : null;
        $name = is_array($user->name_i18n) ? $user->name_i18n : null;

        if (! $first || ! $last || ! $name) {
            return false;
        }

        $firstOk = trim((string) ($first['ar'] ?? '')) !== '' || trim((string) ($first['en'] ?? '')) !== '';

        return $firstOk;
    }
}
