<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Address;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::query()->updateOrCreate(
            ['email' => 'owner@paradise.test'],
            [
                'name' => 'Admin User',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '+966500000001',
                'password' => Hash::make('password'),
                'role' => UserRole::Owner,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $user = User::query()->updateOrCreate(
            ['email' => 'ahmed@example.com'],
            [
                'name' => 'أحمد محمد',
                'first_name' => 'أحمد',
                'last_name' => 'محمد',
                'phone' => '+966501234567',
                'password' => Hash::make('password'),
                'role' => UserRole::User,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        Address::query()->updateOrCreate(
            ['user_id' => $user->id, 'label' => 'Home'],
            [
                'full_address' => '123 Olaya St, Riyadh, Saudi Arabia',
                'city' => 'Riyadh',
                'is_default' => true,
            ]
        );

        Address::query()->updateOrCreate(
            ['user_id' => $user->id, 'label' => 'Work'],
            [
                'full_address' => 'King Abdullah Financial District, Riyadh',
                'city' => 'Riyadh',
                'is_default' => false,
            ]
        );

        Coupon::query()->updateOrCreate(
            ['code' => 'SUMMER20'],
            [
                'type' => 'percentage',
                'value' => 20,
                'uses' => 45,
                'max_uses' => 100,
                'expires_at' => '2026-12-31',
                'is_active' => true,
            ]
        );

        Coupon::query()->updateOrCreate(
            ['code' => 'WELCOME'],
            [
                'type' => 'fixed',
                'value' => 50,
                'uses' => 120,
                'max_uses' => null,
                'expires_at' => '2026-12-31',
                'is_active' => true,
            ]
        );

        unset($owner);
    }
}
