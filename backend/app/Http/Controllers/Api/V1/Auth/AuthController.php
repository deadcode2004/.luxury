<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Services\UserNameLocaleService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $auth,
        private readonly UserNameLocaleService $names,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->auth->register($request->validated());
        $user = $this->names->ensureLocales($result['user']);

        return ApiResponse::created([
            'user' => UserResource::make($user),
            'token' => $result['token'],
        ], 'Registered successfully');
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->login(
            $request->validated('email'),
            $request->validated('password')
        );
        $user = $this->names->ensureLocales($result['user']);

        return ApiResponse::success([
            'user' => UserResource::make($user),
            'token' => $result['token'],
        ], 'Logged in successfully');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->names->ensureLocales($request->user());

        return ApiResponse::success(UserResource::make($user));
    }

    public function logout(Request $request): JsonResponse
    {
        $this->auth->logout($request->user());

        return ApiResponse::success(null, 'Logged out successfully');
    }
}
