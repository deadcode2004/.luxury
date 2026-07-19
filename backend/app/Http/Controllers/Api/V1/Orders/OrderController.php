<?php

namespace App\Http\Controllers\Api\V1\Orders;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->orders->listForUser($request->user());

        return ApiResponse::paginated(OrderResource::collection($paginator));
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorize('view', $order);
        $order->load('items');

        return ApiResponse::success(OrderResource::make($order));
    }
}
