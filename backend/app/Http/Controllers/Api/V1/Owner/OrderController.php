<?php

namespace App\Http\Controllers\Api\V1\Owner;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Owner\UpdateOrderStatusRequest;
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
        abort_unless($request->user()->isOwner(), 403);

        return ApiResponse::paginated(
            OrderResource::collection($this->orders->listAll($request->all()))
        );
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorize('view', $order);
        $order->load(['items', 'user']);

        return ApiResponse::success(OrderResource::make($order));
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);
        $order = $this->orders->updateStatus(
            $order,
            OrderStatus::from($request->validated('status'))
        );

        return ApiResponse::success(OrderResource::make($order), 'Order status updated');
    }
}
