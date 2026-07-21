<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\Owner\CustomerService;
use App\Services\UserNameLocaleService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly CustomerService $customers,
        private readonly UserNameLocaleService $names,
    ) {}

    public function __invoke(): JsonResponse
    {
        $recent = Order::query()->with(['user', 'items'])->latest('placed_at')->limit(5)->get()
            ->map(function (Order $order) {
                if ($order->relationLoaded('user') && $order->user instanceof User) {
                    $order->setRelation('user', $this->names->ensureLocales($order->user));
                }

                return $order;
            });

        $lowStock = Product::query()
            ->with('category')
            ->where('is_active', true)
            ->where('stock', '<=', 15)
            ->orderBy('stock')
            ->limit(8)
            ->get();

        return ApiResponse::success([
            'stats' => $this->customers->dashboardStats(),
            'recent_orders' => OrderResource::collection($recent),
            'low_stock_products' => ProductResource::collection($lowStock),
        ]);
    }
}
