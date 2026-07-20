<?php

use App\Http\Controllers\Api\V1\Account\ProfileController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Cart\CartController;
use App\Http\Controllers\Api\V1\Catalog\CategoryController;
use App\Http\Controllers\Api\V1\Catalog\CmsController as PublicCmsController;
use App\Http\Controllers\Api\V1\Catalog\ProductController;
use App\Http\Controllers\Api\V1\Catalog\ReviewController;
use App\Http\Controllers\Api\V1\Checkout\CheckoutController;
use App\Http\Controllers\Api\V1\Orders\OrderController;
use App\Http\Controllers\Api\V1\Owner\CategoryController as OwnerCategoryController;
use App\Http\Controllers\Api\V1\Owner\CmsController as OwnerCmsController;
use App\Http\Controllers\Api\V1\Owner\CouponController;
use App\Http\Controllers\Api\V1\Owner\CustomerController;
use App\Http\Controllers\Api\V1\Owner\DashboardController;
use App\Http\Controllers\Api\V1\Owner\InventoryController;
use App\Http\Controllers\Api\V1\Owner\OrderController as OwnerOrderController;
use App\Http\Controllers\Api\V1\Owner\UploadController;
use App\Http\Controllers\Api\V1\Realtime\RealtimeController;
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

    Route::get('realtime/versions', [RealtimeController::class, 'versions']);
    Route::get('realtime/events', [RealtimeController::class, 'events'])
        ->middleware('auth:sanctum');
    // Public event feed (storefront domains only — controller filters by auth)
    Route::get('realtime/feed', [RealtimeController::class, 'events']);

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show']);
    Route::get('products/{product}/reviews', [ReviewController::class, 'forProduct']);
    Route::get('reviews', [ReviewController::class, 'index']);
    Route::get('cms', [PublicCmsController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('reviews', [ReviewController::class, 'store'])->middleware('throttle:20,1');

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
        Route::get('account/settings', [ProfileController::class, 'settings']);
        Route::put('account/password', [ProfileController::class, 'updatePassword']);
        Route::put('account/notifications', [ProfileController::class, 'updateNotifications']);
        Route::get('account/addresses', [ProfileController::class, 'addresses']);

        Route::prefix('owner')->middleware('owner')->group(function () {
            Route::get('dashboard', DashboardController::class);

            Route::get('inventory', [InventoryController::class, 'index']);
            Route::post('inventory', [InventoryController::class, 'store']);
            Route::put('inventory/{product}', [InventoryController::class, 'update']);
            Route::delete('inventory/{product}', [InventoryController::class, 'destroy']);

            Route::get('categories', [OwnerCategoryController::class, 'index']);
            Route::post('categories', [OwnerCategoryController::class, 'store']);
            Route::post('categories/resolve', [OwnerCategoryController::class, 'resolve']);
            Route::put('categories/{category}', [OwnerCategoryController::class, 'update']);
            Route::delete('categories/{category}', [OwnerCategoryController::class, 'destroy']);

            Route::get('orders', [OwnerOrderController::class, 'index']);
            Route::get('orders/{order}', [OwnerOrderController::class, 'show']);
            Route::patch('orders/{order}/status', [OwnerOrderController::class, 'updateStatus']);

            Route::get('customers', [CustomerController::class, 'index']);

            Route::get('coupons', [CouponController::class, 'index']);
            Route::post('coupons', [CouponController::class, 'store']);
            Route::put('coupons/{coupon}', [CouponController::class, 'update']);
            Route::delete('coupons/{coupon}', [CouponController::class, 'destroy']);

            Route::get('cms', [OwnerCmsController::class, 'show']);
            Route::put('cms', [OwnerCmsController::class, 'update']);

            Route::post('uploads', [UploadController::class, 'store']);
        });
    });
});
