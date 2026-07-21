<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class PostalCodeSeeder extends Seeder
{
    public function run(): void
    {
        $ndjson = database_path('data/geo/postal-codes.ndjson');

        if (File::exists($ndjson)) {
            $this->seedFromNdjson($ndjson);

            return;
        }

        $zipPath = database_path('data/geo/postal/allCountries.zip');
        $txtPath = database_path('data/geo/postal/allCountries.txt');

        if (File::exists($txtPath) || File::exists($zipPath)) {
            $this->seedFromGeoNames($txtPath, $zipPath);

            return;
        }

        $this->command?->warn('No GeoNames postal dump found; seeding curated MENA fallback only.');
        $this->seedCuratedOnly();
    }

    private function seedFromNdjson(string $ndjson): void
    {
        $this->command?->info('Seeding postal codes from NDJSON…');

        $handle = fopen($ndjson, 'rb');
        if ($handle === false) {
            throw new \RuntimeException("Unable to open {$ndjson}");
        }

        $chunk = [];
        $total = 0;
        $now = now()->toDateTimeString();
        $countryIds = [];

        while (($line = fgets($handle)) !== false) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            /** @var array<string, mixed> $row */
            $row = json_decode($line, true, 512, JSON_THROW_ON_ERROR);
            $countryIds[(int) $row['country_id']] = true;
            $chunk[] = [
                'country_id' => (int) $row['country_id'],
                'state_id' => (int) $row['state_id'],
                'city_id' => (int) $row['city_id'],
                'code' => (string) $row['code'],
                'place_name_en' => $row['place_name_en'] ?? null,
                'place_name_ar' => $row['place_name_ar'] ?? null,
                'is_active' => (bool) ($row['is_active'] ?? true),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($chunk) >= 500) {
                $this->upsertByCityCode($chunk);
                $total += count($chunk);
                $chunk = [];
                if ($total % 25000 === 0) {
                    $this->command?->info("  … {$total}");
                }
            }
        }
        fclose($handle);

        if ($chunk !== []) {
            $this->upsertByCityCode($chunk);
            $total += count($chunk);
        }

        $this->applyCuratedOverlays();
        $this->fillNearestNeighborCities(array_keys($countryIds));
        $this->flagCountries(array_keys($countryIds));
        $this->syncSequence();
        $this->command?->info("Postal seeding complete ({$total}+ curated/fill).");
    }

    private function seedFromGeoNames(string $txtPath, string $zipPath): void
    {
        if (! File::exists($txtPath)) {
            $this->command?->info('Extracting GeoNames postal zip…');
            $dir = database_path('data/geo/postal');
            $zip = new \ZipArchive;
            if ($zip->open($zipPath) !== true) {
                throw new \RuntimeException("Unable to open {$zipPath}");
            }
            $zip->extractTo($dir);
            $zip->close();
        }

        $this->command?->info('Streaming GeoNames postal dump into database…');

        $countries = DB::table('countries')->get(['id', 'iso2'])->keyBy(fn ($c) => strtoupper((string) $c->iso2));
        $cities = DB::table('cities')->get(['id', 'country_id', 'state_id', 'name_en', 'name_ar', 'latitude', 'longitude']);

        /** @var array<int, array{byName: array<string, object>, grid: array<string, list<object>>, list: list<object>}> $index */
        $index = [];
        foreach ($cities as $city) {
            $cid = (int) $city->country_id;
            if (! isset($index[$cid])) {
                $index[$cid] = ['byName' => [], 'grid' => [], 'list' => []];
            }
            $index[$cid]['list'][] = $city;
            foreach ([$city->name_en, $city->name_ar] as $name) {
                $n = $this->normalize((string) $name);
                if ($n !== '') {
                    $index[$cid]['byName'][$n] ??= $city;
                }
            }
            if ($city->latitude !== null && $city->longitude !== null) {
                $key = $this->cellKey((float) $city->latitude, (float) $city->longitude);
                $index[$cid]['grid'][$key][] = $city;
            }
        }

        $handle = fopen($txtPath, 'rb');
        if ($handle === false) {
            throw new \RuntimeException("Unable to open {$txtPath}");
        }

        $chunk = [];
        $seen = [];
        $total = 0;
        $countryIds = [];
        $now = now()->toDateTimeString();
        $lineNo = 0;

        while (($line = fgets($handle)) !== false) {
            $lineNo++;
            $parts = explode("\t", rtrim($line, "\r\n"));
            $iso = strtoupper(trim($parts[0] ?? ''));
            $code = trim($parts[1] ?? '');
            if ($iso === '' || $code === '') {
                continue;
            }
            $country = $countries->get($iso);
            if (! $country) {
                continue;
            }
            $idx = $index[(int) $country->id] ?? null;
            if (! $idx) {
                continue;
            }

            $place = $parts[2] ?? '';
            $admin1 = $parts[3] ?? '';
            $admin2 = $parts[5] ?? '';
            $lat = isset($parts[9]) && $parts[9] !== '' ? (float) $parts[9] : null;
            $lng = isset($parts[10]) && $parts[10] !== '' ? (float) $parts[10] : null;

            $city = $this->findByName($idx['byName'], $place, $admin2, $admin1)
                ?? $this->findNearest($idx['grid'], $lat, $lng);

            if (! $city) {
                continue;
            }

            $cityId = (int) $city->id;
            $dedupe = $cityId.'|'.$code;
            if (isset($seen[$dedupe])) {
                continue;
            }
            $seen[$dedupe] = true;
            $countryIds[(int) $country->id] = true;

            $chunk[] = [
                'country_id' => (int) $country->id,
                'state_id' => (int) $city->state_id,
                'city_id' => $cityId,
                'code' => $code,
                'place_name_en' => $place !== '' ? $place : null,
                'place_name_ar' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            if (count($chunk) >= 500) {
                $this->upsertByCityCode($chunk);
                $total += count($chunk);
                $chunk = [];
                if ($total % 25000 === 0) {
                    $this->command?->info("  … {$total} (line {$lineNo})");
                }
            }
        }
        fclose($handle);

        if ($chunk !== []) {
            $this->upsertByCityCode($chunk);
            $total += count($chunk);
        }

        unset($seen);

        $this->applyCuratedOverlays();
        foreach (['EG', 'SA', 'JO'] as $iso) {
            $c = $countries->get($iso);
            if ($c) {
                $countryIds[(int) $c->id] = true;
            }
        }
        $this->fillNearestNeighborCities(array_keys($countryIds));
        $this->flagCountries(array_keys($countryIds));
        $this->syncSequence();
        $this->command?->info("Postal seeding complete ({$total}+ curated/fill from GeoNames).");
    }

    private function seedCuratedOnly(): void
    {
        $ids = $this->applyCuratedOverlays();
        $this->flagCountries($ids);
        $this->syncSequence();
    }

    /**
     * @return list<int>
     */
    private function applyCuratedOverlays(): array
    {
        $files = [
            'EG' => 'curated-EG.json',
            'SA' => 'curated-SA.json',
            'JO' => 'curated-JO.json',
        ];
        $dir = database_path('data/geo/postal');
        $now = now()->toDateTimeString();
        $flagged = [];

        foreach ($files as $iso => $file) {
            $path = $dir.'/'.$file;
            if (! File::exists($path)) {
                continue;
            }
            $country = DB::table('countries')->where('iso2', $iso)->first();
            if (! $country) {
                continue;
            }

            /** @var list<array<string, mixed>> $rows */
            $rows = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);
            $cities = DB::table('cities')
                ->where('country_id', $country->id)
                ->get(['id', 'state_id', 'name_en']);
            $byName = [];
            foreach ($cities as $city) {
                $byName[$this->normalize((string) $city->name_en)] = $city;
            }

            $payload = [];
            foreach ($rows as $row) {
                $city = $byName[$this->normalize((string) ($row['city_name_en'] ?? ''))] ?? null;
                if (! $city) {
                    continue;
                }
                $payload[] = [
                    'country_id' => (int) $country->id,
                    'state_id' => (int) $city->state_id,
                    'city_id' => (int) $city->id,
                    'code' => (string) $row['code'],
                    'place_name_en' => $row['place_name_en'] ?? null,
                    'place_name_ar' => $row['place_name_ar'] ?? null,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            foreach (array_chunk($payload, 200) as $chunk) {
                $this->upsertByCityCode($chunk);
            }

            if ($payload !== []) {
                $flagged[] = (int) $country->id;
                $this->command?->info("Curated {$iso}: ".count($payload).' codes');
            }
        }

        return $flagged;
    }

    /**
     * @param  list<int>  $countryIds
     */
    private function fillNearestNeighborCities(array $countryIds): void
    {
        if ($countryIds === []) {
            return;
        }

        $now = now()->toDateTimeString();
        $filled = 0;

        foreach ($countryIds as $countryId) {
            $cities = DB::table('cities')
                ->where('country_id', $countryId)
                ->get(['id', 'country_id', 'state_id', 'latitude', 'longitude']);

            $withCodes = DB::table('postal_codes')
                ->where('country_id', $countryId)
                ->select('city_id', 'code', 'place_name_en', 'place_name_ar')
                ->orderBy('id')
                ->get()
                ->unique('city_id')
                ->keyBy('city_id');

            if ($withCodes->isEmpty()) {
                continue;
            }

            $donorCities = $cities->filter(fn ($c) => $withCodes->has($c->id))->values();
            $payload = [];

            foreach ($cities as $city) {
                if ($withCodes->has($city->id)) {
                    continue;
                }

                $donor = null;
                if ($city->latitude !== null && $city->longitude !== null) {
                    $bestD = INF;
                    foreach ($donorCities as $other) {
                        if ($other->latitude === null || $other->longitude === null) {
                            continue;
                        }
                        $dLat = (float) $city->latitude - (float) $other->latitude;
                        $dLng = (float) $city->longitude - (float) $other->longitude;
                        $d = $dLat * $dLat + $dLng * $dLng;
                        if ($d < $bestD) {
                            $bestD = $d;
                            $donor = $other;
                        }
                    }
                }
                $donor ??= $donorCities->first(fn ($c) => (int) $c->state_id === (int) $city->state_id)
                    ?? $donorCities->first();

                if (! $donor) {
                    continue;
                }

                $src = $withCodes->get($donor->id);
                $payload[] = [
                    'country_id' => (int) $city->country_id,
                    'state_id' => (int) $city->state_id,
                    'city_id' => (int) $city->id,
                    'code' => (string) $src->code,
                    'place_name_en' => $src->place_name_en,
                    'place_name_ar' => $src->place_name_ar,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
                $filled++;

                if (count($payload) >= 500) {
                    $this->upsertByCityCode($payload);
                    $payload = [];
                }
            }

            if ($payload !== []) {
                $this->upsertByCityCode($payload);
            }
        }

        $this->command?->info("Nearest-neighbor city fill: +{$filled}");
    }

    /**
     * @param  list<array<string, mixed>>  $chunk
     */
    private function upsertByCityCode(array $chunk): void
    {
        DB::table('postal_codes')->upsert(
            $chunk,
            ['city_id', 'code'],
            ['country_id', 'state_id', 'place_name_en', 'place_name_ar', 'is_active', 'updated_at']
        );
    }

    /**
     * @param  list<int>  $countryIds
     */
    private function flagCountries(array $countryIds): void
    {
        $fromDb = DB::table('postal_codes')->distinct()->pluck('country_id')->all();
        $ids = array_values(array_unique(array_merge($countryIds, array_map('intval', $fromDb))));

        DB::table('countries')->update(['postal_code_required' => false]);
        if ($ids !== []) {
            DB::table('countries')->whereIn('id', $ids)->update(['postal_code_required' => true]);
        }
    }

    private function syncSequence(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('postal_codes', 'id'), COALESCE((SELECT MAX(id) FROM postal_codes), 1))");
        }
    }

    private function normalize(string $value): string
    {
        if (class_exists(\Normalizer::class)) {
            $value = \Normalizer::normalize($value, \Normalizer::FORM_KD) ?: $value;
            $value = preg_replace('/\p{Mn}/u', '', $value) ?? $value;
        }
        $value = mb_strtolower($value);
        $value = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $value) ?? $value;

        return trim(preg_replace('/\s+/u', ' ', $value) ?? $value);
    }

    /**
     * @param  array<string, object>  $byName
     */
    private function findByName(array $byName, string ...$names): ?object
    {
        foreach ($names as $name) {
            $n = $this->normalize($name);
            if ($n !== '' && isset($byName[$n])) {
                return $byName[$n];
            }
        }

        return null;
    }

    /**
     * @param  array<string, list<object>>  $grid
     */
    private function findNearest(array $grid, ?float $lat, ?float $lng): ?object
    {
        if ($lat === null || $lng === null) {
            return null;
        }

        $scale = 2;
        $baseLat = (int) floor($lat * $scale);
        $baseLng = (int) floor($lng * $scale);
        $best = null;
        $bestD = INF;

        for ($dLat = -1; $dLat <= 1; $dLat++) {
            for ($dLng = -1; $dLng <= 1; $dLng++) {
                $key = ($baseLat + $dLat).'_'.($baseLng + $dLng);
                foreach ($grid[$key] ?? [] as $city) {
                    $dY = $lat - (float) $city->latitude;
                    $dX = $lng - (float) $city->longitude;
                    $d = $dY * $dY + $dX * $dX;
                    if ($d < $bestD) {
                        $bestD = $d;
                        $best = $city;
                    }
                }
            }
        }

        return ($best && $bestD <= 1.0) ? $best : null;
    }

    private function cellKey(float $lat, float $lng, int $scale = 2): string
    {
        return ((int) floor($lat * $scale)).'_'.((int) floor($lng * $scale));
    }
}
