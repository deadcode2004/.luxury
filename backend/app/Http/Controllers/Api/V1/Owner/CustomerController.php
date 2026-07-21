<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\Owner\CustomerService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(private readonly CustomerService $customers) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->isOwner(), 403);

        return ApiResponse::paginated(
            UserResource::collection($this->customers->list($request->all()))
        );
    }
}
