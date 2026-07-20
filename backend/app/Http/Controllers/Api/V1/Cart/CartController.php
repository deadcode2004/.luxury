<?php

namespace App\Http\Controllers\Api\V1\Cart;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $carts) {}

    public function show(Request $request): JsonResponse
    {
        return ApiResponse::success(
            CartResource::make($this->carts->getCart($request->user()))
        );
    }

    public function store(AddCartItemRequest $request): JsonResponse
    {
        $cart = $this->carts->addItem(
            $request->user(),
            (int) $request->validated('product_id'),
            (int) $request->validated('quantity')
        );

        return ApiResponse::success(CartResource::make($cart), 'Item added to cart');
    }

    public function update(UpdateCartItemRequest $request, int $productId): JsonResponse
    {
        $cart = $this->carts->updateItem(
            $request->user(),
            $productId,
            (int) $request->validated('quantity')
        );

        return ApiResponse::success(CartResource::make($cart), 'Cart updated');
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        $cart = $this->carts->removeItem($request->user(), $productId);

        return ApiResponse::success(CartResource::make($cart), 'Item removed');
    }

    public function clear(Request $request): JsonResponse
    {
        $this->carts->clear($request->user());

        return ApiResponse::success(
            CartResource::make($this->carts->getCart($request->user())),
            'Cart cleared'
        );
    }
}
