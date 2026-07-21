<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'name_i18n',
        'first_name',
        'first_name_i18n',
        'last_name',
        'last_name_i18n',
        'email',
        'phone',
        'avatar',
        'password',
        'role',
        'is_active',
        'notify_orders',
        'notify_stock',
        'notify_marketing',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
            'notify_orders' => 'boolean',
            'notify_stock' => 'boolean',
            'notify_marketing' => 'boolean',
            'name_i18n' => 'array',
            'first_name_i18n' => 'array',
            'last_name_i18n' => 'array',
        ];
    }

    public function isOwner(): bool
    {
        return $this->role === UserRole::Owner;
    }

    public function isUser(): bool
    {
        return $this->role === UserRole::User;
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }
}
