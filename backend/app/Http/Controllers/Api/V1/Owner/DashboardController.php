<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Owner\CustomerService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private readonly CustomerService $customers) {}

    public function __invoke(): JsonResponse
    {
        $recent = Order::query()->with(['user', 'items'])->latest('placed_at')->limit(5)->get();

        return ApiResponse::success([
            'stats' => $this->customers->dashboardStats(),
            'recent_orders' => OrderResource::collection($recent),
        ]);
    }
}
