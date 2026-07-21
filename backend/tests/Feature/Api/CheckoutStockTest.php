<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckoutStockTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_decrements_stock_and_clears_cart(): void
    {
        $user = User::factory()->create(['role' => UserRole::User]);
        $category = Category::query()->create([
            'code' => 'c1',
            'name' => ['ar' => 'أ', 'en' => 'A'],
            'image' => '/i.jpg',
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'code' => 'p1',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 100,
            'image' => '/i.jpg',
            'stock' => 10,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);
        app(CartService::class)->addItem($user, $product->id, 3);

        $response = $this->postJson('/api/v1/checkout', [
            'payment_method' => 'card',
            'first_name' => 'Ahmed',
            'last_name' => 'Mohammad',
            'phone' => '+966501234567',
            'email' => 'ahmed@example.com',
            'shipping_address' => [
                'full_address' => 'Olaya St',
                'city' => 'Riyadh',
                'country_code' => 'SA',
                'country_name' => 'Saudi Arabia',
            ],
        ]);

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertSame(7, $product->fresh()->stock);
        $this->assertDatabaseCount('cart_items', 0);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
    }

    public function test_checkout_fails_when_stock_insufficient(): void
    {
        $user = User::factory()->create(['role' => UserRole::User]);
        $category = Category::query()->create([
            'code' => 'c1',
            'name' => ['ar' => 'أ', 'en' => 'A'],
            'image' => '/i.jpg',
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'code' => 'p1',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 100,
            'image' => '/i.jpg',
            'stock' => 2,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);
        app(CartService::class)->addItem($user, $product->id, 2);

        // Simulate stock change after cart was filled.
        $product->update(['stock' => 1]);

        $this->postJson('/api/v1/checkout', [
            'payment_method' => 'cod',
            'first_name' => 'Ahmed',
            'last_name' => 'Mohammad',
            'phone' => '+966501234567',
            'email' => 'ahmed@example.com',
            'shipping_address' => [
                'full_address' => 'Olaya St',
                'city' => 'Riyadh',
                'country_code' => 'SA',
                'country_name' => 'Saudi Arabia',
            ],
        ])->assertStatus(422)
            ->assertJsonPath('code', 'INSUFFICIENT_STOCK');

        $this->assertSame(1, $product->fresh()->stock);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_guest_checkout_creates_order_without_user(): void
    {
        $category = Category::query()->create([
            'code' => 'c1',
            'name' => ['ar' => 'أ', 'en' => 'A'],
            'image' => '/i.jpg',
            'is_active' => true,
        ]);
        $product = Product::query()->create([
            'code' => 'p1',
            'category_id' => $category->id,
            'name' => ['ar' => 'منتج', 'en' => 'Product'],
            'brand' => ['ar' => 'ب', 'en' => 'B'],
            'price' => 100,
            'image' => '/i.jpg',
            'stock' => 5,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/checkout', [
            'payment_method' => 'card',
            'first_name' => 'Guest',
            'last_name' => 'Buyer',
            'phone' => '+201001234567',
            'email' => 'guest@example.com',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'shipping_address' => [
                'full_address' => 'Nile St',
                'city' => 'Cairo',
                'country_code' => 'EG',
                'country_name' => 'Egypt',
            ],
        ]);

        $response->assertCreated()->assertJsonPath('success', true);
        $this->assertSame(3, $product->fresh()->stock);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('orders', [
            'user_id' => null,
        ]);
        $this->assertTrue((bool) data_get($response->json('data.billing_snapshot'), 'is_guest'));
    }
}
