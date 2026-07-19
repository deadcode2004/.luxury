<?php

namespace App\Http\Controllers\Api\V1\Checkout;

use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function store(CheckoutRequest $request): JsonResponse
    {
        $order = $this->orders->checkout($request->user(), $request->validated());

        return ApiResponse::created(OrderResource::make($order), 'Order placed successfully');
    }
}
