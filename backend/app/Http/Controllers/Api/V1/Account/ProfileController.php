<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Account\UpdateProfileRequest;
use App\Http\Resources\AddressResource;
use App\Http\Resources\UserResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return ApiResponse::success(UserResource::make($request->user()));
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

    public function addresses(Request $request): JsonResponse
    {
        return ApiResponse::success(
            AddressResource::collection($request->user()->addresses()->latest('id')->get())
        );
    }
}
