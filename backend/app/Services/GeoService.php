<?php

namespace App\Services;

use App\Exceptions\DomainException;
use App\Models\City;
use App\Models\Country;
use App\Models\PostalCode;
use App\Models\State;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Request;

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

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function postalCodes(int $cityId, ?string $query = null, int $limit = 50): Collection
    {
        $q = PostalCode::query()
            ->where('city_id', $cityId)
            ->where('is_active', true)
            ->orderBy('code');

        $term = trim((string) $query);
        if ($term !== '') {
            $driver = $q->getConnection()->getDriverName();
            $operator = $driver === 'pgsql' ? 'ilike' : 'like';
            $q->where(function (Builder $inner) use ($term, $operator) {
                $inner->where('code', $operator, $term.'%')
                    ->orWhere('place_name_en', $operator, '%'.$term.'%')
                    ->orWhere('place_name_ar', $operator, '%'.$term.'%');
            });
        }

        return $q->limit(max(1, min($limit, 100)))->get()->map(fn (PostalCode $p) => [
            'id' => $p->id,
            'country_id' => $p->country_id,
            'state_id' => $p->state_id,
            'city_id' => $p->city_id,
            'code' => $p->code,
            'place_name_en' => $p->place_name_en,
            'place_name_ar' => $p->place_name_ar,
        ]);
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
     * Hierarchy: Country → State/Province → City → Postal Code.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public function resolveShippingAddress(array $input): array
    {
        $countryId = (int) ($input['country_id'] ?? 0);
        $stateId = (int) ($input['state_id'] ?? 0);
        $cityId = (int) ($input['city_id'] ?? 0);
        $zipRaw = isset($input['zip_code']) ? trim((string) $input['zip_code']) : '';

        $country = $this->country($countryId);
        if (! $country) {
            throw new DomainException(
                $this->msg('دولة غير صالحة.', 'Invalid country.'),
                422,
                'INVALID_COUNTRY',
                ['shipping_address.country_id' => [$this->msg('دولة غير صالحة.', 'Invalid country.')]]
            );
        }

        $state = null;
        if ($stateId > 0) {
            $state = State::query()
                ->where('is_active', true)
                ->where('id', $stateId)
                ->where('country_id', $country->id)
                ->first();
            if (! $state) {
                throw new DomainException(
                    $this->msg(
                        'المحافظة/الولاية لا تتبع الدولة المختارة.',
                        'The selected state/province does not belong to the selected country.'
                    ),
                    422,
                    'INVALID_STATE',
                    ['shipping_address.state_id' => [$this->msg(
                        'المحافظة/الولاية لا تتبع الدولة المختارة.',
                        'The selected state/province does not belong to the selected country.'
                    )]]
                );
            }
        }

        $cityQuery = City::query()
            ->where('is_active', true)
            ->where('id', $cityId)
            ->where('country_id', $country->id);

        if ($state) {
            $cityQuery->where('state_id', $state->id);
        }

        $city = $cityQuery->first();
        if (! $city) {
            throw new DomainException(
                $this->msg(
                    'المدينة لا تتبع المحافظة/الولاية المختارة.',
                    'The selected city does not belong to the selected state/province.'
                ),
                422,
                'INVALID_CITY',
                ['shipping_address.city_id' => [$this->msg(
                    'المدينة لا تتبع المحافظة/الولاية المختارة.',
                    'The selected city does not belong to the selected state/province.'
                )]]
            );
        }

        $postalRequired = (bool) $country->postal_code_required;
        $postal = null;

        if ($postalRequired) {
            if ($zipRaw === '') {
                throw new DomainException(
                    $this->msg('الرمز البريدي مطلوب لهذه الدولة.', 'Postal code is required for this country.'),
                    422,
                    'POSTAL_CODE_REQUIRED',
                    ['shipping_address.zip_code' => [$this->msg(
                        'الرمز البريدي مطلوب لهذه الدولة.',
                        'Postal code is required for this country.'
                    )]]
                );
            }

            $postal = $this->findPostalForCity($city, $zipRaw);
            if (! $postal) {
                throw new DomainException(
                    $this->msg(
                        'الرمز البريدي لا يتطابق مع المدينة المختارة.',
                        'The postal code does not match the selected city.'
                    ),
                    422,
                    'INVALID_POSTAL_CODE',
                    ['shipping_address.zip_code' => [$this->msg(
                        'الرمز البريدي لا يتطابق مع المدينة المختارة.',
                        'The postal code does not match the selected city.'
                    )]]
                );
            }
        } elseif ($zipRaw !== '') {
            // Optional zip: if the city has postal rows, still enforce membership when provided.
            $cityHasPostal = PostalCode::query()
                ->where('city_id', $city->id)
                ->where('is_active', true)
                ->exists();

            if ($cityHasPostal) {
                $postal = $this->findPostalForCity($city, $zipRaw);
                if (! $postal) {
                    throw new DomainException(
                        $this->msg(
                            'الرمز البريدي لا يتطابق مع المدينة المختارة.',
                            'The postal code does not match the selected city.'
                        ),
                        422,
                        'INVALID_POSTAL_CODE',
                        ['shipping_address.zip_code' => [$this->msg(
                            'الرمز البريدي لا يتطابق مع المدينة المختارة.',
                            'The postal code does not match the selected city.'
                        )]]
                    );
                }
            }
        }

        return [
            'country_id' => $country->id,
            'state_id' => $state?->id,
            'city_id' => $city->id,
            'postal_code_id' => $postal?->id,
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
            'zip_code' => $postal?->code ?? ($zipRaw !== '' ? $zipRaw : null),
            'phone_country_code' => $input['phone_country_code'] ?? null,
            'phone_dial_code' => $input['phone_dial_code'] ?? null,
        ];
    }

    private function findPostalForCity(City $city, string $zipRaw): ?PostalCode
    {
        $normalized = $this->normalizePostalCode($zipRaw);

        return PostalCode::query()
            ->where('is_active', true)
            ->where('city_id', $city->id)
            ->where('state_id', $city->state_id)
            ->where('country_id', $city->country_id)
            ->where(function (Builder $q) use ($zipRaw, $normalized) {
                $q->where('code', $zipRaw)
                    ->orWhereRaw('LOWER(REPLACE(code, \' \', \'\')) = ?', [$normalized]);
            })
            ->first();
    }

    private function normalizePostalCode(string $code): string
    {
        return strtolower(preg_replace('/\s+/', '', trim($code)) ?? '');
    }

    private function msg(string $ar, string $en): string
    {
        return $this->requestLang() === 'ar' ? $ar : $en;
    }

    private function requestLang(): string
    {
        $request = Request::instance();
        $explicit = strtolower((string) $request->header('X-Locale', $request->query('lang', '')));
        if (str_starts_with($explicit, 'ar')) {
            return 'ar';
        }
        if (str_starts_with($explicit, 'en')) {
            return 'en';
        }

        $accept = strtolower((string) $request->header('Accept-Language', 'en'));

        return str_starts_with($accept, 'ar') ? 'ar' : 'en';
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
            'postal_code_required' => (bool) $c->postal_code_required,
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
