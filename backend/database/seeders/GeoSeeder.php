<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class GeoSeeder extends Seeder
{
    public function run(): void
    {
        $base = database_path('data/geo');

        $this->command?->info('Seeding geo countries…');
        $this->upsertJson($base.'/countries.json', 'countries', [
            'id', 'iso2', 'name_en', 'name_ar', 'phonecode', 'flag', 'currency', 'is_active',
        ]);

        $this->command?->info('Seeding geo states…');
        $this->upsertJson($base.'/states.json', 'states', [
            'id', 'country_id', 'code', 'name_en', 'name_ar', 'is_active',
        ]);

        $this->command?->info('Seeding geo cities…');
        $this->upsertJson($base.'/cities.json', 'cities', [
            'id', 'country_id', 'state_id', 'name_en', 'name_ar', 'latitude', 'longitude', 'geoname_id', 'is_active',
        ], chunkSize: 500);

        // Keep sequences in sync for PostgreSQL after explicit IDs.
        if (DB::getDriverName() === 'pgsql') {
            foreach (['countries', 'states', 'cities'] as $table) {
                DB::statement("SELECT setval(pg_get_serial_sequence('{$table}', 'id'), COALESCE((SELECT MAX(id) FROM {$table}), 1))");
            }
        }

        $this->command?->info('Geo seeding complete.');
    }

    /**
     * @param  list<string>  $columns
     */
    private function upsertJson(string $path, string $table, array $columns, int $chunkSize = 200): void
    {
        if (! File::exists($path)) {
            throw new \RuntimeException("Missing geo seed file: {$path}. Run: node scripts/build-geo-seed.cjs");
        }

        /** @var list<array<string, mixed>> $rows */
        $rows = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);
        $now = now()->toDateTimeString();

        foreach (array_chunk($rows, $chunkSize) as $chunk) {
            $payload = array_map(function (array $row) use ($columns, $now) {
                $out = [];
                foreach ($columns as $col) {
                    $out[$col] = $row[$col] ?? null;
                }
                $out['created_at'] = $now;
                $out['updated_at'] = $now;

                return $out;
            }, $chunk);

            DB::table($table)->upsert(
                $payload,
                ['id'],
                array_values(array_diff($columns, ['id']))
            );
        }
    }
}
