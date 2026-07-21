<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostalCode extends Model
{
    protected $fillable = [
        'country_id',
        'state_id',
        'city_id',
        'code',
        'place_name_en',
        'place_name_ar',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function localizedPlaceName(string $lang): ?string
    {
        if ($lang === 'ar') {
            return $this->place_name_ar ?: $this->place_name_en;
        }

        return $this->place_name_en ?: $this->place_name_ar;
    }
}
