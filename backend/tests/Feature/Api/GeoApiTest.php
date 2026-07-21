<?php

namespace Tests\Feature\Api;

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GeoApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_geo_cascade_endpoints_return_bilingual_rows(): void
    {
        $country = Country::query()->create([
            'iso2' => 'EG',
            'name_en' => 'Egypt',
            'name_ar' => 'مصر',
            'phonecode' => '20',
            'flag' => '🇪🇬',
            'is_active' => true,
        ]);
        $state = State::query()->create([
            'country_id' => $country->id,
            'code' => 'C',
            'name_en' => 'Cairo',
            'name_ar' => 'القاهرة',
            'is_active' => true,
        ]);
        City::query()->create([
            'country_id' => $country->id,
            'state_id' => $state->id,
            'name_en' => 'New Cairo',
            'name_ar' => 'القاهرة الجديدة',
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/geo/countries')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.name_ar', 'مصر')
            ->assertJsonPath('data.0.name_en', 'Egypt');

        $this->getJson("/api/v1/geo/countries/{$country->id}/states")
            ->assertOk()
            ->assertJsonPath('data.0.name_ar', 'القاهرة');

        $this->getJson("/api/v1/geo/states/{$state->id}/cities?q=New")
            ->assertOk()
            ->assertJsonPath('data.0.name_en', 'New Cairo')
            ->assertJsonPath('data.0.name_ar', 'القاهرة الجديدة');
    }
}
