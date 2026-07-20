<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\ChangePasswordRequest;
use App\Http\Requests\Account\UpdateNotificationPreferencesRequest;
use App\Http\Requests\Account\UpdateProfileRequest;
use App\Http\Resources\AddressResource;
use App\Http\Resources\UserResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return ApiResponse::success(UserResource::make($request->user()));
    }

    public function settings(Request $request): JsonResponse
    {
        $timezone = (string) config('app.timezone', 'UTC');

        return ApiResponse::success([
            'user' => UserResource::make($request->user())->resolve(),
            'timezone' => $timezone,
            'timezone_label' => $this->timezoneLabel($timezone),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $user->update([
            ...$data,
            'name' => trim($data['first_name'].' '.$data['last_name']),
        ]);

        return ApiResponse::success(UserResource::make($user->fresh()), 'Profile updated');
    }

    public function updatePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => [__('The current password is incorrect.')],
            ]);
        }

        $user->update([
            'password' => $data['password'],
        ]);

        return ApiResponse::success(null, 'Password updated');
    }

    public function updateNotifications(UpdateNotificationPreferencesRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return ApiResponse::success(UserResource::make($user->fresh()), 'Notification preferences updated');
    }

    public function addresses(Request $request): JsonResponse
    {
        return ApiResponse::success(
            AddressResource::collection($request->user()->addresses()->latest('id')->get())
        );
    }

    private function timezoneLabel(string $timezone): string
    {
        try {
            $now = now($timezone);
            $offset = $now->format('P');

            return sprintf('%s (UTC%s)', $timezone, $offset === 'Z' ? '+00:00' : $offset);
        } catch (\Throwable) {
            return $timezone;
        }
    }
}
