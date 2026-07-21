<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends Model
{
    protected $fillable = [
        'iso2',
        'name_en',
        'name_ar',
        'phonecode',
        'flag',
        'currency',
        'is_active',
        'postal_code_required',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'postal_code_required' => 'boolean',
        ];
    }

    public function states(): HasMany
    {
        return $this->hasMany(State::class);
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    public function postalCodes(): HasMany
    {
        return $this->hasMany(PostalCode::class);
    }

    public function localizedName(string $lang): string
    {
        return $lang === 'ar' ? $this->name_ar : $this->name_en;
    }
}
