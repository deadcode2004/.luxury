<?php

namespace App\Services;

use App\Models\City;
use App\Models\Country;
use App\Models\State;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class GeoService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function countries(?string $query = null, int $limit = 300): Collection
    {
        $q = Country::query()->where('is_active', true)->orderBy('name_en');
        $this->applySearch($q, $query, ['name_en', 'name_ar', 'iso2']);

        return $q->limit(max(1, min($limit, 500)))->get()->map(fn (Country $c) => $this->mapCountry($c));
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function states(int $countryId, ?string $query = null, int $limit = 500): Collection
    {
        $q = State::query()
            ->where('country_id', $countryId)
            ->where('is_active', true)
            ->orderBy('name_en');
        $this->applySearch($q, $query, ['name_en', 'name_ar', 'code']);

        return $q->limit(max(1, min($limit, 1000)))->get()->map(fn (State $s) => $this->mapState($s));
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function cities(int $stateId, ?string $query = null, int $limit = 200): Collection
    {
        $q = City::query()
            ->where('state_id', $stateId)
            ->where('is_active', true)
            ->orderBy('name_en');
        $this->applySearch($q, $query, ['name_en', 'name_ar']);

        return $q->limit(max(1, min($limit, 500)))->get()->map(fn (City $c) => $this->mapCity($c));
    }

    public function country(int $id): ?Country
    {
        return Country::query()->where('is_active', true)->find($id);
    }

    public function state(int $id): ?State
    {
        return State::query()->where('is_active', true)->find($id);
    }

    public function city(int $id): ?City
    {
        return City::query()->where('is_active', true)->find($id);
    }

    public function countryByIso2(string $iso2): ?Country
    {
        return Country::query()
            ->where('is_active', true)
            ->where('iso2', strtoupper($iso2))
            ->first();
    }

    /**
     * Resolve checkout geo IDs into a shipping_address snapshot.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function resolveShippingAddress(array $input): array
    {
        $countryId = (int) ($input['country_id'] ?? 0);
        $stateId = (int) ($input['state_id'] ?? 0);
        $cityId = (int) ($input['city_id'] ?? 0);

        $country = $this->country($countryId);
        abort_if(! $country, 422, 'Invalid country_id');

        $state = null;
        if ($stateId > 0) {
            $state = State::query()
                ->where('is_active', true)
                ->where('id', $stateId)
                ->where('country_id', $country->id)
                ->first();
            abort_if(! $state, 422, 'Invalid state_id');
        }

        $city = City::query()
            ->where('is_active', true)
            ->where('id', $cityId)
            ->where('country_id', $country->id)
            ->when($state, fn ($q) => $q->where('state_id', $state->id))
            ->first();
        abort_if(! $city, 422, 'Invalid city_id');

        return [
            'country_id' => $country->id,
            'state_id' => $state?->id,
            'city_id' => $city->id,
            'country_code' => $country->iso2,
            'state_code' => $state?->code,
            'country_name_en' => $country->name_en,
            'country_name_ar' => $country->name_ar,
            'state_name_en' => $state?->name_en,
            'state_name_ar' => $state?->name_ar,
            'city_name_en' => $city->name_en,
            'city_name_ar' => $city->name_ar,
            // Legacy display keys (English) for older admin views.
            'country_name' => $country->name_en,
            'state_name' => $state?->name_en,
            'city' => $city->name_en,
            'full_address' => (string) ($input['full_address'] ?? ''),
            'zip_code' => $input['zip_code'] ?? null,
            'phone_country_code' => $input['phone_country_code'] ?? null,
            'phone_dial_code' => $input['phone_dial_code'] ?? null,
        ];
    }

    /**
     * @param  Builder<\Illuminate\Database\Eloquent\Model>  $query
     * @param  list<string>  $columns
     */
    private function applySearch(Builder $query, ?string $search, array $columns): void
    {
        $term = trim((string) $search);
        if ($term === '') {
            return;
        }

        $like = '%'.$term.'%';
        $driver = $query->getConnection()->getDriverName();
        $operator = $driver === 'pgsql' ? 'ilike' : 'like';
        $query->where(function (Builder $inner) use ($columns, $like, $operator) {
            foreach ($columns as $i => $col) {
                $method = $i === 0 ? 'where' : 'orWhere';
                $inner->{$method}($col, $operator, $like);
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function mapCountry(Country $c): array
    {
        return [
            'id' => $c->id,
            'iso2' => $c->iso2,
            'name_en' => $c->name_en,
            'name_ar' => $c->name_ar,
            'phonecode' => $c->phonecode,
            'flag' => $c->flag,
            'dial_code' => $c->phonecode ? '+'.$c->phonecode : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapState(State $s): array
    {
        return [
            'id' => $s->id,
            'country_id' => $s->country_id,
            'code' => $s->code,
            'name_en' => $s->name_en,
            'name_ar' => $s->name_ar,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapCity(City $c): array
    {
        return [
            'id' => $c->id,
            'country_id' => $c->country_id,
            'state_id' => $c->state_id,
            'name_en' => $c->name_en,
            'name_ar' => $c->name_ar,
        ];
    }
}
