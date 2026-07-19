<?php

use App\Http\Controllers\Api\V1\Account\ProfileController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Cart\CartController;
use App\Http\Controllers\Api\V1\Catalog\CategoryController;
use App\Http\Controllers\Api\V1\Catalog\ProductController;
use App\Http\Controllers\Api\V1\Checkout\CheckoutController;
use App\Http\Controllers\Api\V1\Orders\OrderController;
use App\Http\Controllers\Api\V1\Owner\CouponController;
use App\Http\Controllers\Api\V1\Owner\CustomerController;
use App\Http\Controllers\Api\V1\Owner\DashboardController;
use App\Http\Controllers\Api\V1\Owner\InventoryController;
use App\Http\Controllers\Api\V1\Owner\OrderController as OwnerOrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::post('logout', [AuthController::class, 'logout']);
        });
    });

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show']);
    Route::get('reviews', [ProductController::class, 'reviews']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('cart', [CartController::class, 'show']);
        Route::post('cart/items', [CartController::class, 'store']);
        Route::patch('cart/items/{productId}', [CartController::class, 'update']);
        Route::delete('cart/items/{productId}', [CartController::class, 'destroy']);
        Route::delete('cart', [CartController::class, 'clear']);

        Route::post('checkout', [CheckoutController::class, 'store'])->middleware('throttle:20,1');

        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);

        Route::get('account/profile', [ProfileController::class, 'show']);
        Route::put('account/profile', [ProfileController::class, 'update']);
        Route::get('account/addresses', [ProfileController::class, 'addresses']);

        Route::prefix('owner')->middleware('owner')->group(function () {
            Route::get('dashboard', DashboardController::class);
            Route::get('inventory', [InventoryController::class, 'index']);
            Route::post('inventory', [InventoryController::class, 'store']);
            Route::put('inventory/{product}', [InventoryController::class, 'update']);
            Route::delete('inventory/{product}', [InventoryController::class, 'destroy']);
            Route::get('orders', [OwnerOrderController::class, 'index']);
            Route::get('orders/{order}', [OwnerOrderController::class, 'show']);
            Route::patch('orders/{order}/status', [OwnerOrderController::class, 'updateStatus']);
            Route::get('customers', [CustomerController::class, 'index']);
            Route::get('coupons', [CouponController::class, 'index']);
            Route::post('coupons', [CouponController::class, 'store']);
            Route::delete('coupons/{coupon}', [CouponController::class, 'destroy']);
        });
    });
});
