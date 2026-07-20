<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Exceptions\DomainException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * @param  array{name?: string, first_name: string, last_name: string, email: string, phone?: string|null, password: string}  $data
     * @return array{user: User, token: string}
     */
    public function register(array $data): array
    {
        $user = User::query()->create([
            'name' => trim(($data['first_name'] ?? '').' '.($data['last_name'] ?? '')) ?: ($data['name'] ?? 'User'),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role' => UserRole::User,
            'is_active' => true,
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return compact('user', 'token');
    }

    /**
     * @return array{user: User, token: string}
     */
    public function login(string $email, string $password): array
    {
        /** @var User|null $user */
        $user = User::query()->where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw new DomainException('Invalid credentials.', 401, 'INVALID_CREDENTIALS');
        }

        if (! $user->is_active) {
            throw new DomainException('Account is inactive.', 403, 'ACCOUNT_INACTIVE');
        }

        $token = $user->createToken('api')->plainTextToken;

        return compact('user', 'token');
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
